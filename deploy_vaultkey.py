#!/usr/bin/env python3
import os
import hmac
import hashlib
import time
import urllib.request
import json
import base64
import sys

# 配置
BASE_URL = 'http://124.222.162.174:22423'
API_KEY = 'xx1IOF2hj7rtRdmk330onYtheKXtdnjx'
PROJECT_DIR = '/opt/vaultkey'
DOMAIN = 'vaultkey.mozixun.com'
LOCAL_DIR = '/workspace'

def call_api(path, method='GET', data=None, timeout=60):
    """调用 1Panel API"""
    timestamp = str(int(time.time()))
    token = hmac.new(API_KEY.encode(), f'1panel:{timestamp}'.encode(), hashlib.sha256).hexdigest()
    
    url = BASE_URL + path
    headers = {
        '1Panel-Token': token,
        '1Panel-Timestamp': timestamp,
        'Content-Type': 'application/json'
    }
    
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            resp_body = resp.read().decode()
            try:
                return {
                    'status': resp.status,
                    'body': json.loads(resp_body)
                }
            except:
                return {
                    'status': resp.status,
                    'body': resp_body
                }
    except urllib.error.HTTPError as e:
        return {
            'status': e.code,
            'body': e.read().decode()
        }
    except Exception as e:
        return {
            'status': 0,
            'body': str(e)
        }

def create_dir(path):
    """创建目录"""
    parent = os.path.dirname(path)
    name = os.path.basename(path)
    result = call_api('/api/v2/files', 'POST', {
        'path': parent + '/',
        'name': name,
        'type': 'dir'
    })
    return result

def upload_file(local_path, remote_path):
    """上传文件 - 使用文件保存 API"""
    # 读取文件内容
    with open(local_path, 'rb') as f:
        content = f.read()
    
    # 尝试用 base64 编码
    try:
        content_str = content.decode('utf-8')
    except:
        content_str = base64.b64encode(content).decode()
    
    # 获取远程目录
    remote_dir = os.path.dirname(remote_path)
    remote_name = os.path.basename(remote_path)
    
    # 尝试使用文件保存 API
    result = call_api('/api/v2/files/save', 'POST', {
        'path': remote_path,
        'content': content_str
    })
    
    return result

def check_file_exists(path):
    """检查文件是否存在"""
    result = call_api('/api/v2/files/search', 'POST', {
        'path': path,
        'page': 1,
        'pageSize': 1
    })
    if result['status'] == 200 and isinstance(result['body'], dict):
        if result['body'].get('code') == 200:
            data = result['body']['data']
            return data.get('name') == os.path.basename(path)
    return False

def list_dir(path):
    """列出目录内容"""
    result = call_api('/api/v2/files/search', 'POST', {
        'path': path,
        'page': 1,
        'pageSize': 100
    })
    items = []
    if result['status'] == 200 and isinstance(result['body'], dict):
        if result['body'].get('code') == 200:
            data = result['body']['data']
            if data.get('items'):
                items = data['items']
    return items

