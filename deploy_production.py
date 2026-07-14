#!/usr/bin/env python3
"""VaultKey 部署脚本 - 通过 1Panel API 部署"""
import hmac
import hashlib
import time
import urllib.request
import json
import os
import base64

BASE_URL = 'http://124.222.162.174:22423'
API_KEY = 'xx1IOF2hj7rtRdmk330onYtheKXtdnjx'
LOCAL_DIR = '/workspace'
CHUNKS_DIR = '/workspace/chunks'
PROJECT_DIR = '/opt/vaultkey'
CHUNKS_REMOTE_DIR = '/opt/vaultkey-deploy-chunks'

def call_api(path, method='GET', data=None, timeout=120):
    """调用 1Panel API"""
    timestamp = str(int(time.time()))
    token = hmac.new(API_KEY.encode(), f'1panel:{timestamp}'.encode(), hashlib.sha256).hexdigest()
    url = BASE_URL + '/api/v2' + path
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
                return {'status': resp.status, 'body': json.loads(resp_body)}
            except:
                return {'status': resp.status, 'body': resp_body}
    except urllib.error.HTTPError as e:
        return {'status': e.code, 'body': e.read().decode()}
    except Exception as e:
        return {'status': 0, 'body': str(e)}

def create_dir(path):
    """创建目录"""
    return call_api('/files', 'POST', {'path': path, 'isDir': True, 'mode': 755})

def create_file(path, content):
    """创建文件并写入内容"""
    # 先创建空文件
    result = call_api('/files', 'POST', {'path': path, 'isDir': False, 'mode': 644})
    if not (isinstance(result['body'], dict) and result['body'].get('code') == 200):
        return result
    # 再写入内容
    return call_api('/files/save', 'POST', {'path': path, 'content': content})

def check_is_dir(path):
    """检查是否是目录"""
    result = call_api('/files/content', 'POST', {'path': path})
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        return result['body']['data'].get('isDir', False)
    return False

def print_result(label, result):
    """打印 API 结果"""
    if isinstance(result['body'], dict):
        code = result['body'].get('code', 0)
        msg = result['body'].get('message', '')
        if code == 200:
            print(f"  ✓ {label}: 成功")
        else:
            print(f"  ✗ {label}: code={code}, msg={msg[:80]}")
    else:
        print(f"  ✗ {label}: {str(result['body'])[:80]}")

def step1_upload_chunks():
    """步骤1: 上传部署文件块"""
    print("=" * 60)
    print("步骤 1: 上传部署文件块到服务器")
    print("=" * 60)

    # 创建块目录
    print("\n创建块目录...")
    call_api('/files/del', 'POST', {'path': CHUNKS_REMOTE_DIR})
    time.sleep(1)
    result = create_dir(CHUNKS_REMOTE_DIR)
    print_result("创建块目录", result)

    # 读取并上传所有块
    chunk_files = sorted([f for f in os.listdir(CHUNKS_DIR) if f.startswith('chunk_')])
    print(f"\n发现 {len(chunk_files)} 个块文件")

    success_count = 0
    for chunk_file in chunk_files:
        chunk_path = os.path.join(CHUNKS_DIR, chunk_file)
        with open(chunk_path, 'r') as f:
            content = f.read()

        remote_path = f'{CHUNKS_REMOTE_DIR}/{chunk_file}'
        result = create_file(remote_path, content)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            print(f"  ✓ {chunk_file} ({len(content)} bytes)")
            success_count += 1
        else:
            msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
            print(f"  ✗ {chunk_file}: {msg[:80]}")

    print(f"\n块上传完成: {success_count}/{len(chunk_files)} 成功")
    return success_count == len(chunk_files)

