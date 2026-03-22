"""
API для управления клиентами: список, добавление, пополнение баланса.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

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
        # GET /clients
        if method == 'GET' and len(parts) <= 1:
            cur.execute(f"""
                SELECT c.*,
                  (SELECT MAX(s.started_at) FROM {SCHEMA}.sessions s WHERE s.client_id = c.id) as last_visit
                FROM {SCHEMA}.clients c
                ORDER BY c.total_spent DESC
            """)
            rows = cur.fetchall()
            result = []
            for r in rows:
                row = dict(r)
                if row.get('created_at'):
                    row['created_at'] = row['created_at'].isoformat()
                if row.get('last_visit'):
                    row['last_visit'] = row['last_visit'].isoformat()
                result.append(row)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result, ensure_ascii=False)}

        # POST /clients — добавить клиента
        if method == 'POST' and len(parts) <= 1:
            body = json.loads(event.get('body') or '{}')
            cur.execute(f"""
                INSERT INTO {SCHEMA}.clients (name, phone, balance)
                VALUES (%s, %s, %s)
                RETURNING *
            """, (body['name'], body.get('phone', ''), body.get('balance', 0)))
            row = dict(cur.fetchone())
            row['created_at'] = row['created_at'].isoformat()
            conn.commit()
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(row, ensure_ascii=False)}

        # POST /clients/{id}/deposit — пополнить баланс
        if method == 'POST' and len(parts) == 3 and parts[2] == 'deposit':
            client_id = int(parts[1])
            body = json.loads(event.get('body') or '{}')
            amount = int(body.get('amount', 0))
            if amount <= 0:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Amount must be positive'})}

            cur.execute(f"""
                UPDATE {SCHEMA}.clients SET balance = balance + %s WHERE id = %s
                RETURNING balance
            """, (amount, client_id))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Client not found'})}

            cur.execute(f"""
                INSERT INTO {SCHEMA}.transactions (client_id, amount, type, description)
                VALUES (%s, %s, 'deposit', 'Пополнение счёта')
            """, (client_id, amount))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'balance': row['balance']})}

        # DELETE /clients/{id}
        if method == 'DELETE' and len(parts) == 2:
            client_id = int(parts[1])
            cur.execute(f"DELETE FROM {SCHEMA}.clients WHERE id = %s", (client_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