def main():
    print("=" * 60)
    print("VaultKey 部署脚本")
    print("=" * 60)
    
    # 步骤 1: 检查 1Panel 连接
    print("\n步骤 1: 检查 1Panel 连接...")
    result = call_api('/api/v2/health/check')
    if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
        print("  1Panel API 连接成功")
    else:
        print("  1Panel API 连接失败")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return
    
    # 步骤 2: 检查 Docker 状态
    print("\n步骤 2: 检查 Docker 状态...")
    result = call_api('/api/v2/containers/docker/status')
    if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
        data = result['body']['data']
        print(f"  Docker 已安装: {data.get('isExist')}")
        print(f"  Docker 运行中: {data.get('isActive')}")
        if not data.get('isActive'):
            print("  Docker 未运行，正在启动...")
            call_api('/api/v2/containers/docker/operate', 'POST', {'operation': 'start'})
    else:
        print("  无法获取 Docker 状态")
        return
    
    # 步骤 3: 创建项目目录结构
    print("\n步骤 3: 创建项目目录结构...")
    
    # 先检查 vaultkey 目录是否存在
    opt_items = list_dir('/opt')
    vaultkey_exists = any(item['name'] == 'vaultkey' for item in opt_items)
    
    if not vaultkey_exists:
        result = create_dir(PROJECT_DIR)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"  {PROJECT_DIR} 创建成功")
        else:
            print(f"  {PROJECT_DIR} 创建失败")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return
    else:
        print(f"  {PROJECT_DIR} 已存在")
    
    # 创建子目录
    subdirs = [
        'api',
        'api/routes',
        'src',
        'src/assets',
        'src/components',
        'src/hooks',
        'src/i18n',
        'src/i18n/locales',
        'src/lib',
        'src/pages',
        'src/pages/docs',
        'src/store',
        'src/types',
        'src/utils',
        'public'
    ]
    
    for subdir in subdirs:
        dir_path = os.path.join(PROJECT_DIR, subdir)
        result = create_dir(dir_path)
        if isinstance(result['body'], dict):
            if result['body'].get('code') == 200:
                print(f"  创建 {subdir}/ 成功")
            elif '已存在' in result['body'].get('message', ''):
                print(f"  {subdir}/ 已存在")
            else:
                print(f"  创建 {subdir}/ 提示: {result['body'].get('message', '未知')}")
        else:
            print(f"  创建 {subdir}/ 失败: {result}")
    
    # 步骤 4: 上传根目录文件
    print("\n步骤 4: 上传根目录文件...")
    
    root_files = [
        'docker-compose.yml',
        'Dockerfile.frontend',
        'Dockerfile.backend',
        'nginx.conf',
        '.dockerignore',
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'index.html',
        'eslint.config.js',
        'nodemon.json',
    ]
    
    for filename in root_files:
        local_path = os.path.join(LOCAL_DIR, filename)
        remote_path = os.path.join(PROJECT_DIR, filename)
        
        if not os.path.exists(local_path):
            print(f"  {filename}: 本地文件不存在，跳过")
            continue
        
        result = upload_file(local_path, remote_path)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"  {filename}: 上传成功")
        else:
            print(f"  {filename}: 上传失败")
            if isinstance(result['body'], dict):
                print(f"    错误: {result['body'].get('message', '未知')}")
            else:
                print(f"    错误: {result['body'][:100]}")
    
    # 步骤 5: 上传 api 目录文件
    print("\n步骤 5: 上传 api 目录文件...")
    
    api_files = [
        'api/app.ts',
        'api/index.ts',
        'api/server.ts',
        'api/routes/auth.ts',
    ]
    
    for filepath in api_files:
        local_path = os.path.join(LOCAL_DIR, filepath)
        remote_path = os.path.join(PROJECT_DIR, filepath)
        
        if not os.path.exists(local_path):
            print(f"  {filepath}: 本地文件不存在，跳过")
            continue
        
        result = upload_file(local_path, remote_path)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"  {filepath}: 上传成功")
        else:
            print(f"  {filepath}: 上传失败")
            if isinstance(result['body'], dict):
                print(f"    错误: {result['body'].get('message', '未知')}")
    
    # 步骤 6: 上传 src 目录文件
    print("\n步骤 6: 上传 src 目录文件...")
    
    # 递归收集所有 src 文件
    src_files = []
    for root, dirs, files in os.walk(os.path.join(LOCAL_DIR, 'src')):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, LOCAL_DIR)
            src_files.append(rel_path)
    
    for filepath in src_files:
        local_path = os.path.join(LOCAL_DIR, filepath)
        remote_path = os.path.join(PROJECT_DIR, filepath)
        
        result = upload_file(local_path, remote_path)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"  {filepath}: 上传成功")
        else:
            print(f"  {filepath}: 上传失败")
            if isinstance(result['body'], dict):
                print(f"    错误: {result['body'].get('message', '未知')[:80]}")
    
    # 步骤 7: 上传 public 目录文件
    print("\n步骤 7: 上传 public 目录文件...")
    
    public_files = []
    for root, dirs, files in os.walk(os.path.join(LOCAL_DIR, 'public')):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, LOCAL_DIR)
            public_files.append(rel_path)
    
    for filepath in public_files:
        local_path = os.path.join(LOCAL_DIR, filepath)
        remote_path = os.path.join(PROJECT_DIR, filepath)
        
        result = upload_file(local_path, remote_path)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"  {filepath}: 上传成功")
        else:
            print(f"  {filepath}: 上传失败")
            if isinstance(result['body'], dict):
                print(f"    错误: {result['body'].get('message', '未知')[:80]}")
    
    # 步骤 8: 验证上传结果
    print("\n步骤 8: 验证上传结果...")
    items = list_dir(PROJECT_DIR)
    print(f"  {PROJECT_DIR} 目录内容（共 {len(items)} 项）:")
    for item in items:
        print(f"    {item['name']} ({'目录' if item['isDir'] else '文件'} - {item['size']} bytes)")
    
    print("\n" + "=" * 60)
    print("文件上传完成！")
    print("=" * 60)

if __name__ == '__main__':
    main()
