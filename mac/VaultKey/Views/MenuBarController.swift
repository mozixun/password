import SwiftUI
import AppKit

/// 菜单栏控制器：管理 NSStatusItem、快速搜索弹窗、最近项目、锁定/解锁
class MenuBarController: ObservableObject {

    // MARK: - 发布属性

    /// 是否显示快速搜索弹窗
    @Published var showQuickSearch: Bool = false

    /// 是否已锁定
    @Published var isLocked: Bool = true

    /// 最近使用的项目
    @Published var recentItems: [VaultItem] = []

    /// 搜索关键词
    @Published var searchQuery: String = ""

    /// 搜索结果
    @Published var searchResults: [VaultItem] = []

    // MARK: - 私有属性

    /// 菜单栏状态项
    private var statusItem: NSStatusItem?

    /// 快速搜索窗口
    private var quickSearchPanel: NSPanel?

    // MARK: - 初始化

    init() {
        setupStatusItem()
        loadRecentItems()
    }

    // MARK: - 设置状态栏项

    /// 创建并配置菜单栏状态项
    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)

        if let button = statusItem?.button {
            button.image = NSImage(systemSymbolName: "lock.shield.fill", accessibilityDescription: "VaultKey")
            button.image?.size = NSSize(width: 20, height: 20)
            button.action = #selector(statusItemClicked)
            button.target = self
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        }
    }

    /// 状态栏图标点击事件
    @objc private func statusItemClicked() {
        guard let event = NSApp.currentEvent else { return }

        if event.type == .rightMouseUp {
            // 右键点击：显示完整菜单
            showContextMenu()
        } else {
            // 左键点击：切换快速搜索弹窗
            toggleQuickSearch()
        }
    }

    // MARK: - 右键菜单

    /// 显示上下文菜单
    private func showContextMenu() {
        let menu = NSMenu()

        // 锁定/解锁
        if isLocked {
            menu.addItem(NSMenuItem(title: "解锁 VaultKey", action: #selector(unlockAction), keyEquivalent: ""))
        } else {
            menu.addItem(NSMenuItem(title: "锁定 VaultKey", action: #selector(lockAction), keyEquivalent: "l"))
        }

        menu.addItem(NSMenuItem.separator())

        // 快速搜索
        menu.addItem(NSMenuItem(title: "快速搜索...", action: #selector(openQuickSearch), keyEquivalent: "f"))

        // 生成密码
        menu.addItem(NSMenuItem(title: "生成密码", action: #selector(generatePassword), keyEquivalent: "g"))

        menu.addItem(NSMenuItem.separator())

        // 最近项目
        if !isLocked && !recentItems.isEmpty {
            let recentMenu = NSMenuItem(title: "最近使用", action: nil, keyEquivalent: "")
            let recentSubmenu = NSMenu()

            for item in recentItems.prefix(5) {
                let itemMenu = NSMenuItem(title: "\(item.name) - \(item.subtitle)", action: #selector(copyRecentItem(_:)), keyEquivalent: "")
                itemMenu.representedObject = item
                recentSubmenu.addItem(itemMenu)
            }

            recentMenu.submenu = recentSubmenu
            menu.addItem(recentMenu)
            menu.addItem(NSMenuItem.separator())
        }

        // 打开主窗口
        menu.addItem(NSMenuItem(title: "打开 VaultKey", action: #selector(openMainWindow), keyEquivalent: ""))

        menu.addItem(NSMenuItem.separator())

        // 退出
        menu.addItem(NSMenuItem(title: "退出 VaultKey", action: #selector(quitApp), keyEquivalent: "q"))

        statusItem?.menu = menu
        statusItem?.button?.performClick(nil)
        statusItem?.menu = nil
    }

    // MARK: - 快速搜索弹窗

    /// 切换快速搜索面板的显示/隐藏
    func toggleQuickSearch() {
        if quickSearchPanel?.isVisible == true {
            hideQuickSearch()
        } else {
            showQuickSearch()
        }
    }

    /// 显示快速搜索面板
    func showQuickSearch() {
        if quickSearchPanel == nil {
            createQuickSearchPanel()
        }

        guard let panel = quickSearchPanel else { return }

        // 定位到状态栏图标下方
        if let button = statusItem?.button,
           let screen = button.window?.screen ?? NSScreen.main {
            let buttonFrame = button.window?.frame ?? .zero
            let panelWidth: CGFloat = 420
            let panelHeight: CGFloat = 400

            let x = buttonFrame.midX - panelWidth / 2
            let y = screen.visibleFrame.maxY - buttonFrame.maxY + panelHeight

            panel.setFrame(
                NSRect(x: x, y: y, width: panelWidth, height: panelHeight),
                display: true
            )
        }

        panel.orderFrontRegardless()
        panel.makeKey()
        showQuickSearch = true
    }

    /// 隐藏快速搜索面板
    func hideQuickSearch() {
        quickSearchPanel?.orderOut(nil)
        showQuickSearch = false
        searchQuery = ""
        searchResults = []
    }

    /// 创建快速搜索面板
    private func createQuickSearchPanel() {
        let panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 420, height: 400),
            styleMask: [.nonactivatingPanel, .titled, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )

        panel.isFloatingPanel = true
        panel.level = .floating
        panel.backgroundColor = .clear
        panel.isMovableByWindowBackground = true
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true

        // 设置 SwiftUI 内容
        let hostingView = NSHostingView(rootView: QuickSearchView(menuBarController: self))
        hostingView.frame = panel.contentView?.bounds ?? .zero
        hostingView.autoresizingMask = [.width, .height]
        panel.contentView?.addSubview(hostingView)

        self.quickSearchPanel = panel
    }

    // MARK: - 搜索

    /// 执行搜索
    func performSearch(query: String) {
        searchQuery = query

        guard !query.isEmpty else {
            searchResults = []
            return
        }

        // 在所有项目中搜索
        searchResults = VaultItem.sampleItems.filter {
            $0.name.localizedCaseInsensitiveContains(query) ||
            $0.subtitle.localizedCaseInsensitiveContains(query)
        }
    }

    // MARK: - 菜单操作

    @objc private func unlockAction() {
        isLocked = false
        updateStatusIcon()
    }

    @objc private func lockAction() {
        isLocked = true
        updateStatusIcon()
        hideQuickSearch()
    }

    @objc private func openQuickSearch() {
        showQuickSearch()
    }

    @objc private func generatePassword() {
        // TODO: 打开密码生成器
    }

    @objc private func copyRecentItem(_ sender: NSMenuItem) {
        guard let item = sender.representedObject as? VaultItem else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(item.subtitle, forType: .string)
    }

    @objc private func openMainWindow() {
        NSApp.activate(ignoringOtherApps: true)
        // 打开或显示主窗口
        if let window = NSApp.windows.first(where: { $0.title == "VaultKey" }) {
            window.makeKeyAndOrderFront(nil)
        }
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }

    // MARK: - 辅助方法

    /// 更新状态栏图标
    private func updateStatusIcon() {
        let imageName = isLocked ? "lock.shield.fill" : "lock.shield"
        statusItem?.button?.image = NSImage(systemSymbolName: imageName, accessibilityDescription: "VaultKey")
    }

    /// 加载最近使用的项目
    private func loadRecentItems() {
        recentItems = Array(VaultItem.sampleItems.prefix(5))
    }
}

// MARK: - 快速搜索视图

/// 快速搜索弹窗的 SwiftUI 视图
struct QuickSearchView: View {
    @ObservedObject var menuBarController: MenuBarController
    @FocusState private var isSearchFieldFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // 搜索栏
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)

                TextField("搜索项目...", text: $menuBarController.searchQuery)
                    .textFieldStyle(.plain)
                    .font(.body)
                    .focused($isSearchFieldFocused)
                    .onSubmit {
                        selectFirstResult()
                    }
                    .onChange(of: menuBarController.searchQuery) { newValue in
                        menuBarController.performSearch(query: newValue)
                    }

                if !menuBarController.searchQuery.isEmpty {
                    Button(action: {
                        menuBarController.searchQuery = ""
                        menuBarController.searchResults = []
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                    .buttonStyle(.borderless)
                }
            }
            .padding(12)
            .background(Color(nsColor: .windowBackgroundColor))

            Divider()

            // 搜索结果 / 最近项目
            if menuBarController.searchQuery.isEmpty {
                recentItemsSection
            } else if menuBarController.searchResults.isEmpty {
                noResultsView
            } else {
                searchResultsList
            }

            Divider()

            // 底部操作栏
            HStack {
                Button("生成密码") {}
                    .buttonStyle(.borderless)
                    .font(.caption)

                Spacer()

                Text("⌘⇧Space 打开搜索")
                    .font(.caption2)
                    .foregroundColor(.tertiary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(nsColor: .windowBackgroundColor))
        }
        .background(Color(nsColor: .controlBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .shadow(radius: 8)
        .onAppear {
            isSearchFieldFocused = true
        }
    }

    // MARK: - 最近项目

    private var recentItemsSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("最近使用")
                .font(.caption.bold())
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)
                .padding(.top, 10)
                .padding(.bottom, 6)

            ForEach(menuBarController.recentItems.prefix(5)) { item in
                QuickSearchResultRow(item: item) {
                    copyAndClose(item)
                }
            }
        }
    }

    // MARK: - 搜索结果

    private var searchResultsList: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(menuBarController.searchResults) { item in
                    QuickSearchResultRow(item: item) {
                        copyAndClose(item)
                    }
                }
            }
        }
    }

    // MARK: - 无结果

    private var noResultsView: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.title2)
                .foregroundColor(.secondary)
            Text("未找到匹配项目")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }

    // MARK: - 方法

    /// 选择第一个搜索结果
    private func selectFirstResult() {
        if let first = menuBarController.searchResults.first {
            copyAndClose(first)
        }
    }

    /// 复制项目并关闭弹窗
    private func copyAndClose(_ item: VaultItem) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(item.subtitle, forType: .string)
        menuBarController.hideQuickSearch()
    }
}

// MARK: - 搜索结果行

struct QuickSearchResultRow: View {
    let item: VaultItem
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: item.typeIcon)
                    .font(.subheadline)
                    .foregroundColor(Color(hex: item.type.color))
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(.subheadline)
                        .foregroundColor(.primary)
                    Text(item.subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                Image(systemName: "doc.on.doc")
                    .font(.caption)
                    .foregroundColor(.tertiary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
