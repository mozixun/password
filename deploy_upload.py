#!/usr/bin/env python3
"""上传 VaultKey 部署包到服务器"""
import hmac
import hashlib
import time
import urllib.request
import json
import os

BASE_URL = 'http://124.222.162.174:8090'
API_KEY = 'UTeDuLgGKaDI3GBZl3sLFyDjwSdsGHGk'
CHUNKS_DIR = '/tmp'
CHUNK_PREFIX = 'chunk_new_'
REMOTE_DIR = '/opt/vaultkey-deploy-chunks'

def call_api(path, method='GET', data=None, timeout=60):
    ts = str(int(time.time()))
    token = hmac.new(API_KEY.encode(), f'1panel:{ts}'.encode(), hashlib.sha256).hexdigest()
    url = BASE_URL + '/api/v2' + path
    headers = {
        '1Panel-Token': token,
        '1Panel-Timestamp': ts,
        'Content-Type': 'application/json'
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode()
            try:
                return json.loads(raw)
            except:
                return {'code': -1, 'raw': raw[:200]}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return json.loads(raw)
        except:
            return {'code': e.code, 'raw': raw[:200]}
    except Exception as e:
        return {'code': 0, 'error': str(e)}

def create_dir(path):
    return call_api('/files', 'POST', {'path': path, 'isDir': True, 'mode': 755})

def create_file(path, content):
    result = call_api('/files', 'POST', {'path': path, 'isDir': False, 'mode': 644})
    if result.get('code') != 200:
        return result
    return call_api('/files/save', 'POST', {'path': path, 'content': content})

# 1. 创建远程目录
print('1. 创建远程目录...')
create_dir(REMOTE_DIR)

# 2. 上传块文件
chunk_files = sorted([f for f in os.listdir(CHUNKS_DIR) if f.startswith(CHUNK_PREFIX)])
print(f'2. 上传 {len(chunk_files)} 个块文件...')

success = 0
for i, chunk_file in enumerate(chunk_files):
    chunk_path = os.path.join(CHUNKS_DIR, chunk_file)
    with open(chunk_path, 'r') as f:
        content = f.read()

    remote_path = f'{REMOTE_DIR}/{chunk_file}'
    result = create_file(remote_path, content)
    if result.get('code') == 200:
        print(f'   [{i+1}/{len(chunk_files)}] {chunk_file} ({len(content)} bytes) - OK')
        success += 1
    else:
        print(f'   [{i+1}/{len(chunk_files)}] {chunk_file} - FAILED: {result.get("message", result.get("raw", "unknown"))[:80]}')

print(f'\n块上传完成: {success}/{len(chunk_files)} 成功')

# 3. 上传解压脚本
print('\n3. 上传解压脚本...')
script = '''#!/bin/bash
set -e
DEPLOY_DIR="/opt/vaultkey"
CHUNKS_DIR="/opt/vaultkey-deploy-chunks"

echo "=== VaultKey Deployment ==="
mkdir -p $DEPLOY_DIR

echo "Combining chunks..."
cat $CHUNKS_DIR/chunk_new_* > /tmp/vaultkey-deploy.b64

echo "Decoding..."
base64 -d /tmp/vaultkey-deploy.b64 > /tmp/vaultkey-deploy.tar.gz

echo "Extracting to $DEPLOY_DIR..."
tar -xzf /tmp/vaultkey-deploy.tar.gz -C $DEPLOY_DIR

echo "Cleaning up..."
rm -f /tmp/vaultkey-deploy.b64 /tmp/vaultkey-deploy.tar.gz

echo "Files extracted:"
ls -la $DEPLOY_DIR/

echo "=== Ready for docker-compose up -d ==="
'''

result = create_file('/opt/vaultkey-deploy.sh', script)
print(f'   脚本上传: code={result.get("code")}, msg={result.get("message", "")[:50]}')

# 4. 设置脚本可执行
result = call_api('/files/mode', 'POST', {'path': '/opt/vaultkey-deploy.sh', 'mode': '755'})
print(f'   设置权限: code={result.get("code")}, msg={result.get("message", "")[:50]}')

# 5. 创建定时任务执行解压
print('\n4. 创建定时任务执行解压...')
cron_data = {
    'name': 'vaultkey-extract',
    'spec': '* * * * *',
    'command': 'bash /opt/vaultkey-deploy.sh',
    'script': 'bash /opt/vaultkey-deploy.sh',
    'type': 'shell',
    'webhook': '',
    'successMsg': '',
    'errorMsg': '',
    'retry': 0,
    'timeout': 120,
    'exclusion': False,
    'groupID': 0,
    'exitWhenFail': True,
    'retainCopies': 1,
}
result = call_api('/cronjobs', 'POST', cron_data)
print(f'   创建任务: code={result.get("code")}, msg={result.get("message", "")[:50]}')

# 查找并执行
result = call_api('/cronjobs/search', 'POST', {'page': 1, 'pageSize': 20, 'orderBy': 'name', 'order': 'ascending'})
if result.get('code') == 200:
    items = result.get('data', {}).get('items', []) or []
    for item in items:
        if 'vaultkey-extract' in item.get('name', '').lower():
            tid = item.get('id')
            print(f'   执行任务 ID={tid}...')
            r = call_api('/cronjobs/handle', 'POST', {'id': tid})
            print(f'   执行结果: code={r.get("code")}, msg={r.get("message", "")[:50]}')
            break

print('\n=== 文件上传完成 ===')
print('部署文件已上传到 /opt/vaultkey-deploy-chunks/')
print('解压脚本已上传到 /opt/vaultkey-deploy.sh')
print('请手动启动 Docker 后执行: cd /opt/vaultkey && docker-compose up -d')
