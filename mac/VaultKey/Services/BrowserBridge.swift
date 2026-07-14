import Foundation
import AppKit

/// 浏览器桥接服务：通过 Native Messaging 与 VaultKey 浏览器扩展通信
/// 负责将凭据传递给扩展以实现自动填充
class BrowserBridge {

    // MARK: - 单例

    static let shared = BrowserBridge()

    // MARK: - 常量

    /// Native Messaging 宿主名称
    private let nativeMessagingHost = "com.vaultkey.browser_bridge"

    /// 标准输入输出管道
    private var inputPipe: FileHandle?
    private var outputPipe: FileHandle?

    /// 是否已连接
    private var isConnected = false

    /// 消息处理队列
    private let messageQueue = DispatchQueue(label: "com.vaultkey.browserbridge", qos: .userInitiated)

    private init() {
        setupNativeMessagingHost()
    }

    // MARK: - Native Messaging 宿主配置

    /// 设置 Native Messaging 宿主
    /// 注册 JSON 文件到浏览器指定位置
    private func setupNativeMessagingHost() {
        registerChromeHost()
        registerFirefoxHost()
        registerEdgeHost()
    }

    /// 注册 Chrome Native Messaging 宿主
    private func registerChromeHost() {
        let manifest: [String: Any] = [
            "name": nativeMessagingHost,
            "description": "VaultKey 浏览器扩展通信桥接",
            "path": Bundle.main.executablePath ?? "",
            "type": "stdio",
            "allowed_origins": [
                "chrome-extension://abcdefghijklmnopqrstuvwxyz123456/"
            ]
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: manifest, options: .prettyPrinted),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }

        // 写入 Chrome Native Messaging 宿主清单文件
        let manifestPath = chromeManifestPath()
        writeManifest(jsonString, to: manifestPath)
    }

    /// 注册 Firefox Native Messaging 宿主
    private func registerFirefoxHost() {
        let manifest: [String: Any] = [
            "name": nativeMessagingHost,
            "description": "VaultKey 浏览器扩展通信桥接",
            "path": Bundle.main.executablePath ?? "",
            "type": "stdio",
            "allowed_extensions": [
                "vaultkey@vaultkey.app"
            ]
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: manifest, options: .prettyPrinted),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }

        let manifestPath = firefoxManifestPath()
        writeManifest(jsonString, to: manifestPath)
    }

    /// 注册 Edge Native Messaging 宿主
    private func registerEdgeHost() {
        // Edge 使用与 Chrome 相同的格式
        let manifest: [String: Any] = [
            "name": nativeMessagingHost,
            "description": "VaultKey 浏览器扩展通信桥接",
            "path": Bundle.main.executablePath ?? "",
            "type": "stdio",
            "allowed_origins": [
                "ms-browser-extension://abcdefghijklmnopqrstuvwxyz123456/"
            ]
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: manifest, options: .prettyPrinted),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }

        let manifestPath = edgeManifestPath()
        writeManifest(jsonString, to: manifestPath)
    }

    // MARK: - 清单文件路径

    /// Chrome Native Messaging 宿主清单路径
    private func chromeManifestPath() -> String {
        let libraryDir = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true).first ?? ""
        return "\(libraryDir)/Application Support/Google/Chrome/NativeMessagingHosts/\(nativeMessagingHost).json"
    }

    /// Firefox Native Messaging 宿主清单路径
    private func firefoxManifestPath() -> String {
        let libraryDir = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true).first ?? ""
        return "\(libraryDir)/Application Support/Mozilla/NativeMessagingHosts/\(nativeMessagingHost).json"
    }

    /// Edge Native Messaging 宿主清单路径
    private func edgeManifestPath() -> String {
        let libraryDir = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true).first ?? ""
        return "\(libraryDir)/Application Support/Microsoft Edge/NativeMessagingHosts/\(nativeMessagingHost).json"
    }

    /// 写入清单文件
    private func writeManifest(_ content: String, to path: String) {
        let directory = (path as NSString).deletingLastPathComponent
        let fileManager = FileManager.default

        // 创建目录
        if !fileManager.fileExists(atPath: directory) {
            try? fileManager.createDirectory(atPath: directory, withIntermediateDirectories: true)
        }

        // 写入文件
        try? content.write(toFile: path, atomically: true, encoding: .utf8)
    }

    // MARK: - 消息通信

    /// 发送消息到浏览器扩展
    /// - Parameter message: 要发送的消息
    func sendMessage(_ message: BridgeMessage) {
        messageQueue.async {
            guard let data = self.encodeMessage(message) else { return }
            self.writeToStdout(data)
        }
    }

    /// 读取来自浏览器扩展的消息
    /// - Parameter handler: 消息处理回调
    func readMessage(handler: @escaping (BridgeMessage) -> Void) {
        messageQueue.async {
            guard let data = self.readFromStdin() else { return }
            if let message = self.decodeMessage(data) {
                DispatchQueue.main.async {
                    handler(message)
                }
            }
        }
    }

    /// 编码消息为 Native Messaging 格式
    /// 格式: 4字节长度（小端序）+ JSON 数据
    private func encodeMessage(_ message: BridgeMessage) -> Data? {
        guard let jsonData = try? JSONEncoder().encode(message) else { return nil }

        // 添加长度前缀
        var length = UInt32(jsonData.count).littleEndian
        let lengthData = Data(bytes: &length, count: 4)

        return lengthData + jsonData
    }

    /// 解码来自 Native Messaging 的消息
    private func decodeMessage(_ data: Data) -> BridgeMessage? {
        guard data.count > 4 else { return nil }

        // 读取长度前缀
        let length = data.prefix(4).withUnsafeBytes { $0.load(as: UInt32.self) }.littleEndian
        let jsonData = data.dropFirst(4)

        guard jsonData.count == Int(length) else { return nil }

        return try? JSONDecoder().decode(BridgeMessage.self, from: jsonData)
    }

    /// 写入标准输出
    private func writeToStdout(_ data: Data) {
        FileHandle.standardOutput.write(data)
    }

    /// 从标准输入读取数据
    private func readFromStdin() -> Data? {
        let input = FileHandle.standardInput
        let lengthData = input.readData(ofLength: 4)

        guard lengthData.count == 4 else { return nil }

        let length = lengthData.withUnsafeBytes { $0.load(as: UInt32.self) }.littleEndian
        let jsonData = input.readData(ofLength: Int(length))

        guard jsonData.count == Int(length) else { return nil }

        return lengthData + jsonData
    }

    // MARK: - 凭据查询接口

    /// 根据域名查询匹配的凭据
    /// - Parameter domain: 网站域名
    /// - Returns: 匹配的凭据列表
    func findCredentials(for domain: String) -> [BrowserCredential] {
        // TODO: 从加密存储中查找匹配的凭据
        // 1. 解密密码库数据
        // 2. 按域名匹配登录信息
        // 3. 返回匹配结果

        let sampleCredentials = VaultItem.sampleItems
            .filter { $0.type == .login }
            .map { item in
                BrowserCredential(
                    id: item.id,
                    username: item.subtitle,
                    password: "decrypted_password_\(item.id)",
                    name: item.name,
                    domain: domain
                )
            }

        return sampleCredentials
    }

    /// 请求填充指定凭据
    /// - Parameter credential: 要填充的凭据
    func requestFill(credential: BrowserCredential) {
        let message = BridgeMessage(
            type: .fillCredential,
            data: [
                "id": credential.id,
                "username": credential.username,
                "password": credential.password
            ]
        )
        sendMessage(message)
    }

    /// 通知浏览器扩展密码库已锁定
    func notifyLocked() {
        let message = BridgeMessage(
            type: .vaultLocked,
            data: [:]
        )
        sendMessage(message)
    }

    /// 通知浏览器扩展密码库已解锁
    func notifyUnlocked() {
        let message = BridgeMessage(
            type: .vaultUnlocked,
            data: [:]
        )
        sendMessage(message)
    }

    /// 发送当前活动标签页的凭据
    /// - Parameter url: 当前页面 URL
    func sendCredentialsForURL(_ url: String) {
        guard let host = extractDomain(from: url) else { return }

        let credentials = findCredentials(for: host)

        let message = BridgeMessage(
            type: .credentialList,
            data: [
                "url": url,
                "count": "\(credentials.count)",
                "credentials": credentials.map { $0.toDictionary() }.compactMap { try? JSONSerialization.data(withJSONObject: $0).base64EncodedString() }.joined(separator: ",")
            ]
        )
        sendMessage(message)
    }

    /// 从 URL 中提取域名
    private func extractDomain(from url: String) -> String? {
        guard let components = URLComponents(string: url),
              let host = components.host else {
            return nil
        }
        return host
    }

    // MARK: - 消息处理

    /// 开始监听来自浏览器扩展的消息
    func startListening() {
        readMessage { [weak self] message in
            self?.handleIncomingMessage(message)
        }
    }

    /// 处理收到的消息
    private func handleIncomingMessage(_ message: BridgeMessage) {
        switch message.type {
        case .requestCredentials:
            // 浏览器请求凭据
            if let url = message.data["url"] {
                sendCredentialsForURL(url)
            }

        case .fillCredential:
            // 浏览器请求填充特定凭据
            if let credentialId = message.data["id"] {
                let credentials = findCredentials(for: message.data["domain"] ?? "")
                if let credential = credentials.first(where: { $0.id == credentialId }) {
                    requestFill(credential: credential)
                }
            }

        case .saveCredential:
            // 浏览器请求保存新凭据
            handleSaveCredential(message.data)

        case .updateCredential:
            // 浏览器请求更新凭据
            handleUpdateCredential(message.data)

        case .checkStatus:
            // 浏览器检查 VaultKey 状态
            let statusMessage = BridgeMessage(
                type: .statusResponse,
                data: [
                    "locked": "false", // TODO: 从 AppState 读取
                    "version": "1.0.0"
                ]
            )
            sendMessage(statusMessage)

        case .generatePassword:
            // 浏览器请求生成密码
            let password = generatePassword()
            let response = BridgeMessage(
                type: .generatedPassword,
                data: ["password": password]
            )
            sendMessage(response)

        default:
            break
        }
    }

    /// 处理保存凭据请求
    private func handleSaveCredential(_ data: [String: String]) {
        guard let username = data["username"],
              let password = data["password"],
              let url = data["url"] else { return }

        // TODO: 加密并保存到密码库
        print("保存凭据: \(username) @ \(url)")
    }

    /// 处理更新凭据请求
    private func handleUpdateCredential(_ data: [String: String]) {
        guard let id = data["id"],
              let password = data["password"] else { return }

        // TODO: 更新密码库中的凭据
        print("更新凭据: \(id)")
    }

    /// 生成随机密码
    private func generatePassword() -> String {
        let length = 20
        let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        var password = ""
        for _ in 0..<length {
            if let char = characters.randomElement() {
                password.append(char)
            }
        }
        return String(password.shuffled())
    }
}

// MARK: - 消息模型

/// 浏览器桥接消息
struct BridgeMessage: Codable {
    /// 消息类型
    let type: MessageType
    /// 消息数据
    let data: [String: String]

    /// 消息类型枚举
    enum MessageType: String, Codable {
        case requestCredentials    // 请求凭据列表
        case credentialList        // 凭据列表响应
        case fillCredential        // 填充凭据
        case saveCredential        // 保存凭据
        case updateCredential      // 更新凭据
        case vaultLocked           // 密码库已锁定
        case vaultUnlocked         // 密码库已解锁
        case checkStatus           // 检查状态
        case statusResponse        // 状态响应
        case generatePassword      // 生成密码
        case generatedPassword     // 生成的密码
    }
}

/// 浏览器凭据模型
struct BrowserCredential: Codable {
    let id: String
    let username: String
    let password: String
    let name: String
    let domain: String

    /// 转换为字典
    func toDictionary() -> [String: String] {
        [
            "id": id,
            "username": username,
            "password": password,
            "name": name,
            "domain": domain
        ]
    }
}
