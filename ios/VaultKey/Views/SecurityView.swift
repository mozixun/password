import SwiftUI

/// 安全中心视图（瞭望塔）：安全评分、弱密码/重复密码/泄露密码列表、修复操作
struct SecurityView: View {
    @State private var securityScore: Int = 72
    @State private var weakPasswords: [VaultItem] = []
    @State private var reusedPasswords: [VaultItem] = []
    @State private var compromisedPasswords: [VaultItem] = []
    @State private var selectedFilter: SecurityFilter = .all
    @State private var isLoading = true

    /// 安全筛选类型
    enum SecurityFilter: String, CaseIterable {
        case all = "全部"
        case weak = "弱密码"
        case reused = "重复使用"
        case compromised = "已泄露"

        var icon: String {
            switch self {
            case .all: return "shield.checkered"
            case .weak: return "exclamationmark.triangle"
            case .reused: return "arrow.triangle.swap"
            case .compromised: return "xmark.shield"
            }
        }

        var color: Color {
            switch self {
            case .all: return .blue
            case .weak: return .orange
            case .reused: return .yellow
            case .compromised: return .red
            }
        }
    }

    /// 当前显示的问题列表
    var currentIssues: [SecurityIssue] {
        var issues: [SecurityIssue] = []

        for item in weakPasswords {
            issues.append(SecurityIssue(item: item, type: .weak, description: "密码强度不足，建议使用更强的密码"))
        }
        for item in reusedPasswords {
            issues.append(SecurityIssue(item: item, type: .reused, description: "此密码在多个项目中重复使用"))
        }
        for item in compromisedPasswords {
            issues.append(SecurityIssue(item: item, type: .compromised, description: "此密码已在数据泄露中被发现"))
        }

        if selectedFilter != .all {
            issues = issues.filter { $0.type == selectedFilter }
        }

        return issues
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // 安全评分
                    securityScoreCard

                    // 统计摘要
                    statsSummary

                    // 筛选器
                    filterChips

                    // 问题列表
                    issuesList
                }
                .padding()
            }
            .navigationTitle("安全")
            .overlay(Group {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "E94560")))
                }
            })
        }
        .task {
            await loadSecurityData()
        }
    }

    // MARK: - 安全评分卡片

    private var securityScoreCard: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 14)
                    .frame(width: 180, height: 180)

                Circle()
                    .trim(from: 0, to: CGFloat(securityScore) / 100)
                    .stroke(
                        scoreGradient,
                        style: StrokeStyle(lineWidth: 14, lineCap: .round)
                    )
                    .frame(width: 180, height: 180)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 4) {
                    Text("\(securityScore)")
                        .font(.system(size: 52, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("安全评分")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }

            Text(securityMessage)
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    /// 安全评分渐变色
    private var scoreGradient: LinearGradient {
        switch securityScore {
        case 80...100:
            return LinearGradient(colors: [.green, Color(hex: "00C853")], startPoint: .top, endPoint: .bottom)
        case 60..<80:
            return LinearGradient(colors: [.orange, .yellow], startPoint: .top, endPoint: .bottom)
        default:
            return LinearGradient(colors: [.red, .orange], startPoint: .top, endPoint: .bottom)
        }
    }

    /// 安全评分消息
    private var securityMessage: String {
        switch securityScore {
        case 90...100: return "您的密码库非常安全！继续保持良好的密码习惯。"
        case 80..<90: return "安全性良好，但仍有一些可以改进的地方。"
        case 60..<80: return "存在一些安全隐患，建议尽快修复弱密码和重复使用的密码。"
        default: return "您的密码库存在严重安全隐患，请立即处理！"
        }
    }

    // MARK: - 统计摘要

    private var statsSummary: some View {
        HStack(spacing: 12) {
            StatCard(
                title: "弱密码",
                count: weakPasswords.count,
                icon: "exclamationmark.triangle.fill",
                color: .orange
            )

            StatCard(
                title: "重复使用",
                count: reusedPasswords.count,
                icon: "arrow.triangle.swap",
                color: .yellow
            )

            StatCard(
                title: "已泄露",
                count: compromisedPasswords.count,
                icon: "xmark.shield.fill",
                color: .red
            )
        }
    }

    // MARK: - 筛选器

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(SecurityFilter.allCases, id: \.self) { filter in
                    FilterChip(
                        title: filter.rawValue,
                        icon: filter.icon,
                        color: filter.color,
                        isSelected: selectedFilter == filter,
                        action: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                selectedFilter = filter
                            }
                        }
                    )
                }
            }
        }
    }

    // MARK: - 问题列表

    private var issuesList: some View {
        VStack(spacing: 12) {
            if currentIssues.isEmpty {
                noIssuesView
            } else {
                ForEach(currentIssues) { issue in
                    SecurityIssueRow(issue: issue)
                }
            }
        }
    }

    private var noIssuesView: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 48))
                .foregroundColor(.green)
            Text("没有发现问题")
                .font(.headline)
                .foregroundColor(.white)
            Text("所有密码都符合安全要求")
                .font(.subheadline)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    // MARK: - 方法

    private func loadSecurityData() async {
        try? await Task.sleep(nanoseconds: 800_000_000)
        weakPasswords = Array(VaultItem.sampleItems.prefix(3))
        reusedPasswords = Array(VaultItem.sampleItems.prefix(5))
        compromisedPasswords = Array(VaultItem.sampleItems.prefix(1))
        isLoading = false
    }
}

// MARK: - 子视图

/// 统计卡片
struct StatCard: View {
    let title: String
    let count: Int
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)

            Text("\(count)")
                .font(.title2.bold())
                .foregroundColor(.white)

            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

/// 筛选标签
struct FilterChip: View {
    let title: String
    let icon: String
    let color: Color
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption)
                Text(title)
                    .font(.subheadline.bold())
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? color.opacity(0.2) : Color.white.opacity(0.05))
            .foregroundColor(isSelected ? color : .gray)
            .cornerRadius(20)
            .overlay(
                Capsule()
                    .stroke(isSelected ? color.opacity(0.5) : Color.clear, lineWidth: 1)
            )
        }
    }
}

/// 安全问题行
struct SecurityIssueRow: View {
    let issue: SecurityView.SecurityIssue

    var body: some View {
        HStack(spacing: 14) {
            // 严重程度图标
            ZStack {
                Circle()
                    .fill(issue.type.color.opacity(0.15))
                    .frame(width: 40, height: 40)

                Image(systemName: issue.type.icon)
                    .font(.subheadline.bold())
                    .foregroundColor(issue.type.color)
            }

            // 项目信息
            VStack(alignment: .leading, spacing: 4) {
                Text(issue.item.name)
                    .font(.subheadline.bold())
                    .foregroundColor(.white)

                Text(issue.description)
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineLimit(2)
            }

            Spacer()

            // 修复按钮
            NavigationLink(destination: ItemDetailView(item: issue.item)) {
                Text("修复")
                    .font(.caption.bold())
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(issue.type.color)
                    .cornerRadius(8)
            }
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

// MARK: - 安全问题模型

extension SecurityView {
    struct SecurityIssue: Identifiable {
        let id = UUID()
        let item: VaultItem
        let type: SecurityFilter
        let description: String
    }
}

extension SecurityView.SecurityFilter {
    var icon: String {
        switch self {
        case .all: return "shield.checkered"
        case .weak: return "exclamationmark.triangle.fill"
        case .reused: return "arrow.triangle.swap"
        case .compromised: return "xmark.shield.fill"
        }
    }
}
