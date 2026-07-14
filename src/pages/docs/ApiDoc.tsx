import DocsLayout from './DocsLayout';

export default function ApiDoc() {
  return (
    <DocsLayout>
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-vault-text mb-6">API 文档</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">基础信息</h2>
          
          <div className="bg-vault-card border border-vault-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-vault-border/50">
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary font-medium w-32">基础 URL</td>
                  <td className="px-4 py-3 text-vault-accent font-mono">http://localhost:3001/api</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary font-medium">认证方式</td>
                  <td className="px-4 py-3 text-vault-text-secondary">JWT Bearer Token</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary font-medium">内容类型</td>
                  <td className="px-4 py-3 text-vault-text-secondary">application/json</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">认证端点</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /auth/register
              </h3>
              <p className="text-vault-text-secondary mb-3">注册新用户</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">请求体：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "email": "user@example.com",
  "verifier": "string",
  "salt": "string",
  "publicKey": "string"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "userId": "uuid",
  "accessToken": "string",
  "refreshToken": "string"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /auth/login/init
              </h3>
              <p className="text-vault-text-secondary mb-3">登录初始化 - 获取 SRP 参数</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">请求体：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "email": "user@example.com"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "salt": "string",
  "serverEphemeral": "string"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /auth/login/verify
              </h3>
              <p className="text-vault-text-secondary mb-3">登录验证 - 完成 SRP 认证</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">请求体：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "email": "user@example.com",
  "clientEphemeral": "string",
  "clientProof": "string"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "serverProof": "string",
  "accessToken": "string",
  "refreshToken": "string"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /auth/refresh
              </h3>
              <p className="text-vault-text-secondary mb-3">刷新访问令牌</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">请求体：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "refreshToken": "string"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "accessToken": "string",
  "refreshToken": "string"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /users/me
              </h3>
              <p className="text-vault-text-secondary mb-3">获取当前用户资料</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证：<code className="text-vault-accent">Authorization: Bearer {'<token>'}</code></p>
              
              <div>
                <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                  <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "id": "uuid",
  "email": "string",
  "createdAt": "string",
  "plan": "free" | "premium",
  "avatarUrl": "string" | null
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">保管库端点</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /vaults
              </h3>
              <p className="text-vault-text-secondary mb-3">获取保管库列表</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
              
              <div>
                <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                  <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "icon": "string",
    "color": "string",
    "encryptedKey": "string",
    "version": 1
  }
]`}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /vaults
              </h3>
              <p className="text-vault-text-secondary mb-3">创建新保管库</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-vault-text-muted mb-2">请求体：</p>
                  <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                    <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "name": "string",
  "description": "string",
  "icon": "string",
  "color": "string",
  "encryptedKey": "string"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold mr-2">PUT</span>
                /vaults/:vaultId
              </h3>
              <p className="text-vault-text-secondary mb-3">更新保管库信息</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold mr-2">DELETE</span>
                /vaults/:vaultId
              </h3>
              <p className="text-vault-text-secondary mb-3">删除保管库</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">项目端点</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /vaults/:vaultId/items
              </h3>
              <p className="text-vault-text-secondary mb-3">获取项目列表</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
              
              <div className="mb-3">
                <p className="text-sm text-vault-text-muted mb-2">查询参数：</p>
                <ul className="space-y-1 text-vault-text-secondary text-sm list-disc list-inside">
                  <li><code className="text-vault-accent">type</code> - 按类型筛选</li>
                  <li><code className="text-vault-accent">search</code> - 搜索关键词</li>
                  <li><code className="text-vault-accent">favorite</code> - 是否收藏</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /vaults/:vaultId/items
              </h3>
              <p className="text-vault-text-secondary mb-3">创建新项目</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /vaults/:vaultId/items/:itemId
              </h3>
              <p className="text-vault-text-secondary mb-3">获取项目详情</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold mr-2">PUT</span>
                /vaults/:vaultId/items/:itemId
              </h3>
              <p className="text-vault-text-secondary mb-3">更新项目</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold mr-2">DELETE</span>
                /vaults/:vaultId/items/:itemId
              </h3>
              <p className="text-vault-text-secondary mb-3">删除项目</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">安全中心端点</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /watchtower/summary
              </h3>
              <p className="text-vault-text-secondary mb-3">获取安全概况</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
              
              <div>
                <p className="text-sm text-vault-text-muted mb-2">响应：</p>
                <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
                  <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "score": 85,
  "weakPasswords": 2,
  "reusedPasswords": 3,
  "compromisedPasswords": 0,
  "expiredItems": 1,
  "missing2FA": 5
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /watchtower/breach-check
              </h3>
              <p className="text-vault-text-secondary mb-3">检查密码泄露（k-匿名方式）</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">同步端点</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold mr-2">POST</span>
                /sync/push
              </h3>
              <p className="text-vault-text-secondary mb-3">推送本地变更到服务器</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold mr-2">GET</span>
                /sync/pull
              </h3>
              <p className="text-vault-text-secondary mb-3">从服务器拉取变更</p>
              <p className="text-sm text-vault-text-muted mb-2">需要认证</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">错误响应</h2>
          
          <p className="text-vault-text-secondary mb-4">所有错误响应格式：</p>
          <div className="bg-vault-surface border border-vault-border rounded-lg p-4 mb-6">
            <pre className="text-sm text-vault-text-secondary overflow-x-auto">
{`{
  "error": "string",
  "message": "string",
  "code": 400
}`}
            </pre>
          </div>

          <div className="bg-vault-card border border-vault-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-vault-surface/50">
                <tr>
                  <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">状态码</th>
                  <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/50">
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">400</td>
                  <td className="px-4 py-3 text-vault-text-secondary">请求参数错误</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">401</td>
                  <td className="px-4 py-3 text-vault-text-secondary">未授权</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">403</td>
                  <td className="px-4 py-3 text-vault-text-secondary">禁止访问</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">404</td>
                  <td className="px-4 py-3 text-vault-text-secondary">资源不存在</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">500</td>
                  <td className="px-4 py-3 text-vault-text-secondary">服务器错误</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-vault-text mb-4">速率限制</h2>
          
          <div className="bg-vault-card border border-vault-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-vault-surface/50">
                <tr>
                  <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">端点</th>
                  <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">限制</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/50">
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary">/auth/login/*</td>
                  <td className="px-4 py-3 text-vault-text-secondary">每分钟 10 次</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary">/auth/register</td>
                  <td className="px-4 py-3 text-vault-text-secondary">每分钟 5 次</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary">/auth/unlock</td>
                  <td className="px-4 py-3 text-vault-text-secondary">每分钟 5 次</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-text-secondary">其他端点</td>
                  <td className="px-4 py-3 text-vault-text-secondary">每分钟 100 次</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mt-4 text-sm text-vault-text-muted">
            速率限制响应头：X-RateLimit-Limit、X-RateLimit-Remaining、X-RateLimit-Reset
          </p>
        </section>
      </article>
    </DocsLayout>
  );
}
