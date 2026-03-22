"""
API для управления ПК: список, добавление, удаление, отправка команд.
"""
import json
import os
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p52075342_pc_admin_dashboard'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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
        # GET /pcs — список всех ПК
        if method == 'GET' and len(parts) <= 1:
            cur.execute(f"""
                SELECT p.*,
                  CASE
                    WHEN p.last_seen IS NULL THEN 'offline'
                    WHEN NOW() - p.last_seen > INTERVAL '15 seconds' THEN 'offline'
                    ELSE p.status
                  END AS status,
                  s.id as session_id, s.started_at, s.game,
                  c.name as client_name,
                  t.price_per_hour
                FROM {SCHEMA}.pcs p
                LEFT JOIN {SCHEMA}.sessions s ON s.pc_id = p.id AND s.status = 'active'
                LEFT JOIN {SCHEMA}.clients c ON c.id = s.client_id
                LEFT JOIN {SCHEMA}.tariffs t ON t.id = s.tariff_id
                ORDER BY p.id
            """)
            rows = cur.fetchall()
            pcs = []
            for r in rows:
                pc = dict(r)
                if pc['last_seen']:
                    pc['last_seen'] = pc['last_seen'].isoformat()
                if pc['started_at']:
                    pc['started_at'] = pc['started_at'].isoformat()
                if pc['created_at']:
                    pc['created_at'] = pc['created_at'].isoformat()
                pc.pop('agent_token', None)
                pcs.append(pc)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(pcs, ensure_ascii=False)}

        # POST /pcs — добавить ПК
        if method == 'POST' and len(parts) <= 1:
            body = json.loads(event.get('body') or '{}')
            token = secrets.token_hex(32)
            cur.execute(f"""
                INSERT INTO {SCHEMA}.pcs (name, zone, specs_cpu, specs_gpu, specs_ram, agent_token)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, name, zone, agent_token
            """, (
                body['name'], body.get('zone', 'Стандарт'),
                body.get('cpu', ''), body.get('gpu', ''), body.get('ram', ''),
                token
            ))
            row = dict(cur.fetchone())
            conn.commit()
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(row, ensure_ascii=False)}

        # DELETE /pcs/{id}
        if method == 'DELETE' and len(parts) == 2:
            pc_id = int(parts[1])
            cur.execute(f"DELETE FROM {SCHEMA}.pcs WHERE id = %s", (pc_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # POST /pcs/{id}/command — отправить команду
        if method == 'POST' and len(parts) == 3 and parts[2] == 'command':
            pc_id = int(parts[1])
            body = json.loads(event.get('body') or '{}')
            command = body.get('command')
            params = body.get('params', {})
            cur.execute(f"""
                INSERT INTO {SCHEMA}.pc_commands (pc_id, command, params, status)
                VALUES (%s, %s, %s, 'pending')
                RETURNING id
            """, (pc_id, command, json.dumps(params)))
            cmd_id = cur.fetchone()['id']
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'command_id': cmd_id})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()