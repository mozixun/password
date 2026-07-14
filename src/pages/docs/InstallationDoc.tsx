import DocsLayout from './DocsLayout';

export default function InstallationDoc() {
  return (
    <DocsLayout>
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-vault-text mb-6">安装指南</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">前置要求</h2>
          <ul className="space-y-2 text-vault-text-secondary">
            <li>Node.js 20+</li>
            <li>npm 或 pnpm</li>
            <li>Git</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">Web 端开发环境</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">1. 克隆仓库</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  git clone https://github.com/your-username/vaultkey.git<br />
                  cd vaultkey
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">2. 安装依赖</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  pnpm install
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">3. 启动开发服务器</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  pnpm run dev
                </code>
              </div>
              <p className="mt-2 text-sm text-vault-text-muted">
                开发服务器将在 <code className="text-vault-accent">http://localhost:5173</code> 启动，API 服务将在 <code className="text-vault-accent">http://localhost:3001</code> 启动。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">4. 构建生产版本</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  pnpm run build
                </code>
              </div>
              <p className="mt-2 text-sm text-vault-text-muted">
                构建产物将输出到 <code className="text-vault-accent">dist</code> 目录。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">浏览器插件</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">Chrome 安装</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>打开 Chrome 浏览器</li>
                <li>访问 <code className="text-vault-accent">chrome://extensions/</code></li>
                <li>启用"开发者模式"</li>
                <li>点击"加载已解压的扩展程序"</li>
                <li>选择 <code className="text-vault-accent">extension/</code> 目录</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">Firefox 安装</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>打开 Firefox 浏览器</li>
                <li>访问 <code className="text-vault-accent">about:debugging#/runtime/this-firefox</code></li>
                <li>点击"临时载入附加组件"</li>
                <li>选择 <code className="text-vault-accent">extension/manifest.json</code></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">iPhone 应用</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">开发环境</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>安装 Xcode 15+</li>
                <li>打开 <code className="text-vault-accent">ios/VaultKey/VaultKey.xcodeproj</code></li>
                <li>选择目标设备或模拟器</li>
                <li>点击"运行"按钮</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">构建发布版本</h3>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  cd ios<br />
                  xcodebuild -scheme VaultKey -configuration Release build
                </code>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">环境变量</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">前端环境变量</h3>
              <p className="text-sm text-vault-text-muted mb-3">创建 <code className="text-vault-accent">.env</code> 文件：</p>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  VITE_API_URL=http://localhost:3001<br />
                  VITE_APP_NAME=VaultKey
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">后端环境变量</h3>
              <p className="text-sm text-vault-text-muted mb-3">创建 <code className="text-vault-accent">api/.env</code> 文件：</p>
              <div className="bg-vault-card border border-vault-border rounded-lg p-4">
                <code className="text-sm text-vault-text-secondary">
                  PORT=3001<br />
                  NODE_ENV=development<br />
                  JWT_SECRET=your-jwt-secret<br />
                  DATABASE_URL=postgres://user:password@localhost:5432/vaultkey
                </code>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-vault-text mb-4">部署</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">GitHub Pages</h3>
              <p className="text-vault-text-secondary">
                项目已配置 GitHub Actions 自动部署到 GitHub Pages。每次推送到 <code className="text-vault-accent">main</code> 分支时，自动执行构建和部署。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">Vercel</h3>
              <p className="text-vault-text-secondary">
                项目已配置 Vercel 部署。推送代码后自动部署。
              </p>
            </div>
          </div>
        </section>
      </article>
    </DocsLayout>
  );
}
