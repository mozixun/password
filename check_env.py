import hmac, hashlib, time, urllib.request, json

BASE_URL = 'http://124.222.162.174:8090'
API_KEY = 'UTeDuLgGKaDI3GBZl3sLFyDjwSdsGHGk'

def call_api(path, method='GET', data=None, timeout=30):
    ts = str(int(time.time()))
    token = hmac.new(API_KEY.encode(), f'1panel:{ts}'.encode(), hashlib.sha256).hexdigest()
    url = BASE_URL + '/api/v2' + path
    headers = {'1Panel-Token': token, '1Panel-Timestamp': ts, 'Content-Type': 'application/json'}
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode()
            try: return json.loads(raw)
            except: return {'code': -1, 'raw': raw[:200]}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: return json.loads(raw)
        except: return {'code': e.code, 'raw': raw[:200]}
    except Exception as e:
        return {'code': 0, 'error': str(e)}

# 检查常见路径
paths = [
    '/usr/bin/node', '/usr/local/bin/node', '/usr/bin/nodejs',
    '/usr/bin/nginx', '/usr/sbin/nginx', '/usr/local/bin/nginx',
    '/usr/bin/docker', '/usr/bin/dockerd',
    '/usr/bin/npm', '/usr/local/bin/npm',
    '/usr/bin/npx', '/usr/local/bin/npx',
]

print('=== 检查宿主机可执行文件 ===')
for p in paths:
    r = call_api('/files/check', 'POST', {'path': p})
    exists = r.get('data', False) if r.get('code') == 200 else False
    status = '[存在]' if exists else '[不存在]'
    print(f'  {status} {p}')

# 检查 /opt/1panel 目录结构
print()
print('=== /opt/1panel 结构 ===')
r = call_api('/files/search', 'POST', {'path': '/opt/1panel', 'page': 1, 'pageSize': 20, 'expand': True})
if r.get('code') == 200:
    items = r.get('data', {}).get('items', []) or []
    for item in items:
        name = item.get('name', '?')
        is_dir = item.get('isDir', False)
        dir_mark = '(dir)' if is_dir else ''
        print(f'  {name} {dir_mark}')
