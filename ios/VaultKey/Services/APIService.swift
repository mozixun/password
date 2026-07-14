import Foundation

/// API 服务：负责与后端通信，包括 SRP 认证、数据同步、错误处理
/// 使用 URLSession + async/await 实现
class APIService {

    // MARK: - 单例

    static let shared = APIService()

    // MARK: - 配置

    /// API 基础 URL
    private let baseURL: URL

    /// URL 请求会话
    private let session: URLSession

    /// 请求超时时间
    private let timeoutInterval: TimeInterval = 30

    private init() {
        guard let url = URL(string: "https://api.vaultkey.app/v1") else {
            fatalError("API 基础 URL 配置无效")
        }
        self.baseURL = url

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = timeoutInterval
        config.timeoutIntervalForResource = 60
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        self.session = URLSession(configuration: config)
    }

    // MARK: - SRP 认证

    /// SRP（安全远程密码）协议 - 第一步：客户端发起登录请求
    /// - Parameter email: 用户邮箱
    /// - Returns: 服务器挑战（包含 salt 和 B 值）
    func srpInit(email: String) async throws -> SRPChallenge {
        let body: [String: String] = [
            "email": email,
            "step": "init"
        ]

        let response: SRPChallengeResponse = try await request(
            endpoint: "/auth/srp/init",
            method: .post,
            body: body
        )

        return SRPChallenge(
            salt: Data(base64Encoded: response.salt)!,
            serverPublicKey: Data(base64Encoded: response.serverPublicKey)!,
            sessionID: response.sessionID
        )
    }

    /// SRP 协议 - 第二步：客户端提交证明
    /// - Parameters:
    ///   - email: 用户邮箱
    ///   - clientPublicKey: 客户端公钥
    ///   - clientProof: 客户端证明
    ///   - sessionID: 会话 ID
    /// - Returns: 认证结果
    func srpVerify(
        email: String,
        clientPublicKey: Data,
        clientProof: Data,
        sessionID: String
    ) async throws -> AuthResult {
        let body: [String: String] = [
            "email": email,
            "step": "verify",
            "clientPublicKey": clientPublicKey.base64EncodedString(),
            "clientProof": clientProof.base64EncodedString(),
            "sessionID": sessionID
        ]

        let response: AuthResponse = try await request(
            endpoint: "/auth/srp/verify",
            method: .post,
            body: body
        )

        return AuthResult(
            token: response.token,
            refreshToken: response.refreshToken,
            user: UserProfile(
                id: response.userID,
                email: response.email,
                name: response.name,
                avatarURL: response.avatarURL,
                createdAt: Date(),
                lastSyncAt: nil
            )
        )
    }

    // MARK: - 登录（简化版）

    /// 使用邮箱和密码登录（简化流程，实际应使用 SRP）
    /// - Parameters:
    ///   - email: 邮箱
    ///   - password: 密码
    /// - Returns: 用户资料
    func login(email: String, password: String) async throws -> UserProfile {
        // 实际生产环境应使用 SRP 流程
        // 这里提供简化版用于开发调试
        let body: [String: String] = [
            "email": email,
            "password": password
        ]

        let response: AuthResponse = try await request(
            endpoint: "/auth/login",
            method: .post,
            body: body
        )

        // 保存认证令牌
        saveTokens(access: response.token, refresh: response.refreshToken)

        return UserProfile(
            id: response.userID,
            email: response.email,
            name: response.name,
            avatarURL: response.avatarURL,
            createdAt: Date(),
            lastSyncAt: nil
        )
    }

    // MARK: - 同步接口

    /// 同步密码库数据
    /// - Parameter lastSyncTime: 上次同步时间
    /// - Returns: 同步结果
    func syncVault(lastSyncTime: Date?) async throws -> SyncResult {
        var params: [String: String] = [:]
        if let lastSyncTime = lastSyncTime {
            params["since"] = ISO8601DateFormatter().string(from: lastSyncTime)
        }

        let response: SyncResponse = try await request(
            endpoint: "/vault/sync",
            method: .get,
            queryItems: params
        )

        return SyncResult(
            items: response.items.map { $0.toVaultItem() },
            deletedItemIDs: response.deletedItemIDs,
            serverTime: ISO8601DateFormatter().date(from: response.serverTime) ?? Date()
        )
    }

