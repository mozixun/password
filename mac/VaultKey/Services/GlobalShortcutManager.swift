import SwiftUI
import AppKit
import Carbon

/// 全局快捷键管理器：注册和管理系统级热键
/// 支持 ⌘\ 自动填充、⌘⇧Space 快速搜索、⌘⇧G 生成密码、⌃⌘L 锁定
class GlobalShortcutManager: ObservableObject {

    // MARK: - 发布属性

    /// 是否显示快速搜索
    @Published var showQuickSearch = false

    /// 是否显示密码生成器
    @Published var showGenerator = false

    /// 当前填充状态
    @Published var fillStatus: FillStatus = .idle

    // MARK: - 填充状态枚举

    enum FillStatus {
        case idle
        case filling
        case success
        case failed
    }

    // MARK: - 快捷键定义

    /// 快捷键配置
    struct ShortcutConfig: Identifiable {
        let id: String
        let name: String
        let keyCode: UInt32
        let modifiers: UInt32
        let description: String

        /// 显示文本
        var displayText: String {
            var parts: [String] = []
            if modifiers & cmdKey != 0 { parts.append("⌘") }
            if modifiers & shiftKey != 0 { parts.append("⇧") }
            if modifiers & optionKey != 0 { parts.append("⌥") }
            if modifiers & controlKey != 0 { parts.append("⌃") }

            // 将 keyCode 转为可读字符
            let keyChar = keyCodeToCharacter(keyCode)
            parts.append(keyChar)

            return parts.joined()
        }

        /// 将虚拟键码转为字符
        private func keyCodeToCharacter(_ code: UInt32) -> String {
            switch code {
            case 42: return "\\"
            case 49: return "Space"
            case 5: return "G"
            case 37: return "L"
            default: return "\(code)"
            }
        }
    }

    // MARK: - 快捷键配置列表

    /// 自动填充快捷键: ⌘\
    let fillShortcut = ShortcutConfig(
        id: "fill",
        name: "自动填充密码",
        keyCode: 42,       // 反斜杠键
        modifiers: cmdKey,
        description: "在当前输入框自动填充选中的凭据"
    )

    /// 快速搜索快捷键: ⌘⇧Space
    let searchShortcut = ShortcutConfig(
        id: "search",
        name: "快速搜索",
        keyCode: 49,       // 空格键
        modifiers: cmdKey | shiftKey,
        description: "打开快速搜索面板查找项目"
    )

    /// 生成密码快捷键: ⌘⇧G
    let generateShortcut = ShortcutConfig(
        id: "generate",
        name: "生成密码",
        keyCode: 5,        // G 键
        modifiers: cmdKey | shiftKey,
        description: "生成随机强密码并复制到剪贴板"
    )

    /// 锁定快捷键: ⌃⌘L
    let lockShortcut = ShortcutConfig(
        id: "lock",
        name: "锁定 VaultKey",
        keyCode: 37,       // L 键
        modifiers: cmdKey | controlKey,
        description: "立即锁定 VaultKey"
    )

    /// 所有快捷键配置
    var allShortcuts: [ShortcutConfig] {
        [fillShortcut, searchShortcut, generateShortcut, lockShortcut]
    }

    // MARK: - 热键引用

    /// 已注册的热键 ID 列表
    private var registeredHotKeyIDs: [Int] = []

    /// 热键事件处理器引用
    private var eventHandler: EventHandlerRef?

    // MARK: - 初始化

    init() {
        registerGlobalShortcuts()
    }

    deinit {
        unregisterAllShortcuts()
    }

    // MARK: - 注册快捷键

    /// 注册所有全局快捷键
    func registerGlobalShortcuts() {
        // 注册各个快捷键
        registerHotKey(fillShortcut)
        registerHotKey(searchShortcut)
        registerHotKey(generateShortcut)
        registerHotKey(lockShortcut)

        // 安装全局事件监听
        installEventHandler()
    }

    /// 注册单个热键
    private func registerHotKey(_ config: ShortcutConfig) {
        var hotKeyRef: EventHotKeyRef?

        let hotKeyID = EventHotKeyID(
            signature: FourCharCode(config.id.hashValue),
            id: config.id.hashValue
        )

        let status = RegisterEventHotKey(
            config.keyCode,
            config.modifiers,
            hotKeyID,
            GetApplicationEventTarget(),
            0,
            &hotKeyRef
        )

        if status == noErr {
            registeredHotKeyIDs.append(hotKeyID.id)
        }
    }

    /// 安装事件处理器
    private func installEventHandler() {
        let eventType = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind: OSType(kEventHotKeyPressed)
        )

