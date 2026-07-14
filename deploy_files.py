import os
import hmac
import hashlib
import time
import urllib.request
import json
import base64

# 设置环境变量
os.environ['ONEPANEL_BASE_URL'] = 'http://124.222.162.174:22423'
os.environ['ONEPANEL_API_KEY'] = 'xx1IOF2hj7rtRdmk330onYtheKXtdnjx'

base_url = os.environ['ONEPANEL_BASE_URL']
api_key = os.environ['ONEPANEL_API_KEY']

def call_api(path, method='GET', data=None):
    timestamp = str(int(time.time()))
    token = hmac.new(api_key.encode(), f'1panel:{timestamp}'.encode(), hashlib.sha256).hexdigest()
    
    url = base_url + path
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
    result = call_api('/api/v2/files', 'POST', {
        'path': path,
        'type': 'dir'
    })
    return result

def upload_file(local_path, remote_path):
    """上传文件"""
    try:
        with open(local_path, 'rb') as f:
            content = base64.b64encode(f.read()).decode('utf-8')
        
        result = call_api('/api/v2/files/save', 'POST', {
            'path': remote_path,
            'content': content
        })
        return result
    except Exception as e:
        return {'status': 0, 'body': str(e)}

def get_all_files(local_dir):
    """获取所有需要上传的文件"""
    files = []
    for root, dirs, filenames in os.walk(local_dir):
        # 跳过不需要的目录
        skip_dirs = ['node_modules', 'dist', '.git', '.github', '.trae', 'extension', 'ios', 'mac']
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for filename in filenames:
            local_path = os.path.join(root, filename)
            relative_path = os.path.relpath(local_path, local_dir)
            files.append((local_path, relative_path))
    return files

# 根目录下的文件列表（直接上传）
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

# 需要创建的子目录
sub_dirs = [
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
    'public',
]

print('=' * 60)
print('VaultKey 文件上传脚本')
print('=' * 60)

# 步骤 1: 创建项目目录
print('\n步骤 1: 创建项目目录...')
result = create_dir('/opt/vaultkey')
print(f'  /opt/vaultkey: {result["body"].get("message", "成功") if isinstance(result["body"], dict) else result["body"]}')

# 步骤 2: 创建子目录
print('\n步骤 2: 创建子目录...')
for dir_path in sub_dirs:
    full_path = f'/opt/vaultkey/{dir_path}'
    result = create_dir(full_path)
    msg = result["body"].get("message", "成功") if isinstance(result["body"], dict) else result["body"]
    print(f'  {dir_path}: {msg}')

# 步骤 3: 上传根目录文件
print('\n步骤 3: 上传根目录文件...')
for filename in root_files:
    local_path = os.path.join('/workspace', filename)
    if os.path.exists(local_path):
        remote_path = f'/opt/vaultkey/{filename}'
        result = upload_file(local_path, remote_path)
        success = result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200
        print(f'  {filename}: {"成功" if success else "失败"}')
        if not success:
            print(f'    错误: {result["body"]}')

# 步骤 4: 上传 api 目录文件
print('\n步骤 4: 上传 api 目录文件...')
api_files = [
    'api/app.ts',
    'api/index.ts',
    'api/server.ts',
    'api/routes/auth.ts',
]
for filepath in api_files:
    local_path = os.path.join('/workspace', filepath)
    if os.path.exists(local_path):
        remote_path = f'/opt/vaultkey/{filepath}'
        result = upload_file(local_path, remote_path)
        success = result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200
        print(f'  {filepath}: {"成功" if success else "失败"}')
        if not success:
            print(f'    错误: {result["body"]}')

# 步骤 5: 上传 src 目录文件
print('\n步骤 5: 上传 src 目录文件...')
src_files = get_all_files('/workspace/src')
for local_path, relative_path in src_files:
    remote_path = f'/opt/vaultkey/src/{relative_path}'
    result = upload_file(local_path, remote_path)
    success = result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200
    print(f'  src/{relative_path}: {"成功" if success else "失败"}')
    if not success:
        print(f'    错误: {result["body"]}')

# 步骤 6: 上传 public 目录文件
print('\n步骤 6: 上传 public 目录文件...')
public_files = get_all_files('/workspace/public')
for local_path, relative_path in public_files:
    remote_path = f'/opt/vaultkey/public/{relative_path}'
    result = upload_file(local_path, remote_path)
    success = result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200
    print(f'  public/{relative_path}: {"成功" if success else "失败"}')
    if not success:
        print(f'    错误: {result["body"]}')

# 步骤 7: 验证上传结果
print('\n步骤 7: 验证上传结果...')
result = call_api('/api/v2/files/search', 'POST', {
    'path': '/opt/vaultkey',
    'page': 1,
    'pageSize': 100
})
if result['status'] == 200 and isinstance(result['body'], dict) and result['body'].get('code') == 200:
    data = result['body']['data']
    content = data.get('content', []) if isinstance(data, dict) else []
    print(f'  /opt/vaultkey 目录内容（共 {len(content)} 项）:')
    for item in content:
        item_type = '目录' if item['isDir'] else '文件'
        print(f'    {item["name"]} ({item_type})')

print('\n' + '=' * 60)
print('文件上传完成！')
print('=' * 60)