    /// 推送本地更改到服务器
    /// - Parameter changes: 本地更改列表
    /// - Returns: 推送结果
    func pushChanges(_ changes: [VaultItemChange]) async throws -> PushResult {
        let body: [String: Any] = [
            "changes": changes.map { $0.toDictionary() }
        ]

        let response: PushResponse = try await request(
            endpoint: "/vault/push",
            method: .post,
            body: body
        )

        return PushResult(
            syncedItems: response.syncedItems,
            conflicts: response.conflicts.map { $0.toConflict() },
            serverTime: ISO8601DateFormatter().date(from: response.serverTime) ?? Date()
        )
    }

    // MARK: - 密码库操作

    /// 创建新项目
    func createItem(_ item: VaultItem) async throws -> VaultItem {
        let body = item.toDictionary()
        let response: ItemResponse = try await request(
            endpoint: "/vault/items",
            method: .post,
            body: body
        )
        return response.toVaultItem()
    }

    /// 更新项目
    func updateItem(_ item: VaultItem) async throws -> VaultItem {
        let body = item.toDictionary()
        let response: ItemResponse = try await request(
            endpoint: "/vault/items/\(item.id)",
            method: .put,
            body: body
        )
        return response.toVaultItem()
    }

    /// 删除项目
    func deleteItem(id: String) async throws -> Void {
        let _: EmptyResponse = try await request(
            endpoint: "/vault/items/\(id)",
            method: .delete
        )
    }

    // MARK: - 瞭望塔接口

    /// 获取安全评分摘要
    func getWatchtowerSummary() async throws -> WatchtowerSummary {
        let response: WatchtowerSummaryResponse = try await request(
            endpoint: "/watchtower/summary",
            method: .get
        )
        return WatchtowerSummary(
            securityScore: response.securityScore,
            weakPasswords: response.weakPasswords,
            reusedPasswords: response.reusedPasswords,
            compromisedPasswords: response.compromisedPasswords
        )
    }

    /// 检查密码是否在数据泄露中
    func checkPasswordBreach(_ passwordHash: String) async throws -> BreachCheckResult {
        let body: [String: String] = [
            "hashPrefix": String(passwordHash.prefix(5))
        ]

        let response: BreachCheckResponse = try await request(
            endpoint: "/watchtower/breach/check",
            method: .post,
            body: body
        )

        return BreachCheckResult(
            isBreached: response.isBreached,
            breachCount: response.breachCount,
            lastChecked: Date()
        )
    }

    // MARK: - 网络请求核心

    /// HTTP 方法
    private enum HTTPMethod: String {
        case get = "GET"
        case post = "POST"
        case put = "PUT"
        case delete = "DELETE"
        case patch = "PATCH"
    }

    /// 通用网络请求方法
    /// - Parameters:
    ///   - endpoint: API 端点路径
    ///   - method: HTTP 方法
    ///   - body: 请求体
    ///   - queryItems: 查询参数
    /// - Returns: 解码后的响应
    private func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod,
        body: Encodable? = nil,
        queryItems: [String: String]? = nil
    ) async throws -> T {
        // 构建 URL
        var urlComponents = URLComponents(url: baseURL.appendingPathComponent(endpoint), resolvingAgainstBaseURL: false)!
        if let queryItems = queryItems, !queryItems.isEmpty {
            urlComponents.queryItems = queryItems.map { URLQueryItem(name: $0.key, value: $0.value) }
        }

        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }

        // 构建请求
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("VaultKey-iOS/1.0.0", forHTTPHeaderField: "User-Agent")

        // 添加认证令牌
        if let token = getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // 编码请求体
        if let body = body {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            request.httpBody = try encoder.encode(body)
        }

        // 发送请求
        let (data, response) = try await session.data(for: request)

        // 检查 HTTP 状态码
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            break
        case 401:
            // 令牌过期，尝试刷新
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 429:
            throw APIError.rateLimited
        case 500...599:
            throw APIError.serverError(httpResponse.statusCode)
        default:
            throw APIError.unexpectedStatusCode(httpResponse.statusCode)
        }

        // 解码响应
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingFailed(error)
        }
    }

    // MARK: - 令牌管理

    /// 保存访问令牌和刷新令牌
    private func saveTokens(access: String, refresh: String) {
        KeychainManager.shared.saveSession(token: access)
        UserDefaults.standard.set(refresh, forKey: "vaultkey_refresh_token")
    }

    /// 获取访问令牌
    private func getAccessToken() -> String? {
        KeychainManager.shared.getSession()
    }

    /// 刷新访问令牌
    func refreshAccessToken() async throws -> String {
        guard let refreshToken = UserDefaults.standard.string(forKey: "vaultkey_refresh_token") else {
            throw APIError.unauthorized
        }

        let body: [String: String] = [
            "refreshToken": refreshToken
        ]

        let response: TokenRefreshResponse = try await request(
            endpoint: "/auth/token/refresh",
            method: .post,
            body: body
        )

        saveTokens(access: response.token, refresh: response.refreshToken)
        return response.token
    }
}

