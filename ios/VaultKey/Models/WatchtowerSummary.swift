import Foundation

/// 安全瞭望塔摘要模型：汇总密码库的安全状态
struct WatchtowerSummary: Codable {
    /// 安全评分（0-100）
    let securityScore: Int
    /// 弱密码数量
    let weakPasswords: Int
    /// 重复使用密码数量
    let reusedPasswords: Int
    /// 已泄露密码数量
    let compromisedPasswords: Int
    /// 过期密码数量
    var expiredPasswords: Int = 0
    /// 未启用两步验证的数量
    var withoutTwoFactor: Int = 0
    /// 检查时间
    var checkedAt: Date = Date()

    // MARK: - 计算属性

    /// 安全等级
    var securityLevel: SecurityLevel {
        switch securityScore {
        case 90...100: return .excellent
        case 80..<90: return .good
        case 60..<80: return .fair
        case 40..<60: return .poor
        default: return .critical
        }
    }

    /// 安全等级显示名称
    var securityLevelName: String {
        securityLevel.displayName
    }

    /// 安全等级颜色（十六进制）
    var securityLevelColor: String {
        securityLevel.color
    }

    /// 总问题数量
    var totalIssues: Int {
        weakPasswords + reusedPasswords + compromisedPasswords + expiredPasswords
    }

    /// 是否存在严重问题
    var hasCriticalIssues: Bool {
        compromisedPasswords > 0 || securityScore < 40
    }

    /// 安全建议列表
    var recommendations: [String] {
        var tips: [String] = []
        if weakPasswords > 0 {
            tips.append("有 \(weakPasswords) 个弱密码需要更新为更强的密码")
        }
        if reusedPasswords > 0 {
            tips.append("有 \(reusedPasswords) 个密码被重复使用，建议为每个账户设置唯一密码")
        }
        if compromisedPasswords > 0 {
            tips.append("有 \(compromisedPasswords) 个密码已在数据泄露中出现，请立即修改")
        }
        if expiredPasswords > 0 {
            tips.append("有 \(expiredPasswords) 个密码已超过推荐更新周期")
        }
        if withoutTwoFactor > 0 {
            tips.append("有 \(withoutTwoFactor) 个账户未启用两步验证")
        }
        if tips.isEmpty {
            tips.append("您的密码库非常安全，请继续保持良好的密码习惯")
        }
        return tips
    }

    // MARK: - 安全等级枚举

    /// 安全等级枚举
    enum SecurityLevel: String, Codable {
        case excellent = "极好"
        case good = "良好"
        case fair = "一般"
        case poor = "较差"
        case critical = "危险"

        /// 显示名称
        var displayName: String { rawValue }

        /// 颜色（十六进制）
        var color: String {
            switch self {
            case .excellent: return "00C853"
            case .good: return "4CAF50"
            case .fair: return "FFC107"
            case .poor: return "FF5722"
            case .critical: return "D32F2F"
            }
        }

        /// 图标
        var icon: String {
            switch self {
            case .excellent: return "checkmark.shield.fill"
            case .good: return "shield.fill"
            case .fair: return "exclamationmark.shield.fill"
            case .poor: return "xmark.shield.fill"
            case .critical: return "xmark.shield.fill"
            }
        }
    }

    // MARK: - 示例数据

    static let sampleGood = WatchtowerSummary(
        securityScore: 92,
        weakPasswords: 0,
        reusedPasswords: 1,
        compromisedPasswords: 0,
        expiredPasswords: 0,
        withoutTwoFactor: 3
    )

    static let sampleFair = WatchtowerSummary(
        securityScore: 68,
        weakPasswords: 5,
        reusedPasswords: 8,
        compromisedPasswords: 2,
        expiredPasswords: 3,
        withoutTwoFactor: 10
    )

    static let sampleCritical = WatchtowerSummary(
        securityScore: 25,
        weakPasswords: 15,
        reusedPasswords: 20,
        compromisedPasswords: 8,
        expiredPasswords: 10,
        withoutTwoFactor: 25
    )
}

// MARK: - 密码强度详情

/// 单个密码的强度详情
struct PasswordStrengthDetail: Codable, Identifiable {
    /// 唯一标识符
    let id: String
    /// 关联的项目 ID
    let itemId: String
    /// 项目名称
    let itemName: String
    /// 密码强度评分（0-4）
    let strengthScore: Int
    /// 问题类型
    let issueType: IssueType
    /// 问题描述
    let issueDescription: String
    /// 建议操作
    let recommendation: String
    /// 发现时间
    let detectedAt: Date

    /// 问题类型枚举
    enum IssueType: String, Codable {
        case weak = "弱密码"
        case reused = "重复使用"
        case compromised = "已泄露"
        case expired = "已过期"
        case noTwoFactor = "未启用两步验证"

        /// 严重程度
        var severity: Severity {
            switch self {
            case .compromised: return .critical
            case .weak, .reused: return .warning
            case .expired: return .info
            case .noTwoFactor: return .info
            }
        }

        /// 图标
        var icon: String {
            switch self {
            case .weak: return "exclamationmark.triangle.fill"
            case .reused: return "arrow.triangle.swap"
            case .compromised: return "xmark.shield.fill"
            case .expired: return "clock.badge.exclamationmark"
            case .noTwoFactor: return "lock.open"
            }
        }
    }

    /// 严重程度枚举
    enum Severity: String, Codable {
        case critical = "严重"
        case warning = "警告"
        case info = "提示"

        /// 颜色
        var color: String {
            switch self {
            case .critical: return "D32F2F"
            case .warning: return "FF9800"
            case .info: return "2196F3"
            }
        }
    }

    // MARK: - 示例数据

    static let sampleDetails: [PasswordStrengthDetail] = [
        PasswordStrengthDetail(
            id: "ps1",
            itemId: "1",
            itemName: "GitHub",
            strengthScore: 1,
            issueType: .weak,
            issueDescription: "密码仅包含6位数字，容易被暴力破解",
            recommendation: "建议使用12位以上包含大小写字母、数字和特殊符号的密码",
            detectedAt: Date().addingTimeInterval(-86400)
        ),
        PasswordStrengthDetail(
            id: "ps2",
            itemId: "5",
            itemName: "Apple ID",
            strengthScore: 0,
            issueType: .compromised,
            issueDescription: "此密码已在公开的数据泄露中出现",
            recommendation: "请立即修改密码，并确保不在其他服务中使用相同密码",
            detectedAt: Date().addingTimeInterval(-3600)
        ),
        PasswordStrengthDetail(
            id: "ps3",
            itemId: "7",
            itemName: "阿里云控制台",
            strengthScore: 2,
            issueType: .reused,
            issueDescription: "此密码在3个其他项目中也被使用",
            recommendation: "为每个账户设置唯一的密码，避免一处泄露影响全部",
            detectedAt: Date().addingTimeInterval(-7200)
        )
    ]
}
