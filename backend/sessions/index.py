"""
API для управления сессиями: список, старт, завершение.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = 't_p52075342_pc_admin_dashboard'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            status_filter = params.get('status', '')
            query = f"""
                SELECT s.id, s.pc_id, s.client_id, s.tariff_id, s.game, s.status,
                  s.started_at, s.ended_at, s.duration_minutes, s.cost,
                  p.name as pc_name, p.zone,
                  c.name as client_name,
                  t.name as tariff_name, t.price_per_hour,
                  EXTRACT(EPOCH FROM (COALESCE(s.ended_at, NOW()) - s.started_at))/60 as duration_calc
                FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.pcs p ON p.id = s.pc_id
                LEFT JOIN {SCHEMA}.clients c ON c.id = s.client_id
                LEFT JOIN {SCHEMA}.tariffs t ON t.id = s.tariff_id
            """
            if status_filter:
                query += f" WHERE s.status = '{status_filter}'"
            query += " ORDER BY s.started_at DESC LIMIT 100"
            cur.execute(query)
            rows = cur.fetchall()
            result = []
            for r in rows:
                row = dict(r)
                if row.get('started_at'):
                    row['started_at'] = row['started_at'].isoformat()
                if row.get('ended_at'):
                    row['ended_at'] = row['ended_at'].isoformat()
                result.append(row)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result, ensure_ascii=False)}

        if method == 'POST' and len(parts) <= 1:
            body = json.loads(event.get('body') or '{}')
            pc_id = body['pc_id']
            client_id = body.get('client_id')
            tariff_id = body.get('tariff_id')
            game = body.get('game', '')
            cur.execute(f"""
                UPDATE {SCHEMA}.sessions SET status='completed', ended_at=NOW()
                WHERE pc_id = %s AND status = 'active'
            """, (pc_id,))
            cur.execute(f"""
                INSERT INTO {SCHEMA}.sessions (pc_id, client_id, tariff_id, game, status)
                VALUES (%s, %s, %s, %s, 'active') RETURNING id, started_at
            """, (pc_id, client_id, tariff_id, game))
            row = dict(cur.fetchone())
            row['started_at'] = row['started_at'].isoformat()
            cur.execute(f"""
                INSERT INTO {SCHEMA}.pc_commands (pc_id, command, params)
                VALUES (%s, 'unlock', %s)
            """, (pc_id, json.dumps({'session_id': row['id']})))
            conn.commit()
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(row)}

        if method == 'POST' and len(parts) == 3 and parts[2] == 'end':
            session_id = int(parts[1])
            cur.execute(f"""
                SELECT s.*, t.price_per_hour FROM {SCHEMA}.sessions s
                LEFT JOIN {SCHEMA}.tariffs t ON t.id = s.tariff_id
                WHERE s.id = %s
            """, (session_id,))
            session = cur.fetchone()
            if not session:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
            duration = int((datetime.now(session['started_at'].tzinfo) - session['started_at']).total_seconds() / 60)
            price = session['price_per_hour'] or 0
            cost = int(duration / 60 * price)
            cur.execute(f"""
                UPDATE {SCHEMA}.sessions
                SET status='completed', ended_at=NOW(), duration_minutes=%s, cost=%s WHERE id=%s
            """, (duration, cost, session_id))
            if session['client_id']:
                cur.execute(f"UPDATE {SCHEMA}.clients SET balance=balance-%s WHERE id=%s", (cost, session['client_id']))
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.transactions (client_id, amount, type, description)
                    VALUES (%s, %s, 'session', %s)
                """, (session['client_id'], -cost, f'Сессия ПК#{session["pc_id"]}'))
            cur.execute(f"""
                INSERT INTO {SCHEMA}.pc_commands (pc_id, command, params) VALUES (%s, 'lock', '{{}}')
            """, (session['pc_id'],))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'cost': cost, 'duration': duration})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
