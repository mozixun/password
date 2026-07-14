#!/usr/bin/env python3
import os
import hmac
import hashlib
import time
import urllib.request
import json
import base64
import mimetypes

# 配置
ONEPANEL_BASE_URL = 'http://124.222.162.174:22423'
ONEPANEL_API_KEY = 'xx1IOF2hj7rtRdmk330onYtheKXtdnjx'
PROJECT_DIR = '/opt/vaultkey'
LOCAL_PROJECT_DIR = '/workspace'

def call_api(path, method='GET', data=None):
    timestamp = str(int(time.time()))
    token = hmac.new(ONEPANEL_API_KEY.encode(), f'1panel:{timestamp}'.encode(), hashlib.sha256).hexdigest()
    
    url = ONEPANEL_BASE_URL + path
    headers = {
        '1Panel-Token': token,
        '1Panel-Timestamp': timestamp,
        'Content-Type': 'application/json'
    }
    
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return {
                'status': resp.status,
                'body': json.loads(resp.read().decode())
            }
    except urllib.error.HTTPError as e:
        try:
            return {
                'status': e.code,
                'body': json.loads(e.read().decode())
            }
        except:
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
    result = call_api('/api/v2/files', 'POST', {
        'path': path,
        'type': 'dir'
    })
    return result

def upload_file(local_path, remote_path):
    try:
        with open(local_path, 'rb') as f:
            content = base64.b64encode(f.read()).decode()
        
        filename = os.path.basename(remote_path)
        dir_path = os.path.dirname(remote_path)
        
        result = call_api('/api/v2/files/save', 'POST', {
            'path': dir_path,
            'name': filename,
            'content': content
        })
        return result
    except Exception as e:
        return {'status': 0, 'body': str(e)}

def get_file_content(remote_path):
    result = call_api('/api/v2/files/content', 'POST', {
        'path': remote_path
    })
    return result

def list_dir(path):
    result = call_api('/api/v2/files/search', 'POST', {
        'path': path,
        'page': 1,
        'pageSize': 100
    })
    return result

# 需要上传的文件列表
files_to_upload = [
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
    'pnpm-lock.yaml',
    'vercel.json',
]

# 需要上传的目录
dirs_to_upload = [
    'api',
    'src',
    'public',
]

def get_all_files(directory):
    """递归获取目录下所有文件"""
    file_list = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, LOCAL_PROJECT_DIR)
            file_list.append(rel_path)
    return file_list

def main():
    print("=" * 60)
    print("VaultKey 部署脚本")
    print("=" * 60)
    
    # 步骤 1: 检查连接
    print("\n步骤 1: 检查 1Panel 连接...")
    result = call_api('/api/v2/health/check')
    if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
        print("  1Panel API 连接成功")
    else:
        print(f"  1Panel API 连接失败: {result}")
        return
    
    # 检查 Docker 状态
    print("\n步骤 2: 检查 Docker 状态...")
    result = call_api('/api/v2/containers/docker/status')
    if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
        data = result['body']['data']
        print(f"  Docker 已安装: {data['isExist']}")
        print(f"  Docker 运行中: {data['isActive']}")
    else:
        print(f"  Docker 状态检查失败: {result}")
        return
    
    # 步骤 3: 创建项目目录
    print(f"\n步骤 3: 创建项目目录 {PROJECT_DIR}...")
    result = create_dir(PROJECT_DIR)
    if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
        print(f"  目录创建成功")
    elif isinstance(result['body'], dict) and '已存在' in str(result['body'].get('message', '')):
        print(f"  目录已存在")
    else:
        print(f"  目录创建结果: {result}")
    
    # 步骤 4: 上传文件
    print("\n步骤 4: 上传项目文件...")
    
    # 上传根目录文件
    for filename in files_to_upload:
        local_path = os.path.join(LOCAL_PROJECT_DIR, filename)
        if os.path.exists(local_path):
            remote_path = os.path.join(PROJECT_DIR, filename)
            print(f"  上传 {filename}...")
            result = upload_file(local_path, remote_path)
            if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
                print(f"    成功")
            else:
                print(f"    结果: {result}")
        else:
            print(f"  跳过 {filename} (文件不存在)")
    
    # 上传目录
    print("\n步骤 5: 上传目录...")
    all_files = []
    for dir_name in dirs_to_upload:
        dir_path = os.path.join(LOCAL_PROJECT_DIR, dir_name)
        if os.path.exists(dir_path):
            # 先创建远程目录
            remote_dir = os.path.join(PROJECT_DIR, dir_name)
            create_dir(remote_dir)
            
            # 获取所有文件
            files = get_all_files(dir_name)
            all_files.extend(files)
    
    # 上传所有文件
    for rel_path in all_files:
        local_path = os.path.join(LOCAL_PROJECT_DIR, rel_path)
        remote_path = os.path.join(PROJECT_DIR, rel_path)
        
        # 确保远程目录存在
        remote_dir = os.path.dirname(remote_path)
        create_dir(remote_dir)
        
        print(f"  上传 {rel_path}...")
        result = upload_file(local_path, remote_path)
        if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"    成功")
        else:
            print(f"    结果: {str(result)[:100]}")
    
    print("\n文件上传完成！")
    
    # 验证文件列表
    print("\n步骤 6: 验证上传的文件...")
    result = list_dir(PROJECT_DIR)
    if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
        data = result['body']['data']
        items = data.get('content', []) if isinstance(data, dict) else []
        print(f"  {PROJECT_DIR} 目录内容:")
        for item in items:
            type_str = '目录' if item.get('isDir') else '文件'
            print(f"    {item['name']} ({type_str})")
    
    print("\n" + "=" * 60)
    print("文件上传完成！下一步：Docker Compose 部署")
    print("=" * 60)

if __name__ == '__main__':
    main()
