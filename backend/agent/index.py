"""
Единый endpoint для агента на ПК.
Все запросы идут на POST /, тип действия передаётся в поле action тела:
  {"action": "heartbeat", "token": "...", ...}
  {"action": "result",    "token": "...", "command_id": 1, "result": {...}}
  {"action": "screenshot","token": "...", "image": "<base64>"}
"""
import json
import os
import base64
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = 't_p52075342_pc_admin_dashboard'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Agent-Token',
}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        body = {}

    token = body.get('token', '')
    action = body.get('action', '')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(f"SELECT * FROM {SCHEMA}.pcs WHERE agent_token = %s", (token,))
        pc = cur.fetchone()
        if not pc:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Invalid token'})}

        pc_id = pc['id']

        if action == 'heartbeat':
            status = body.get('status', 'idle')
            ip = body.get('ip', '')

            cur.execute(f"""
                UPDATE {SCHEMA}.pcs
                SET status = %s, ip = %s, last_seen = NOW()
                WHERE id = %s
            """, (status, ip, pc_id))

            cur.execute(f"""
                SELECT id, command, params FROM {SCHEMA}.pc_commands
                WHERE pc_id = %s AND status = 'pending'
                ORDER BY created_at
                LIMIT 5
            """, (pc_id,))
            commands = [dict(r) for r in cur.fetchall()]

            if commands:
                ids = [c['id'] for c in commands]
                cur.execute(f"""
                    UPDATE {SCHEMA}.pc_commands SET status = 'sent'
                    WHERE id = ANY(%s)
                """, (ids,))

            conn.commit()
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'ok': True, 'commands': commands})
            }

        if action == 'result':
            cmd_id = body.get('command_id')
            result = body.get('result', {})
            cur.execute(f"""
                UPDATE {SCHEMA}.pc_commands
                SET status = 'done', executed_at = NOW(), result = %s
                WHERE id = %s AND pc_id = %s
            """, (json.dumps(result), cmd_id, pc_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if action == 'screenshot':
            image_b64 = body.get('image')
            if not image_b64:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'No image'})}

            image_data = base64.b64decode(image_b64)
            filename = f"screenshots/pc_{pc_id}_{int(datetime.now().timestamp())}.jpg"

            s3 = boto3.client(
                's3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            s3.put_object(Bucket='files', Key=filename, Body=image_data, ContentType='image/jpeg')
            url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"

            cur.execute(f"""
                INSERT INTO {SCHEMA}.screenshots (pc_id, url) VALUES (%s, %s) RETURNING id
            """, (pc_id, url))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'url': url})}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        cur.close()
        conn.close()