def step2_upload_and_run_deploy_script():
    """步骤2: 上传并执行部署脚本"""
    print("\n" + "=" * 60)
    print("步骤 2: 上传并执行部署脚本")
    print("=" * 60)

    # 读取部署脚本
    with open(os.path.join(LOCAL_DIR, 'extract_and_deploy.sh'), 'r') as f:
        script_content = f.read()

    # 上传脚本
    print("\n上传部署脚本...")
    result = create_file('/opt/vaultkey-deploy.sh', script_content)
    print_result("上传脚本", result)

    # 创建定时任务
    print("\n创建定时任务执行脚本...")
    cronjob_data = {
        'name': 'vaultkey-deploy',
        'spec': '0 0 1 1 *',
        'command': 'bash /opt/vaultkey-deploy.sh',
        'script': 'bash /opt/vaultkey-deploy.sh',
        'type': 'shell',
        'webhook': '',
        'successMsg': '',
        'errorMsg': '',
        'retry': 0,
        'timeout': 600,
        'exclusion': False,
        'groupID': 0,
        'exitWhenFail': True,
    }
    result = call_api('/cronjobs', 'POST', cronjob_data)
    task_id = None
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        data = result['body'].get('data')
        if data and isinstance(data, dict):
            task_id = data.get('id')
        print(f"  ✓ 定时任务创建成功, ID: {task_id}")
    else:
        msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
        print(f"  ✗ 定时任务创建失败: {msg[:100]}")
        # 尝试查找已存在的任务
        print("  查找已存在的任务...")
        result = call_api('/cronjobs/search', 'POST', {'page': 1, 'pageSize': 20})
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            items = result['body']['data'].get('items', []) or []
            for item in items:
                if 'vaultkey' in item.get('name', '').lower():
                    task_id = item.get('id')
                    print(f"  找到已存在的任务: ID={task_id}")
                    break

    if not task_id:
        print("  无法获取任务ID")
        return False

    # 执行任务
    print(f"\n执行任务 ID={task_id}...")
    result = call_api('/cronjobs/handle', 'POST', {'taskID': task_id})
    print_result("执行任务", result)

    # 等待执行
    print("\n等待 30 秒让脚本执行...")
    time.sleep(30)

    # 检查执行记录
    print("\n检查执行记录...")
    result = call_api('/cronjobs/records/search', 'POST', {
        'page': 1,
        'pageSize': 5,
        'orderBy': 'created_at',
        'order': 'descending'
    })
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        records = result['body']['data'].get('items', []) or []
        for rec in records[:3]:
            print(f"  记录: ID={rec.get('id')}, 状态={rec.get('status')}, 时间={rec.get('created_at')}")

            # 查看日志
            log_result = call_api('/cronjobs/record/log', 'POST', {
                'recordID': rec.get('id'),
                'taskID': task_id
            })
            if isinstance(log_result['body'], dict) and log_result['body'].get('code') == 200:
                log_data = log_result['body'].get('data')
                if log_data:
                    log_content = log_data if isinstance(log_data, str) else json.dumps(log_data)
                    print(f"  日志: {log_content[:500]}")

    return True

def step3_verify_docker():
    """步骤3: 验证 Docker 容器状态"""
    print("\n" + "=" * 60)
    print("步骤 3: 验证 Docker 容器状态")
    print("=" * 60)

    # 检查容器状态
    print("\n检查容器状态...")
    result = call_api('/containers/status')
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        data = result['body']['data']
        print(f"  容器总数: {data.get('total', 'N/A')}")
        print(f"  运行中: {data.get('running', 'N/A')}")

    # 搜索容器
    print("\n搜索容器列表...")
    result = call_api('/containers/search', 'POST', {
        'page': 1,
        'pageSize': 20,
        'state': 'all',
        'orderBy': 'name',
        'order': 'ascending'
    })
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        items = result['body']['data'].get('items', []) or []
        print(f"  容器总数: {len(items)}")
        for item in items:
            name = item.get('name', 'unknown')
            state = item.get('state', 'unknown')
            print(f"    - {name}: {state}")

    # 检查 Compose
    print("\n检查 Docker Compose 编排...")
    result = call_api('/containers/compose/search', 'POST', {'page': 1, 'pageSize': 20})
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        items = result['body']['data'].get('items', []) or []
        print(f"  Compose 编排总数: {len(items)}")
        for item in items:
            name = item.get('name', 'unknown')
            running = item.get('runningCount', 0)
            total = item.get('containerCount', 0)
            print(f"    - {name}: {running}/{total} 运行中")

    return True

