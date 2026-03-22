"""
API для управления тарифами: список, создание, обновление, удаление.
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
        # GET /tariffs
        if method == 'GET':
            cur.execute(f"SELECT * FROM {SCHEMA}.tariffs WHERE active = TRUE ORDER BY zone, price_per_hour")
            rows = [dict(r) for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(rows, ensure_ascii=False)}

        # POST /tariffs
        if method == 'POST' and len(parts) <= 1:
            body = json.loads(event.get('body') or '{}')
            cur.execute(f"""
                INSERT INTO {SCHEMA}.tariffs (name, zone, price_per_hour, min_time, color, popular)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                body['name'], body['zone'], body['price_per_hour'],
                body.get('min_time', 1), body.get('color', '#00ffff'),
                body.get('popular', False)
            ))
            row = dict(cur.fetchone())
            conn.commit()
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(row, ensure_ascii=False)}

        # PUT /tariffs/{id}
        if method == 'PUT' and len(parts) == 2:
            tariff_id = int(parts[1])
            body = json.loads(event.get('body') or '{}')
            cur.execute(f"""
                UPDATE {SCHEMA}.tariffs
                SET name=%s, price_per_hour=%s, min_time=%s, popular=%s
                WHERE id=%s
                RETURNING *
            """, (body['name'], body['price_per_hour'], body.get('min_time', 1), body.get('popular', False), tariff_id))
            row = dict(cur.fetchone())
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(row, ensure_ascii=False)}

        # DELETE /tariffs/{id}
        if method == 'DELETE' and len(parts) == 2:
            tariff_id = int(parts[1])
            cur.execute(f"UPDATE {SCHEMA}.tariffs SET active = FALSE WHERE id = %s", (tariff_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
