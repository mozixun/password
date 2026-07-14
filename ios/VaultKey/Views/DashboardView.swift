import SwiftUI

/// 首页仪表盘视图：安全评分、最近项目、快捷操作、安全提醒
struct DashboardView: View {
    @EnvironmentObject var appState: AppState
    @State private var securityScore: Int = 85
    @State private var recentItems: [VaultItem] = []
    @State private var securityAlerts: [SecurityAlert] = []
    @State private var isRefreshing = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // 安全评分环形图
                    securityScoreSection

                    // 快捷操作按钮
                    quickActionsSection

                    // 最近使用的项目
                    recentItemsSection

                    // 安全提醒
                    if !securityAlerts.isEmpty {
                        securityAlertsSection
                    }
                }
                .padding()
            }
            .navigationTitle("首页")
            .background(Color(hex: "0D1117"))
            .refreshable {
                await refreshData()
            }
        }
        .onAppear {
            loadDashboardData()
        }
    }

    // MARK: - 安全评分

    private var securityScoreSection: some View {
        VStack(spacing: 16) {
            ZStack {
                // 背景圆环
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 12)
                    .frame(width: 160, height: 160)

                // 进度圆环
                Circle()
                    .trim(from: 0, to: CGFloat(securityScore) / 100)
                    .stroke(
                        scoreColor,
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 160, height: 160)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 1.0), value: securityScore)

                // 分数文字
                VStack(spacing: 4) {
                    Text("\(securityScore)")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("安全评分")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }

            HStack(spacing: 24) {
                ScoreStatItem(title: "弱密码", count: 3, color: .red)
                ScoreStatItem(title: "重复使用", count: 5, color: .orange)
                ScoreStatItem(title: "已泄露", count: 1, color: .purple)
            }
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    /// 根据分数返回对应颜色
    private var scoreColor: Color {
        switch securityScore {
        case 80...100: return .green
        case 60..<80: return .orange
        default: return .red
        }
    }

    // MARK: - 快捷操作

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("快捷操作")
                .font(.headline)
                .foregroundColor(.white)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                QuickActionButton(
                    icon: "plus.circle.fill",
                    title: "添加项目",
                    color: Color(hex: "E94560")
                ) {}

                QuickActionButton(
                    icon: "wand.and.stars",
                    title: "生成密码",
                    color: Color(hex: "0F3460")
                ) {}

                QuickActionButton(
                    icon: "arrow.triangle.2.circlepath",
                    title: "同步",
                    color: Color(hex: "533483")
                ) {}
            }
        }
    }

    // MARK: - 最近项目

    private var recentItemsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("最近使用")
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
                Button("查看全部") {}
                    .font(.subheadline)
                    .foregroundColor(Color(hex: "E94560"))
            }

            if recentItems.isEmpty {
                emptyRecentItemsView
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(recentItems.prefix(10)) { item in
                            RecentItemCard(item: item)
                        }
                    }
                }
            }
        }
    }

    private var emptyRecentItemsView: some View {
        VStack(spacing: 12) {
            Image(systemName: "clock")
                .font(.system(size: 36))
                .foregroundColor(.gray)
            Text("暂无最近使用的项目")
                .font(.subheadline)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }

    // MARK: - 安全提醒

    private var securityAlertsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("安全提醒")
                .font(.headline)
                .foregroundColor(.white)

            ForEach(securityAlerts) { alert in
                SecurityAlertRow(alert: alert)
            }
        }
    }

    // MARK: - 方法

    private func loadDashboardData() {
        // TODO: 从服务层加载实际数据
        recentItems = VaultItem.sampleItems
        securityAlerts = SecurityAlert.sampleAlerts
    }

    private func refreshData() async {
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        loadDashboardData()
    }
}

// MARK: - 子视图

/// 评分统计项
struct ScoreStatItem: View {
    let title: String
    let count: Int
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text("\(count)")
                .font(.title3.bold())
                .foregroundColor(color)
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
}

/// 快捷操作按钮
struct QuickActionButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                Text(title)
                    .font(.caption)
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(color.opacity(0.15))
            .cornerRadius(12)
        }
    }
}

/// 最近项目卡片
struct RecentItemCard: View {
    let item: VaultItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: item.typeIcon)
                .font(.title3)
                .foregroundColor(Color(hex: "E94560"))

            Text(item.name)
                .font(.subheadline.bold())
                .foregroundColor(.white)
                .lineLimit(1)

            Text(item.subtitle)
                .font(.caption)
                .foregroundColor(.gray)
                .lineLimit(1)
        }
        .frame(width: 140)
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

/// 安全提醒行
struct SecurityAlertRow: View {
    let alert: SecurityAlert

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: alert.severityIcon)
                .font(.title3)
                .foregroundColor(alert.severityColor)

            VStack(alignment: .leading, spacing: 4) {
                Text(alert.title)
                    .font(.subheadline.bold())
                    .foregroundColor(.white)
                Text(alert.description)
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineLimit(2)
            }

            Spacer()

            Button("修复") {}
                .font(.caption.bold())
                .foregroundColor(Color(hex: "E94560"))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(hex: "E94560").opacity(0.15))
                .cornerRadius(8)
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

// MARK: - 安全提醒模型

struct SecurityAlert: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let severity: Severity

    enum Severity {
        case critical, warning, info

        var icon: String {
            switch self {
            case .critical: return "exclamationmark.triangle.fill"
            case .warning: return "exclamationmark.circle.fill"
            case .info: return "info.circle.fill"
            }
        }

        var color: Color {
            switch self {
            case .critical: return .red
            case .warning: return .orange
            case .info: return .blue
            }
        }
    }

    var severityIcon: String { severity.icon }
    var severityColor: Color { severity.color }

    static let sampleAlerts: [SecurityAlert] = [
        SecurityAlert(title: "发现泄露密码", description: "3个密码已在数据泄露中出现，请立即修改", severity: .critical),
        SecurityAlert(title: "弱密码检测", description: "5个项目使用了弱密码，建议更新", severity: .warning),
        SecurityAlert(title: "同步完成", description: "所有数据已同步至最新版本", severity: .info)
    ]
}