        let handler: EventHandlerUPP = { _, event, userData in
            guard let userData = userData else { return OSStatus(eventNotHandledErr) }

            let manager = Unmanaged<GlobalShortcutManager>.fromOpaque(userData).takeUnretainedValue()
            manager.handleHotKeyEvent(event)

            return noErr
        }

        let userData = Unmanaged.passUnretained(self).toOpaque()

        InstallEventHandler(
            GetApplicationEventTarget(),
            handler,
            1,
            &eventType,
            userData,
            &eventHandler
        )
    }

    /// 处理热键事件
    private func handleHotKeyEvent(_ event: EventRef?) {
        guard let event = event else { return }

        var hotKeyID = EventHotKeyID()
        let status = GetEventParameter(
            event,
            EventParamName(kEventParamDirectObject),
            EventParamType(typeEventHotKeyID),
            nil,
            MemoryLayout<EventHotKeyID>.size,
            nil,
            &hotKeyID
        )

        guard status == noErr else { return }

        // 根据热键 ID 执行对应操作
        if hotKeyID.id == fillShortcut.id.hashValue {
            triggerFill()
        } else if hotKeyID.id == searchShortcut.id.hashValue {
            triggerQuickSearch()
        } else if hotKeyID.id == generateShortcut.id.hashValue {
            triggerQuickGenerate()
        } else if hotKeyID.id == lockShortcut.id.hashValue {
            triggerLock()
        }
    }

    // MARK: - 注销快捷键

    /// 注销所有全局快捷键
    func unregisterAllShortcuts() {
        if let eventHandler = eventHandler {
            RemoveEventHandler(eventHandler)
            self.eventHandler = nil
        }
        registeredHotKeyIDs.removeAll()
    }

    // MARK: - 快捷键操作

    /// 触发自动填充
    func triggerFill() {
        fillStatus = .filling

        // 获取当前活动应用的选中文本
        let systemWideElement = AXUIElementCreateSystemWide()
        var focusedElement: AnyObject?
        let error = AXUIElementCopyAttributeValue(
            systemWideElement,
            kAXFocusedUIElementAttribute as CFString,
            &focusedElement
        )

        if error == .success, let element = focusedElement {
            // 尝试获取当前 URL 或表单信息
            // 然后从 VaultKey 查找匹配的凭据
            simulateCredentialInput()
        } else {
            // 如果无法获取焦点元素，尝试剪贴板方式
            clipboardFill()
        }
    }

    /// 触发快速搜索
    func triggerQuickSearch() {
        showQuickSearch.toggle()
    }

    /// 触发快速生成密码
    func triggerQuickGenerate() {
        showGenerator.toggle()

        // 生成强密码并复制到剪贴板
        let password = generateQuickPassword()
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(password, forType: .string)

        // 发送通知
        showNotification(title: "密码已生成", body: "新密码已复制到剪贴板")
    }

    /// 触发锁定
    func triggerLock() {
        // 通知 AppState 锁定
        NotificationCenter.default.post(name: .lockVaultKey, object: nil)
    }

    // MARK: - 辅助方法

    /// 模拟凭据输入
    private func simulateCredentialInput() {
        // TODO: 获取匹配的凭据并模拟键盘输入
        // 1. 从当前应用获取 URL
        // 2. 在 VaultKey 中查找匹配的登录信息
        // 3. 使用 CGEvent 模拟键盘输入用户名和密码

        fillStatus = .success
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.fillStatus = .idle
        }
    }

    /// 通过剪贴板填充
    private func clipboardFill() {
        // TODO: 将密码复制到剪贴板并提示用户粘贴
        fillStatus = .success
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.fillStatus = .idle
        }
    }

    /// 生成快速密码
    private func generateQuickPassword() -> String {
        let length = 20
        let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-="
        var password = ""

        // 确保包含各类字符
        password += randomChar(from: "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        password += randomChar(from: "abcdefghijklmnopqrstuvwxyz")
        password += randomChar(from: "0123456789")
        password += randomChar(from: "!@#$%^&*")

        while password.count < length {
            password += randomChar(from: characters)
        }

        return String(password.shuffled())
    }

    /// 随机字符
    private func randomChar(from string: String) -> String {
        guard let char = string.randomElement() else { return "" }
        return String(char)
    }

    /// 显示系统通知
    private func showNotification(title: String, body: String) {
        let notification = NSUserNotification()
        notification.title = title
        notification.informativeText = body
        notification.soundName = NSUserNotificationDefaultSoundName
        NSUserNotificationCenter.default.deliver(notification)
    }
}

// MARK: - 通知名称

extension Notification.Name {
    /// 锁定 VaultKey 通知
    static let lockVaultKey = Notification.Name("lockVaultKey")
}
