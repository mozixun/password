import DocsLayout from './DocsLayout';

export default function UsageDoc() {
  return (
    <DocsLayout>
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-vault-text mb-6">使用指南</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">首次使用</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">注册账户</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>打开应用</li>
                <li>点击"创建账户"</li>
                <li>输入邮箱地址</li>
                <li>设置主密码（建议至少12个字符，包含大小写字母、数字和特殊字符）</li>
                <li>保存恢复密钥（重要！用于忘记密码时恢复账户）</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">登录</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>打开应用</li>
                <li>输入邮箱地址</li>
                <li>输入主密码</li>
                <li>点击"解锁"</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">记住设备</h3>
              <p className="text-vault-text-secondary">
                勾选"记住此设备"选项，下次访问时可使用信任设备快速解锁，无需输入完整密码。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">管理密码</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">添加新项目</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>点击左侧菜单的"+"按钮或仪表盘的"新建项目"</li>
                <li>选择项目类型（登录、信用卡、身份、安全笔记、SSH密钥、文档、通行密钥、TOTP验证器等）</li>
                <li>填写项目信息</li>
                <li>点击"保存"</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">编辑项目</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>在项目列表中找到要编辑的项目</li>
                <li>点击项目卡片打开详情页</li>
                <li>点击"编辑"按钮</li>
                <li>修改信息后点击"保存"</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">删除项目</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>在项目列表中找到要删除的项目</li>
                <li>右键点击项目卡片，选择"删除"</li>
                <li>确认删除操作</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">密码历史</h3>
              <p className="text-vault-text-secondary">
                每次修改密码时，系统会自动保存历史记录。在项目详情页可以查看密码历史，支持一键恢复到历史密码，历史记录包含修改时间戳。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">搜索</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">快速搜索</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>使用快捷键 <kbd className="px-2 py-1 bg-vault-hover rounded text-vault-accent">Cmd+K</kbd> (Mac) 或 <kbd className="px-2 py-1 bg-vault-hover rounded text-vault-accent">Ctrl+K</kbd> (Windows) 打开搜索框</li>
                <li>输入关键词搜索项目标题、用户名、URL、标签</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">高级筛选</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>使用左侧分类侧栏按类型筛选</li>
                <li>使用标签云进行多标签筛选</li>
                <li>按收藏状态、更新时间排序</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">密码生成器</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">基本使用</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>点击左侧菜单的"密码生成器"</li>
                <li>调整密码长度（默认16位）</li>
                <li>选择字符类型：大写字母、小写字母、数字、特殊字符</li>
                <li>点击"生成"按钮</li>
                <li>点击"复制"按钮复制到剪贴板</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">高级选项</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li><strong>可读模式</strong>：排除易混淆字符（如 0/O、1/l/I）</li>
                <li><strong>无连续字符</strong>：防止连续字母或数字</li>
                <li><strong>无重复字符</strong>：防止相同字符连续出现</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">密码短语模式</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>切换到"密码短语"模式</li>
                <li>生成由多个中文词汇组成的可读密码</li>
                <li>点击"复制"按钮复制到剪贴板</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">安全中心</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">安全评分</h3>
              <p className="text-vault-text-secondary">
                仪表盘显示当前密码健康度评分，基于以下因素：弱密码数量、重复密码数量、泄露密码数量、过期项目数量、缺少两步验证的账户数量。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">泄露监控</h3>
              <p className="text-vault-text-secondary">
                安全中心与 Have I Been Pwned 数据库对接，定期检查密码是否在已知数据泄露中出现。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">弱密码检测</h3>
              <p className="text-vault-text-secondary">
                自动检测强度不足的密码，建议使用密码生成器更新。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">重复密码识别</h3>
              <p className="text-vault-text-secondary">
                识别在多个账户中使用的相同密码，建议分别更新。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">设置</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">账户安全</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>修改主密码</li>
                <li>设置两步验证</li>
                <li>管理恢复密钥</li>
                <li>查看信任设备</li>
                <li>移除登录设备</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">自动锁定</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>设置自动锁定时间（默认15分钟）</li>
                <li>闲置超时后自动锁定保管库</li>
                <li>支持锁屏时自动锁定</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">旅行模式</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>启用旅行模式隐藏选中的保管库</li>
                <li>禁用旅行模式显示所有保管库</li>
                <li>保护敏感数据在旅行期间的安全</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">导入导出</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>支持从 CSV、1Password、Bitwarden、LastPass 导入</li>
                <li>支持导出为 CSV 格式</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">通行密钥 (Passkey)</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">创建通行密钥</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>在项目详情页选择"通行密钥"类型</li>
                <li>点击"创建通行密钥"按钮</li>
                <li>按照提示完成生物识别验证</li>
                <li>保存通行密钥配置</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">使用通行密钥登录</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>在支持通行密钥的网站登录时</li>
                <li>选择使用 VaultKey 通行密钥</li>
                <li>完成生物识别验证即可登录</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">TOTP 验证器</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">添加 TOTP 账户</h3>
              <ol className="space-y-2 text-vault-text-secondary list-decimal list-inside">
                <li>在项目详情页选择"TOTP验证器"类型</li>
                <li>输入密钥（或扫描二维码）</li>
                <li>选择算法（SHA1/SHA256/SHA512）</li>
                <li>设置验证码位数（6位或8位）</li>
                <li>设置刷新周期（默认30秒）</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">使用 TOTP</h3>
              <ul className="space-y-2 text-vault-text-secondary list-disc list-inside">
                <li>TOTP 验证码会自动刷新</li>
                <li>点击验证码可复制到剪贴板</li>
                <li>显示验证码剩余有效时间</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-vault-text mb-4">快捷键</h2>
          
          <div className="bg-vault-card border border-vault-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-vault-surface/50">
                <tr>
                  <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">快捷键</th>
                  <th className="text-left px-4 py-3 text-vault-text-secondary font-medium">功能</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/50">
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">Cmd+K / Ctrl+K</td>
                  <td className="px-4 py-3 text-vault-text-secondary">打开搜索框</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">Cmd+N / Ctrl+N</td>
                  <td className="px-4 py-3 text-vault-text-secondary">新建项目</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">Cmd+S / Ctrl+S</td>
                  <td className="px-4 py-3 text-vault-text-secondary">保存当前项目</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-vault-accent font-mono">Esc</td>
                  <td className="px-4 py-3 text-vault-text-secondary">关闭弹窗/取消操作</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-vault-text mb-4">常见问题</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">忘记主密码怎么办？</h3>
              <p className="text-vault-text-secondary">
                使用注册时保存的恢复密钥进行恢复：在登录页面点击"忘记密码"，输入恢复密钥，设置新的主密码。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">数据是否会被服务器访问？</h3>
              <p className="text-vault-text-secondary">
                不会。VaultKey 使用端到端加密，所有数据在客户端加密后上传，服务器无法访问明文数据。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-vault-text mb-3">如何在多设备间同步数据？</h3>
              <p className="text-vault-text-secondary">
                VaultKey 支持跨设备同步：在所有设备上使用相同账户登录，数据会自动同步到所有设备，支持离线访问已同步的数据。
              </p>
            </div>
          </div>
        </section>
      </article>
    </DocsLayout>
  );
}
