import Foundation

/// 密码库项目模型：表示单个密码项目（登录、支付卡、身份信息、安全笔记等）
struct VaultItem: Identifiable, Codable, Hashable {
    /// 唯一标识符
    let id: String
    /// 项目名称
    let name: String
    /// 项目类型
    let type: ItemType
    /// 副标题（用户名、卡号等）
    let subtitle: String
    /// 创建时间
    let createdAt: Date
    /// 更新时间
    let updatedAt: Date
    /// 所属密码库 ID
    var vaultId: String?
    /// 是否收藏
    var isFavorite: Bool = false
    /// 自定义字段
    var customFields: [CustomField] = []
    /// 附件列表
    var attachments: [Attachment] = []
    /// 标签
    var tags: [String] = []

    // MARK: - 项目类型

    /// 密码库项目类型
    enum ItemType: String, Codable, CaseIterable {
        case login = "登录信息"
        case card = "支付卡"
        case identity = "身份信息"
        case note = "安全笔记"

        /// 类型图标
        var icon: String {
            switch self {
            case .login: return "globe"
            case .card: return "creditcard"
            case .identity: return "person"
            case .note: return "note.text"
            }
        }

        /// 类型颜色
        var color: String {
            switch self {
            case .login: return "E94560"
            case .card: return "0F3460"
            case .identity: return "533483"
            case .note: return "2B9348"
            }
        }
    }

    // MARK: - 计算属性

    /// 类型图标名称
    var typeIcon: String { type.icon }

    /// 类型颜色
    var typeColor: Color {
        // 注意：这里使用 SwiftUI Color，在实际使用时需要 import SwiftUI
        // 为避免循环依赖，使用扩展方式
        Color(hex: type.color)
    }

    /// 类型显示名称
    var typeDisplayName: String { type.rawValue }

    // MARK: - 转换为字典

    /// 转换为 API 请求用的字典
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "name": name,
            "type": type.rawValue,
            "subtitle": subtitle,
            "createdAt": ISO8601DateFormatter().string(from: createdAt),
            "updatedAt": ISO8601DateFormatter().string(from: updatedAt),
            "isFavorite": isFavorite,
            "tags": tags
        ]
        if let vaultId = vaultId {
            dict["vaultId"] = vaultId
        }
        return dict
    }

    // MARK: - 示例数据

    /// 示例项目数据
    static let sampleItems: [VaultItem] = [
        VaultItem(
            id: "1",
            name: "GitHub",
            type: .login,
            subtitle: "developer@github.com",
            createdAt: Date().addingTimeInterval(-86400 * 30),
            updatedAt: Date().addingTimeInterval(-86400 * 2),
            isFavorite: true,
            tags: ["开发", "代码"]
        ),
        VaultItem(
            id: "2",
            name: "招商银行信用卡",
            type: .card,
            subtitle: "•••• •••• •••• 6789",
            createdAt: Date().addingTimeInterval(-86400 * 60),
            updatedAt: Date().addingTimeInterval(-86400 * 10),
            isFavorite: false
        ),
        VaultItem(
            id: "3",
            name: "个人身份信息",
            type: .identity,
            subtitle: "张三",
            createdAt: Date().addingTimeInterval(-86400 * 90),
            updatedAt: Date().addingTimeInterval(-86400 * 30),
            isFavorite: false
        ),
        VaultItem(
            id: "4",
            name: "Wi-Fi 密码备忘",
            type: .note,
            subtitle: "家庭网络",
            createdAt: Date().addingTimeInterval(-86400 * 45),
            updatedAt: Date().addingTimeInterval(-86400 * 5),
            isFavorite: true
        ),
        VaultItem(
            id: "5",
            name: "Apple ID",
            type: .login,
            subtitle: "user@icloud.com",
            createdAt: Date().addingTimeInterval(-86400 * 120),
            updatedAt: Date().addingTimeInterval(-86400 * 1),
            isFavorite: true,
            tags: ["苹果", "重要"]
        ),
        VaultItem(
            id: "6",
            name: "微信支付",
            type: .card,
            subtitle: "已绑定银行卡",
            createdAt: Date().addingTimeInterval(-86400 * 200),
            updatedAt: Date().addingTimeInterval(-86400 * 15),
            isFavorite: false
        ),
        VaultItem(
            id: "7",
            name: "阿里云控制台",
            type: .login,
            subtitle: "admin@example.com",
            createdAt: Date().addingTimeInterval(-86400 * 80),
            updatedAt: Date().addingTimeInterval(-86400 * 3),
            tags: ["云服务"]
        ),
        VaultItem(
            id: "8",
            name: "服务器 SSH 密钥",
            type: .note,
            subtitle: "生产环境",
            createdAt: Date().addingTimeInterval(-86400 * 150),
            updatedAt: Date().addingTimeInterval(-86400 * 20),
            tags: ["服务器", "重要"]
        )
    ]
}

// MARK: - 自定义字段

/// 自定义字段模型
struct CustomField: Codable, Hashable {
    /// 字段名称
    let name: String
    /// 字段值
    let value: String
    /// 字段类型
    let fieldType: FieldType

    /// 字段类型枚举
    enum FieldType: String, Codable {
        case text = "文本"
        case hidden = "隐藏"
        case boolean = "布尔值"
        case link = "链接"
        case totp = "TOTP"
    }
}

// MARK: - 附件

/// 附件模型
struct Attachment: Codable, Hashable {
    /// 附件 ID
    let id: String
    /// 文件名
    let fileName: String
    /// 文件大小（字节）
    let fileSize: Int64
    /// MIME 类型
    let mimeType: String
    /// 上传时间
    let uploadedAt: Date

    /// 格式化文件大小
    var formattedSize: String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: fileSize)
    }
}

// MARK: - 需要导入 SwiftUI 来支持 Color

import SwiftUI

extension VaultItem {
    /// 类型颜色（SwiftUI Color）
    var typeColorUI: Color {
        Color(hex: type.color)
    }
}
