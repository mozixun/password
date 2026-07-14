import SwiftUI
import AppKit

/// VaultKey Mac 应用入口：菜单栏状态项 + 主窗口 + 全局键盘快捷键
@main
struct VaultKeyMacApp: App {
    /// 应用状态
    @StateObject private var appState = AppState()
    /// 菜单栏控制器
    @StateObject private var menuBarController = MenuBarController()
    /// 全局快捷键管理器
    @StateObject private var shortcutManager = GlobalShortcutManager()

    var body: some Scene {
        // 主窗口
        WindowGroup {
            MainView()
                .environmentObject(appState)
                .environmentObject(menuBarController)
                .environmentObject(shortcutManager)
                .frame(minWidth: 900, minHeight: 600)
        }
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified(showsTitle: true))
        .defaultSize(width: 1100, height: 700)
        .commands {
            // 应用菜单命令
            appCommands
        }

        // 设置窗口
        Settings {
            MacSettingsView()
                .environmentObject(appState)
        }
    }

    // MARK: - 自定义菜单命令

    @CommandsBuilder
    private var appCommands: some Commands {
        // 文件菜单
        CommandGroup(replacing: .newItem) {
            Button("新建登录信息") {
                createNewItem(type: .login)
            }
            .keyboardShortcut("n", modifiers: [.command])

            Button("新建支付卡") {
                createNewItem(type: .card)
            }

            Button("新建安全笔记") {
                createNewItem(type: .note)
            }
        }

        // 编辑菜单
        CommandGroup(after: .pasteboard) {
            Divider()

            Button("生成密码") {
                shortcutManager.triggerQuickGenerate()
            }
            .keyboardShortcut("g", modifiers: [.command])

            Divider()

            Button("搜索项目...") {
                shortcutManager.triggerQuickSearch()
            }
            .keyboardShortcut("f", modifiers: [.command])
        }

        // 视图菜单
        CommandGroup(after: .sidebar) {
            Divider()

            Button("锁定 VaultKey") {
                appState.lock()
            }
            .keyboardShortcut("l", modifiers: [.command, .control])
        }

        // 帮助菜单
        CommandGroup(replacing: .help) {
            Button("VaultKey 帮助") {
                if let url = URL(string: "https://help.vaultkey.app") {
                    NSWorkspace.shared.open(url)
                }
            }

            Button("发送反馈") {
                if let url = URL(string: "mailto:feedback@vaultkey.app") {
                    NSWorkspace.shared.open(url)
                }
            }
        }
    }

    // MARK: - 方法

    /// 创建新项目
    private func createNewItem(type: VaultItem.ItemType) {
        // TODO: 打开新建项目窗口
        print("创建新项目: \(type.rawValue)")
    }
}

// MARK: - Mac 设置视图

/// Mac 专用设置视图
struct MacSettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // 通用设置
            GeneralSettingsPane()
                .tabItem {
                    Label("通用", systemImage: "gearshape")
                }
                .tag(0)

            // 安全设置
            SecuritySettingsPane()
                .tabItem {
                    Label("安全", systemImage: "lock.shield")
                }
                .tag(1)

            // 快捷键设置
            ShortcutSettingsPane()
                .tabItem {
                    Label("快捷键", systemImage: "keyboard")
                }
                .tag(2)

            // 浏览器扩展
            BrowserExtensionSettingsPane()
                .tabItem {
                    Label("浏览器", systemImage: "safari")
                }
                .tag(3)
        }
        .frame(width: 500, height: 400)
    }
}

// MARK: - 设置面板

/// 通用设置面板
struct GeneralSettingsPane: View {
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    @AppStorage("showInMenuBar") private var showInMenuBar = true
    @AppStorage("theme") private var theme = "system"

    var body: some View {
        Form {
            Toggle("开机自动启动", isOn: $launchAtLogin)
            Toggle("在菜单栏显示图标", isOn: $showInMenuBar)

            Picker("主题", selection: $theme) {
                Text("跟随系统").tag("system")
                Text("浅色").tag("light")
                Text("深色").tag("dark")
            }
        }
        .padding()
    }
}

/// 安全设置面板
struct SecuritySettingsPane: View {
    @AppStorage("autoLockMinutes") private var autoLockMinutes = 5
    @AppStorage("clearClipboardSeconds") private var clearClipboardSeconds = 30
    @AppStorage("useTouchID") private var useTouchID = true

    var body: some View {
        Form {
            Toggle("使用 Touch ID 解锁", isOn: $useTouchID)

            Picker("自动锁定时间", selection: $autoLockMinutes) {
                Text("立即").tag(0)
                Text("1 分钟").tag(1)
                Text("5 分钟").tag(5)
                Text("15 分钟").tag(15)
                Text("1 小时").tag(60)
                Text("从不").tag(-1)
            }

            Picker("清除剪贴板", selection: $clearClipboardSeconds) {
                Text("10 秒").tag(10)
                Text("30 秒").tag(30)
                Text("1 分钟").tag(60)
                Text("2 分钟").tag(120)
                Text("从不").tag(-1)
            }
        }
        .padding()
    }
}

/// 快捷键设置面板
struct ShortcutSettingsPane: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("全局快捷键")
                .font(.headline)

            HStack {
                Text("自动填充密码")
                Spacer()
                Text("⌘\\")
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }

            HStack {
                Text("快速搜索")
                Spacer()
                Text("⌘⇧Space")
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }

            HStack {
                Text("生成密码")
                Spacer()
                Text("⌘⇧G")
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }

            HStack {
                Text("锁定 VaultKey")
                Spacer()
                Text("⌃⌘L")
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.2))
                    .cornerRadius(4)
            }
        }
        .padding()
    }
}

/// 浏览器扩展设置面板
struct BrowserExtensionSettingsPane: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("浏览器扩展")
                .font(.headline)

            Text("安装 VaultKey 浏览器扩展以在浏览器中自动填充密码。")
                .font(.subheadline)
                .foregroundColor(.secondary)

            VStack(alignment: .leading, spacing: 12) {
                browserRow(name: "Safari", icon: "safari", installed: true)
                browserRow(name: "Chrome", icon: "globe", installed: false)
                browserRow(name: "Firefox", icon: "globe", installed: false)
                browserRow(name: "Edge", icon: "globe", installed: false)
            }
        }
        .padding()
    }

    private func browserRow(name: String, icon: String, installed: Bool) -> some View {
        HStack {
            Image(systemName: icon)
                .font(.title3)
                .frame(width: 30)

            Text(name)
                .font(.subheadline)

            Spacer()

            if installed {
                Text("已安装")
                    .font(.caption)
                    .foregroundColor(.green)
            } else {
                Button("安装") {}
                    .buttonStyle(.bordered)
                    .controlSize(.small)
            }
        }
    }
}
