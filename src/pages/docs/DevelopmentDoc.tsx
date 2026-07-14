import DocsLayout from './DocsLayout';

export default function DevelopmentDoc() {
  return (
    <DocsLayout>
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-vault-text mb-6">开发指南</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">项目结构</h2>
          
          <div className="bg-vault-card border border-vault-border rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-vault-text-secondary">
{`vaultkey/
├── src/                    # Web 前端源码
│   ├── components/         # 可复用组件
│   ├── hooks/              # 自定义 Hooks
│   ├── i18n/               # 国际化
│   ├── lib/                # 工具函数
│   ├── pages/              # 页面组件
│   ├── store/              # Zustand 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数（加密、自动填充等）
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── api/                    # 后端 API
├── extension/              # 浏览器插件
├── ios/                    # iPhone 应用
├── mac/                    # Mac 应用
├── public/                 # 静态资源
└── .github/workflows/      # GitHub Actions 工作流`}
            </pre>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">开发流程</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">分支策略</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><code className="text-vault-accent">main</code>：主分支，生产环境代码</li>
                <li><code className="text-vault-accent">develop</code>：开发分支，所有功能开发完成后合并到此分支</li>
                <li><code className="text-vault-accent">feature/*</code>：功能分支，开发新功能时创建</li>
                <li><code className="text-vault-accent">bugfix/*</code>：修复分支，修复 bug 时创建</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">提交规范</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  {'<类型>(<范围>): <描述>'}<br /><br />
                  {'<详细说明>'}
                </code>
              </div>
              <p className="mt-3 text-vault-text-secondary">
                <strong>类型：</strong>
              </p>
              <ul className="space-y-1 text-vault-text-secondary list-disc list-inside">
                <li><code className="text-vault-accent">feat</code>：新功能</li>
                <li><code className="text-vault-accent">fix</code>：修复 bug</li>
                <li><code className="text-vault-accent">docs</code>：文档更新</li>
                <li><code className="text-vault-accent">style</code>：代码格式调整</li>
                <li><code className="text-vault-accent">refactor</code>：重构</li>
                <li><code className="text-vault-accent">test</code>：测试</li>
                <li><code className="text-vault-accent">chore</code>：构建/工具</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">代码审查</h3>
              <p className="text-vault-text-secondary">
                所有 PR 必须经过至少一个人的代码审查才能合并到 <code className="text-vault-accent">develop</code> 分支。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">技术栈详情</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">前端</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>React 18</strong>：UI 框架，使用函数组件和 Hooks</li>
                <li><strong>TypeScript</strong>：类型安全</li>
                <li><strong>Vite</strong>：构建工具，支持快速热更新</li>
                <li><strong>Tailwind CSS 3</strong>：原子化 CSS</li>
                <li><strong>Zustand</strong>：轻量级状态管理</li>
                <li><strong>React Router v7</strong>：路由管理</li>
                <li><strong>Lucide React</strong>：图标库</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">后端</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>Node.js 20</strong>：运行时</li>
                <li><strong>Express 4</strong>：Web 框架</li>
                <li><strong>TypeScript</strong>：类型安全</li>
                <li><strong>PostgreSQL</strong>：数据库</li>
                <li><strong>Redis</strong>：缓存</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">加密</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>Web Crypto API</strong>：浏览器原生加密</li>
                <li><strong>AES-256-GCM</strong>：数据加密</li>
                <li><strong>PBKDF2</strong>：密钥派生（700000次迭代）</li>
                <li><strong>HKDF</strong>：密钥派生（用于派生保管库密钥）</li>
                <li><strong>SHA-256</strong>：哈希函数</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">状态管理</h2>
          
          <p className="text-vault-text-secondary mb-4">
            使用 Zustand 进行全局状态管理，分为以下切片：
          </p>
          <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
            <li><code className="text-vault-accent">auth</code>：认证状态（登录、注册、解锁、自动锁定）</li>
            <li><code className="text-vault-accent">vaults</code>：保管库状态</li>
            <li><code className="text-vault-accent">folders</code>：文件夹状态</li>
            <li><code className="text-vault-accent">items</code>：项目状态</li>
            <li><code className="text-vault-accent">watchtower</code>：安全中心状态</li>
            <li><code className="text-vault-accent">generator</code>：密码生成器状态</li>
            <li><code className="text-vault-accent">ui</code>：UI 状态</li>
            <li><code className="text-vault-accent">settings</code>：设置状态</li>
            <li><code className="text-vault-accent">profile</code>：用户资料状态</li>
            <li><code className="text-vault-accent">admin</code>：管理员状态</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">构建与测试</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">可用脚本</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-vault-surface/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">命令</th>
                      <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vault-border/50">
                    <tr>
                      <td className="px-4 py-3 text-vault-accent font-mono">pnpm run dev</td>
                      <td className="px-4 py-3 text-vault-text-secondary">同时启动前后端开发服务器</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-accent font-mono">pnpm run build</td>
                      <td className="px-4 py-3 text-vault-text-secondary">构建生产版本</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-accent font-mono">pnpm run lint</td>
                      <td className="px-4 py-3 text-vault-text-secondary">运行 ESLint 检查</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-accent font-mono">pnpm run check</td>
                      <td className="px-4 py-3 text-vault-text-secondary">TypeScript 类型检查</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-vault-accent font-mono">pnpm run preview</td>
                      <td className="px-4 py-3 text-vault-text-secondary">预览构建产物</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">代码约定</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">TypeScript</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>使用严格模式 (<code className="text-vault-accent">strict: true</code>)</li>
                <li>使用 <code className="text-vault-accent">type</code> 而非 <code className="text-vault-accent">interface</code> 定义类型</li>
                <li>使用 <code className="text-vault-accent">unknown</code> 而非 <code className="text-vault-accent">any</code></li>
                <li>为所有函数和变量添加类型注解</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">React</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>使用函数组件和 Hooks</li>
                <li>使用 <code className="text-vault-accent">useCallback</code> 和 <code className="text-vault-accent">useMemo</code> 优化性能</li>
                <li>使用 <code className="text-vault-accent">React.memo</code> 减少不必要的重渲染</li>
                <li>Hooks 必须在组件顶层调用</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">样式</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>使用 Tailwind CSS 原子化类名</li>
                <li>避免使用 <code className="text-vault-accent">!important</code></li>
                <li>使用自定义颜色变量 (<code className="text-vault-accent">vault-*</code>)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">命名规范</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>文件：小写蛇形命名 (<code className="text-vault-accent">item-card.tsx</code>)</li>
                <li>组件：帕斯卡命名 (<code className="text-vault-accent">ItemCard</code>)</li>
                <li>函数：小写驼峰命名 (<code className="text-vault-accent">handleClick</code>)</li>
                <li>变量：小写驼峰命名 (<code className="text-vault-accent">userName</code>)</li>
                <li>常量：大写蛇形命名 (<code className="text-vault-accent">MAX_ATTEMPTS</code>)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">调试</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">浏览器调试</h3>
              <p className="text-vault-text-secondary">
                使用 Chrome DevTools：打开开发者工具 (F12)，切换到"Sources"标签，在 src/ 目录下找到对应的文件，设置断点进行调试。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">React DevTools</h3>
              <p className="text-vault-text-secondary">
                安装 React DevTools 扩展，在开发者工具中切换到"Components"或"Profiler"标签进行调试。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">状态调试</h3>
              <p className="text-vault-text-secondary">
                使用 Zustand DevTools：在 store 中启用 devtools 中间件，在 Chrome 开发者工具中查看状态变化。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">安全开发规范</h2>
          
          <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
            <li>不要记录敏感信息</li>
            <li>使用 Web Crypto API 进行加密操作</li>
            <li>不要在 localStorage 中存储明文密码</li>
            <li>定期清除剪贴板中的敏感数据</li>
            <li>使用 <code className="text-vault-accent">crypto.getRandomValues</code> 而非 <code className="text-vault-accent">Math.random()</code> 生成随机数</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-vault-text mb-4">贡献指南</h2>
          
          <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
            <li>Fork 仓库</li>
            <li>创建功能分支：<code className="text-vault-accent">git checkout -b feature/your-feature</code></li>
            <li>提交代码：<code className="text-vault-accent">git commit -m "feat(scope): description"</code></li>
            <li>推送分支：<code className="text-vault-accent">git push origin feature/your-feature</code></li>
            <li>创建 Pull Request</li>
          </ol>
        </section>
      </article>
    </DocsLayout>
  );
}
