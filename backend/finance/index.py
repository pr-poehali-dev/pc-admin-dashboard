"""
API для финансовой статистики: доход по дням, транзакции.
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]
    action = parts[1] if len(parts) >= 2 else 'stats'

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET /finance/stats
        if action == 'stats':
            cur.execute(f"""
                SELECT
                  COALESCE(SUM(CASE WHEN type='deposit' THEN amount ELSE 0 END), 0) as total_deposits,
                  COALESCE(SUM(CASE WHEN type='session' THEN ABS(amount) ELSE 0 END), 0) as total_sessions,
                  COALESCE(SUM(CASE WHEN type='refund' THEN amount ELSE 0 END), 0) as total_refunds,
                  COUNT(CASE WHEN type='session' THEN 1 END) as session_count
                FROM {SCHEMA}.transactions
                WHERE created_at >= CURRENT_DATE
            """)
            stats = dict(cur.fetchone())

            # Доход по дням (последние 7)
            cur.execute(f"""
                SELECT
                  DATE(created_at) as day,
                  SUM(CASE WHEN type='session' THEN ABS(amount) ELSE 0 END) as income,
                  COUNT(CASE WHEN type='session' THEN 1 END) as sessions
                FROM {SCHEMA}.transactions
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY day
            """)
            week = [dict(r) for r in cur.fetchall()]
            for w in week:
                w['day'] = w['day'].isoformat()

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'stats': stats, 'week': week}, ensure_ascii=False)}

        # GET /finance/transactions
        if action == 'transactions':
            cur.execute(f"""
                SELECT t.*, c.name as client_name
                FROM {SCHEMA}.transactions t
                LEFT JOIN {SCHEMA}.clients c ON c.id = t.client_id
                ORDER BY t.created_at DESC
                LIMIT 50
            """)
            rows = []
            for r in cur.fetchall():
                row = dict(r)
                row['created_at'] = row['created_at'].isoformat()
                rows.append(row)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(rows, ensure_ascii=False)}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
