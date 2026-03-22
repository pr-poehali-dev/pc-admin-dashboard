"""
Endpoint для агента на ПК: heartbeat, получение команд, отчёт о выполнении, загрузка скриншотов.
Агент на каждом ПК каждые 5 секунд делает POST /agent/heartbeat с токеном.
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

    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]
    action = parts[-1] if parts else ''

    # Токен читаем из body (заголовки фильтруются платформой)
    try:
        _body_for_token = json.loads(event.get('body') or '{}')
    except Exception:
        _body_for_token = {}
    token = _body_for_token.get('token', '')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Проверяем токен агента
        cur.execute(f"SELECT * FROM {SCHEMA}.pcs WHERE agent_token = %s", (token,))
        pc = cur.fetchone()
        if not pc:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Invalid token'})}

        pc_id = pc['id']

        # POST /agent/heartbeat — агент сообщает что живёт + отдаём команды
        if action == 'heartbeat':
            body = json.loads(event.get('body') or '{}')
            status = body.get('status', 'idle')
            ip = body.get('ip', '')
            active_window = body.get('active_window', '')

            cur.execute(f"""
                UPDATE {SCHEMA}.pcs
                SET status = %s, ip = %s, last_seen = NOW()
                WHERE id = %s
            """, (status, ip, pc_id))

            # Берём pending-команды для этого ПК
            cur.execute(f"""
                SELECT id, command, params FROM {SCHEMA}.pc_commands
                WHERE pc_id = %s AND status = 'pending'
                ORDER BY created_at
                LIMIT 5
            """, (pc_id,))
            commands = [dict(r) for r in cur.fetchall()]

            # Помечаем как sent
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

        # POST /agent/result — агент отчитывается о выполнении команды
        if action == 'result':
            body = json.loads(event.get('body') or '{}')
            cmd_id = body.get('command_id')
            result = body.get('result', {})
            cur.execute(f"""
                UPDATE {SCHEMA}.pc_commands
                SET status = 'done', executed_at = NOW(), result = %s
                WHERE id = %s AND pc_id = %s
            """, (json.dumps(result), cmd_id, pc_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # POST /agent/screenshot — агент загружает скриншот
        if action == 'screenshot':
            body = json.loads(event.get('body') or '{}')
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

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        cur.close()
        conn.close()