// MARK: - SRP 数据模型

/// SRP 服务器挑战
struct SRPChallenge {
    let salt: Data
    let serverPublicKey: Data
    let sessionID: String
}

/// SRP 挑战响应
struct SRPChallengeResponse: Decodable {
    let salt: String
    let serverPublicKey: String
    let sessionID: String
}

// MARK: - 认证数据模型

/// 认证结果
struct AuthResult {
    let token: String
    let refreshToken: String
    let user: UserProfile
}

/// 认证响应
struct AuthResponse: Decodable {
    let token: String
    let refreshToken: String
    let userID: String
    let email: String
    let name: String
    let avatarURL: String?
}

/// 令牌刷新响应
struct TokenRefreshResponse: Decodable {
    let token: String
    let refreshToken: String
}

// MARK: - 同步数据模型

/// 同步结果
struct SyncResult {
    let items: [VaultItem]
    let deletedItemIDs: [String]
    let serverTime: Date
}

/// 同步响应
struct SyncResponse: Decodable {
    let items: [ItemResponse]
    let deletedItemIDs: [String]
    let serverTime: String
}

/// 推送结果
struct PushResult {
    let syncedItems: [String]
    let conflicts: [SyncConflict]
    let serverTime: Date
}

/// 推送响应
struct PushResponse: Decodable {
    let syncedItems: [String]
    let conflicts: [ConflictResponse]
    let serverTime: String
}

/// 项目响应
struct ItemResponse: Decodable {
    let id: String
    let name: String
    let type: String
    let data: [String: String]
    let createdAt: String
    let updatedAt: String

    func toVaultItem() -> VaultItem {
        VaultItem(
            id: id,
            name: name,
            type: VaultItem.ItemType(rawValue: type) ?? .login,
            subtitle: data["username"] ?? data["number"] ?? "",
            createdAt: ISO8601DateFormatter().date(from: createdAt) ?? Date(),
            updatedAt: ISO8601DateFormatter().date(from: updatedAt) ?? Date()
        )
    }
}

/// 冲突响应
struct ConflictResponse: Decodable {
    let itemID: String
    let localVersion: Int
    let serverVersion: Int

    func toConflict() -> SyncConflict {
        SyncConflict(itemID: itemID, localVersion: localVersion, serverVersion: serverVersion)
    }
}

/// 空响应
struct EmptyResponse: Decodable {}

// MARK: - 瞭望塔数据模型

/// 瞭望塔摘要响应
struct WatchtowerSummaryResponse: Decodable {
    let securityScore: Int
    let weakPasswords: Int
    let reusedPasswords: Int
    let compromisedPasswords: Int
}

/// 泄露检查结果
struct BreachCheckResult {
    let isBreached: Bool
    let breachCount: Int
    let lastChecked: Date
}

/// 泄露检查响应
struct BreachCheckResponse: Decodable {
    let isBreached: Bool
    let breachCount: Int
}

// MARK: - 同步变更模型

/// 密码库项目变更
struct VaultItemChange: Encodable {
    let id: String
    let action: ChangeAction
    let data: [String: String]?

    enum ChangeAction: String, Encodable {
        case create
        case update
        case delete
    }

    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "action": action.rawValue
        ]
        if let data = data {
            dict["data"] = data
        }
        return dict
    }
}

/// 同步冲突
struct SyncConflict {
    let itemID: String
    let localVersion: Int
    let serverVersion: Int
}

// MARK: - API 错误

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case forbidden
    case notFound
    case rateLimited
    case serverError(Int)
    case unexpectedStatusCode(Int)
    case decodingFailed(Error)
    case networkUnavailable
    case requestTimeout

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "请求地址无效"
        case .invalidResponse:
            return "服务器响应无效"
        case .unauthorized:
            return "认证已过期，请重新登录"
        case .forbidden:
            return "权限不足"
        case .notFound:
            return "请求的资源不存在"
        case .rateLimited:
            return "请求过于频繁，请稍后重试"
        case .serverError(let code):
            return "服务器错误 (\(code))"
        case .unexpectedStatusCode(let code):
            return "未知错误 (\(code))"
        case .decodingFailed(let error):
            return "数据解析失败: \(error.localizedDescription)"
        case .networkUnavailable:
            return "网络不可用，请检查网络连接"
        case .requestTimeout:
            return "请求超时，请稍后重试"
        }
    }
}