def step4_create_website():
    """步骤4: 创建反向代理网站"""
    print("\n" + "=" * 60)
    print("步骤 4: 创建反向代理网站")
    print("=" * 60)

    # 获取网站目录选项
    print("\n获取网站目录选项...")
    result = call_api('/settings/website/dir')
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        print(f"  网站目录: {result['body'].get('data', 'N/A')}")
    else:
        print("  无法获取网站目录")

    # 创建反向代理网站
    print("\n创建反向代理网站...")

    # 先检查网站是否已存在
    result = call_api('/websites/search', 'POST', {
        'page': 1,
        'pageSize': 20,
        'orderBy': 'created_at',
        'order': 'descending'
    })
    website_id = None
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        items = result['body']['data'].get('items', []) or []
        for item in items:
            if 'vaultkey' in item.get('primaryDomain', '').lower() or 'vaultkey' in item.get('remark', '').lower():
                website_id = item.get('id')
                print(f"  网站已存在, ID: {website_id}")
                break

    if not website_id:
        # 尝试创建反向代理网站
        website_data = {
            'primaryDomain': 'vaultkey.mozixun.com',
            'type': 'proxy',
            'proxy': 'http://127.0.0.1:8080',
            'proxyType': 'http',
            'webSiteGroupId': 1,
            'otherDomains': '',
            'remark': 'VaultKey Password Manager',
        }
        result = call_api('/websites', 'POST', website_data)
        if isinstance(result['body'], dict) and result['body'].get('code') == 200:
            data = result['body'].get('data')
            if data and isinstance(data, dict):
                website_id = data.get('id')
            print(f"  ✓ 网站创建成功, ID: {website_id}")
        else:
            msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
            print(f"  ✗ 网站创建失败: {msg[:200]}")

            # 尝试其他参数格式
            print("  尝试其他参数格式...")
            website_data2 = {
                'primaryDomain': 'vaultkey.mozixun.com',
                'type': 'reverse',
                'proxyAddress': 'http://127.0.0.1:8080',
                'webSiteGroupId': 1,
                'remark': 'VaultKey Password Manager',
            }
            result = call_api('/websites', 'POST', website_data2)
            if isinstance(result['body'], dict) and result['body'].get('code') == 200:
                data = result['body'].get('data')
                if data and isinstance(data, dict):
                    website_id = data.get('id')
                print(f"  ✓ 网站创建成功 (方式2), ID: {website_id}")
            else:
                msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
                print(f"  ✗ 方式2也失败: {msg[:200]}")

    return website_id

def step5_configure_ssl(website_id):
    """步骤5: 配置 SSL 证书"""
    print("\n" + "=" * 60)
    print("步骤 5: 配置 SSL 证书")
    print("=" * 60)

    if not website_id:
        print("  无网站ID，跳过 SSL 配置")
        return False

    # 获取 ACME 账户列表
    print(f"\n获取 ACME 账户列表 (网站ID: {website_id})...")
    result = call_api(f'/websites/{website_id}/acme/search', 'POST', {'page': 1, 'pageSize': 20})
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        items = result['body']['data'].get('items', []) or []
        print(f"  ACME 账户数: {len(items)}")
    else:
        msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
        print(f"  获取 ACME 失败: {msg[:100]}")

    return True

def step6_verify_deployment():
    """步骤6: 验证部署"""
    print("\n" + "=" * 60)
    print("步骤 6: 验证部署")
    print("=" * 60)

    # 检查容器日志
    print("\n检查前端容器日志...")
    result = call_api('/containers/search/log?container=vaultkey-frontend&tail=20', 'GET')
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        logs = result['body'].get('data', '')
        print(f"  日志: {str(logs)[:300]}")
    else:
        msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
        print(f"  获取日志失败: {msg[:100]}")

    print("\n检查后端容器日志...")
    result = call_api('/containers/search/log?container=vaultkey-backend&tail=20', 'GET')
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        logs = result['body'].get('data', '')
        print(f"  日志: {str(logs)[:300]}")
    else:
        msg = result['body'].get('message', 'unknown') if isinstance(result['body'], dict) else str(result['body'])
        print(f"  获取日志失败: {msg[:100]}")

    # 最终容器状态
    print("\n最终容器状态...")
    result = call_api('/containers/search', 'POST', {
        'page': 1,
        'pageSize': 20,
        'state': 'all',
        'orderBy': 'name',
        'order': 'ascending'
    })
    if isinstance(result['body'], dict) and result['body'].get('code') == 200:
        items = result['body']['data'].get('items', []) or []
        for item in items:
            name = item.get('name', 'unknown')
            state = item.get('state', 'unknown')
            if 'vaultkey' in name.lower():
                print(f"  - {name}: {state}")

    return True

def main():
    print("=" * 60)
    print("VaultKey 生产环境部署脚本")
    print(f"面板: {BASE_URL}")
    print(f"域名: vaultkey.mozixun.com")
    print("=" * 60)

    # 步骤 1: 上传块文件
    if not step1_upload_chunks():
        print("\n步骤 1 失败，但继续尝试后续步骤...")

    # 步骤 2: 上传并执行部署脚本
    step2_upload_and_run_deploy_script()

    # 步骤 3: 验证 Docker
    step3_verify_docker()

    # 步骤 4: 创建网站
    website_id = step4_create_website()

    # 步骤 5: 配置 SSL
    step5_configure_ssl(website_id)

    # 步骤 6: 验证部署
    step6_verify_deployment()

    print("\n" + "=" * 60)
    print("部署流程完成")
    print("=" * 60)

if __name__ == '__main__':
    main()
