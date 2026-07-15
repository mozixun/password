#!/usr/bin/env python3
"""上传 VaultKey 所有文件到服务器"""
import hmac
import hashlib
import time
import urllib.request
import json
import os

BASE_URL = 'http://124.222.162.174:8090'
API_KEY = 'UTeDuLgGKaDI3GBZl3sLFyDjwSdsGHGk'

def call_api(path, method='GET', data=None, timeout=120):
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

def ensure_dir(path):
    """确保目录存在"""
    r = call_api('/files', 'POST', {'path': path, 'isDir': True, 'mode': 755})
    return r.get('code') == 200 or '已存在' in r.get('message', '')

def upload_file(local_path, remote_path):
    """上传单个文件"""
    # 创建父目录
    parent = os.path.dirname(remote_path)
    if parent and parent != '/opt/vaultkey':
        ensure_dir(parent)

    # 读取内容
    with open(local_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # 创建空文件
    r = call_api('/files', 'POST', {'path': remote_path, 'isDir': False, 'mode': 644})
    if r.get('code') != 200:
        # 可能已存在，尝试保存
        pass

    # 保存内容
    r = call_api('/files/save', 'POST', {'path': remote_path, 'content': content})
    return r.get('code') == 200, len(content)

# 收集文件
files_to_upload = []

# dist/ 目录
for root, dirs, files in os.walk('dist'):
    for f in files:
        local_path = os.path.join(root, f)
        rel_path = os.path.relpath(local_path, '.')
        remote_path = '/opt/vaultkey/' + rel_path
        files_to_upload.append((local_path, remote_path))

# api/ 目录
for root, dirs, files in os.walk('api'):
    for f in files:
        local_path = os.path.join(root, f)
        rel_path = os.path.relpath(local_path, '.')
        remote_path = '/opt/vaultkey/' + rel_path
        files_to_upload.append((local_path, remote_path))

# public/ 目录
for root, dirs, files in os.walk('public'):
    for f in files:
        local_path = os.path.join(root, f)
        rel_path = os.path.relpath(local_path, '.')
        remote_path = '/opt/vaultkey/' + rel_path
        files_to_upload.append((local_path, remote_path))

# 根级文件
for f in ['docker-compose.yml', 'nginx.conf', 'Dockerfile.frontend', 'Dockerfile.backend',
          'package.json', 'package-lock.json', 'tsconfig.json']:
    if os.path.exists(f):
        files_to_upload.append((f, '/opt/vaultkey/' + f))

print(f'总共需要上传 {len(files_to_upload)} 个文件')
print('=' * 50)

success = 0
failed = 0
for i, (local_path, remote_path) in enumerate(files_to_upload):
    ok, size = upload_file(local_path, remote_path)
    if ok:
        success += 1
        print(f'  [{i+1}/{len(files_to_upload)}] OK {size:>7} bytes - {os.path.basename(local_path)}')
    else:
        failed += 1
        print(f'  [{i+1}/{len(files_to_upload)}] FAIL - {os.path.basename(local_path)}')

print('=' * 50)
print(f'上传完成: {success} 成功, {failed} 失败')
