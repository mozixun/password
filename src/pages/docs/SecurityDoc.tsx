import DocsLayout from './DocsLayout';

export default function SecurityDoc() {
  return (
    <DocsLayout>
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-vault-text mb-6">安全文档</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">加密架构</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">密钥层级</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-6">
                <div className="text-vault-text-secondary text-sm font-mono space-y-2">
                  <p>主密码 (Master Password)</p>
                  <p className="pl-6">└── PBKDF2 派生 ──→ 主密钥 (K1)</p>
                  <p className="pl-12">├── 解密个人保管库密钥</p>
                  <p className="pl-12">├── 解密 SRP 验证器</p>
                  <p className="pl-12">└── 解密安全密钥 (Secure Key)</p>
                  <p className="mt-4">安全密钥 (Secure Key) - 每个用户独立随机生成</p>
                  <p className="pl-6">└── 与 K1 结合通过 HKDF 派生 ──→ 保管库密钥 (Vault Key)</p>
                  <p className="mt-4">保管库密钥 (Vault Key) - 每个保管库独立</p>
                  <p className="pl-6">└── AES-256-GCM 加密 ──→ 项目数据</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">密钥派生流程</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li><strong>K1 派生</strong>：主密码 + SaltA → PBKDF2 (700000次迭代) → K1</li>
                <li><strong>保管库密钥派生</strong>：K1 + Secure Key + SaltB → HKDF → Root Key + SRP Key</li>
                <li><strong>项目加密</strong>：保管库密钥 → AES-256-GCM → 项目数据</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">加密算法</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-vault-surface/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">用途</th>
                      <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">算法</th>
                      <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">参数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vault-border/50">
                    <tr>
                      <td className="px-4 py-3 text-vault-text-secondary">密钥派生</td>
                      <td className="px-4 py-3 text-vault-accent">PBKDF2</td>
                      <td className="px-4 py-3 text-vault-text-secondary">SHA-256, 700000次迭代, 32字节输出</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-text-secondary">密钥派生</td>
                      <td className="px-4 py-3 text-vault-accent">HKDF</td>
                      <td className="px-4 py-3 text-vault-text-secondary">SHA-256, 32字节输出</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-text-secondary">数据加密</td>
                      <td className="px-4 py-3 text-vault-accent">AES-GCM</td>
                      <td className="px-4 py-3 text-vault-text-secondary">256位密钥, 12字节IV, 16字节标签</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-text-secondary">哈希</td>
                      <td className="px-4 py-3 text-vault-accent">SHA-256</td>
                      <td className="px-4 py-3 text-vault-text-secondary">256位输出</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">安全实践</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">密码安全</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>主密码要求</strong>：至少12个字符，建议包含大小写字母、数字和特殊字符</li>
                <li><strong>密码存储</strong>：不存储原始密码，仅存储派生密钥的哈希值</li>
                <li><strong>SRP 协议</strong>：使用安全远程密码协议，服务器永远不会知道用户的原始密码</li>
                <li><strong>恢复密钥</strong>：使用 <code className="text-vault-accent">crypto.getRandomValues</code> 生成，确保随机性</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">数据传输</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>HTTPS</strong>：所有 API 请求必须使用 HTTPS</li>
                <li><strong>CORS</strong>：配置严格的跨域资源共享策略</li>
                <li><strong>速率限制</strong>：防止暴力破解攻击</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">数据存储</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>端到端加密</strong>：所有敏感数据在客户端加密后上传</li>
                <li><strong>加密密钥存储</strong>：加密密钥使用主密码派生的密钥进行加密存储</li>
                <li><strong>本地存储</strong>：使用 localStorage 存储加密后的密钥数据，锁定时清除内存中的密钥</li>
                <li><strong>会话管理</strong>：锁定时清除 vaultKey，仅保留加密后的密钥材料</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">设备安全</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>信任设备</strong>：支持信任设备功能，减少重复解锁</li>
                <li><strong>设备认证</strong>：使用 RSA-OAEP 加密进行设备认证</li>
                <li><strong>远程注销</strong>：支持远程注销已登录设备</li>
                <li><strong>设备列表</strong>：用户可查看并管理所有已登录设备</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">安全威胁与防护</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">暴力破解</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>PBKDF2 700000次迭代，增加破解难度</li>
                <li>多次登录失败后锁定账户</li>
                <li>限制 API 请求频率</li>
              </ul>
            </div>

            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">中间人攻击</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>HTTPS 加密传输</li>
                <li>验证服务器证书有效性</li>
              </ul>
            </div>

            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">数据泄露</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>端到端加密，服务器无法访问明文数据</li>
                <li>所有敏感数据使用 AES-256-GCM 加密</li>
                <li>加密密钥与数据分离存储</li>
              </ul>
            </div>

            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">会话劫持</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>JWT 令牌过期机制</li>
                <li>定期刷新访问令牌</li>
                <li>令牌安全存储在本地</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">安全配置</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">CSP (Content Security Policy)</h3>
              <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`default-src 'self';
script-src 'self' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' https://api.haveibeenpwned.com;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">安全响应头</h3>
              <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">应急响应</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">数据泄露响应</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>立即通知受影响用户</li>
                <li>调查泄露范围和原因</li>
                <li>修复漏洞</li>
                <li>强制用户更改密码</li>
                <li>提供免费身份监控服务</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">账户劫持响应</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>锁定受影响账户</li>
                <li>通知用户</li>
                <li>要求重新验证身份</li>
                <li>审查账户活动</li>
                <li>强制更改密码</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">安全漏洞报告</h3>
              <p className="text-vault-text-secondary mb-3">
                如果发现安全漏洞，请发送邮件至 security@vaultkey.app，包含以下信息：
              </p>
              <ul className="space-y-1 text-vault-text-secondary list-disc list-inside">
                <li>漏洞描述</li>
                <li>复现步骤</li>
                <li>影响范围</li>
                <li>建议修复方案</li>
              </ul>
              <p className="mt-3 text-vault-text-secondary">
                我们承诺在收到报告后 24 小时内回复，并在 72 小时内发布修复。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">合规性</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">GDPR</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>用户数据控制权</li>
                <li>数据删除权</li>
                <li>数据导出权</li>
                <li>隐私政策透明</li>
              </ul>
            </div>

            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">CCPA</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>数据收集告知</li>
                <li>数据访问权</li>
                <li>数据删除权</li>
                <li>选择退出权</li>
              </ul>
            </div>

            <div className="bg-vault-card border border-vault-border rounded-lg p-5">
              <h3 className="text-base font-medium text-vault-text mb-3">SOC 2</h3>
              <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                <li>安全性</li>
                <li>可用性</li>
                <li>处理完整性</li>
                <li>保密性</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">开发安全最佳实践</h2>
          
          <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
            <li>不要记录敏感信息</li>
            <li>使用 Web Crypto API 进行加密操作</li>
            <li>不要在 localStorage 中存储明文密码</li>
            <li>定期清除剪贴板中的敏感数据</li>
            <li>使用 <code className="text-vault-accent">crypto.getRandomValues</code> 而非 <code className="text-vault-accent">Math.random()</code> 生成随机数</li>
            <li>验证所有输入数据</li>
            <li>使用参数化查询防止 SQL 注入</li>
            <li>防止 XSS 攻击</li>
            <li>防止 CSRF 攻击</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-vault-text mb-4">用户安全最佳实践</h2>
          
          <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
            <li>使用强密码（至少12个字符）</li>
            <li>启用两步验证</li>
            <li>定期备份恢复密钥</li>
            <li>不要在公共设备上勾选"记住设备"</li>
            <li>定期检查安全中心的审计结果</li>
            <li>警惕钓鱼网站</li>
            <li>保持操作系统和浏览器更新</li>
          </ul>
        </section>
      </article>
    </DocsLayout>
  );
}
