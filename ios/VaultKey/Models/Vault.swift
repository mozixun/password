import Foundation

/// 密码库模型：表示一个密码库（个人库或共享库）
struct Vault: Identifiable, Codable {
    /// 唯一标识符
    let id: String
    /// 密码库名称
    let name: String
    /// 密码库描述
    let description: String?
    /// 创建时间
    let createdAt: Date
    /// 更新时间
    let updatedAt: Date
    /// 密码库类型
    let vaultType: VaultType
    /// 所有者 ID
    let ownerId: String
    /// 成员列表
    var members: [VaultMember] = []
    /// 项目数量
    var itemCount: Int = 0
    /// 加密密钥（加密存储）
    var encryptedKey: Data?
    /// 是否为默认密码库
    var isDefault: Bool = false
    /// 最后同步时间
    var lastSyncedAt: Date?

    // MARK: - 密码库类型

    /// 密码库类型枚举
    enum VaultType: String, Codable {
        case personal = "个人"
        case shared = "共享"
        case organization = "组织"

        /// 类型图标
        var icon: String {
            switch self {
            case .personal: return "person.fill"
            case .shared: return "person.2.fill"
            case .organization: return "building.2.fill"
            }
        }

        /// 类型颜色
        var color: String {
            switch self {
            case .personal: return "E94560"
            case .shared: return "0F3460"
            case .organization: return "533483"
            }
        }
    }

    // MARK: - 计算属性

    /// 是否为个人密码库
    var isPersonal: Bool { vaultType == .personal }

    /// 是否为共享密码库
    var isShared: Bool { vaultType == .shared || vaultType == .organization }

    /// 格式化的项目数量
    var formattedItemCount: String {
        "\(itemCount) 个项目"
    }

    // MARK: - 转换为字典

    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "name": name,
            "type": vaultType.rawValue,
            "ownerId": ownerId,
            "itemCount": itemCount,
            "isDefault": isDefault,
            "createdAt": ISO8601DateFormatter().string(from: createdAt),
            "updatedAt": ISO8601DateFormatter().string(from: updatedAt)
        ]
        if let description = description {
            dict["description"] = description
        }
        if let lastSyncedAt = lastSyncedAt {
            dict["lastSyncedAt"] = ISO8601DateFormatter().string(from: lastSyncedAt)
        }
        return dict
    }

    // MARK: - 示例数据

    static let sampleVaults: [Vault] = [
        Vault(
            id: "v1",
            name: "个人密码库",
            description: "存储个人密码和敏感信息",
            createdAt: Date().addingTimeInterval(-86400 * 365),
            updatedAt: Date().addingTimeInterval(-86400 * 1),
            vaultType: .personal,
            ownerId: "user1",
            itemCount: 42,
            isDefault: true,
            lastSyncedAt: Date().addingTimeInterval(-300)
        ),
        Vault(
            id: "v2",
            name: "团队共享库",
            description: "团队共享的密码和凭据",
            createdAt: Date().addingTimeInterval(-86400 * 180),
            updatedAt: Date().addingTimeInterval(-86400 * 3),
            vaultType: .shared,
            ownerId: "user1",
            members: VaultMember.sampleMembers,
            itemCount: 18,
            lastSyncedAt: Date().addingTimeInterval(-3600)
        ),
        Vault(
            id: "v3",
            name: "公司组织库",
            description: "公司级别的密码管理",
            createdAt: Date().addingTimeInterval(-86400 * 90),
            updatedAt: Date().addingTimeInterval(-86400 * 7),
            vaultType: .organization,
            ownerId: "org1",
            members: VaultMember.sampleMembers,
            itemCount: 156,
            lastSyncedAt: Date().addingTimeInterval(-7200)
        )
    ]
}

// MARK: - 密码库成员

/// 密码库成员模型
struct VaultMember: Codable, Identifiable {
    /// 唯一标识符
    let id: String
    /// 用户 ID
    let userId: String
    /// 用户名
    let userName: String
    /// 用户邮箱
    let email: String
    /// 角色权限
    let role: MemberRole
    /// 加入时间
    let joinedAt: Date
    /// 是否已确认
    let isConfirmed: Bool

    /// 成员角色枚举
    enum MemberRole: String, Codable {
        case owner = "所有者"
        case admin = "管理员"
        case editor = "编辑者"
        case viewer = "查看者"

        /// 权限级别
        var permissionLevel: Int {
            switch self {
            case .owner: return 4
            case .admin: return 3
            case .editor: return 2
            case .viewer: return 1
            }
        }

        /// 是否可编辑
        var canEdit: Bool {
            self == .owner || self == .admin || self == .editor
        }

        /// 是否可管理
        var canManage: Bool {
            self == .owner || self == .admin
        }
    }

    // MARK: - 示例数据

    static let sampleMembers: [VaultMember] = [
        VaultMember(
            id: "m1",
            userId: "user1",
            userName: "张三",
            email: "zhangsan@example.com",
            role: .owner,
            joinedAt: Date().addingTimeInterval(-86400 * 180),
            isConfirmed: true
        ),
        VaultMember(
            id: "m2",
            userId: "user2",
            userName: "李四",
            email: "lisi@example.com",
            role: .admin,
            joinedAt: Date().addingTimeInterval(-86400 * 90),
            isConfirmed: true
        ),
        VaultMember(
            id: "m3",
            userId: "user3",
            userName: "王五",
            email: "wangwu@example.com",
            role: .editor,
            joinedAt: Date().addingTimeInterval(-86400 * 30),
            isConfirmed: true
        ),
        VaultMember(
            id: "m4",
            userId: "user4",
            userName: "赵六",
            email: "zhaoliu@example.com",
            role: .viewer,
            joinedAt: Date().addingTimeInterval(-86400 * 7),
            isConfirmed: false
        )
    ]
}
