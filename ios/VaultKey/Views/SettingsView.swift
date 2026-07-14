import SwiftUI

/// 设置视图：账户安全、自动填充、主题、关于
struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTheme: AppTheme = .system
    @State private var autoLockDuration: AutoLockDuration = .fiveMinutes
    @State private var enableBiometrics = true
    @State private var enableAutoFill = false
    @State private var clearClipboardDuration: ClearClipboardDuration = .thirtySeconds
    @State private var showAccountDetail = false
    @State private var showAbout = false
    @State private var showLogoutConfirm = false

    /// 应用主题
    enum AppTheme: String, CaseIterable {
        case system = "跟随系统"
        case light = "浅色模式"
        case dark = "深色模式"

        var icon: String {
            switch self {
            case .system: return "circle.lefthalf.filled"
            case .light: return "sun.max.fill"
            case .dark: return "moon.fill"
            }
        }
    }

    /// 自动锁定时间
    enum AutoLockDuration: String, CaseIterable {
        case immediately = "立即"
        case oneMinute = "1分钟"
        case fiveMinutes = "5分钟"
        case fifteenMinutes = "15分钟"
        case oneHour = "1小时"
        case never = "从不"
    }

    /// 剪贴板清除时间
    enum ClearClipboardDuration: String, CaseIterable {
        case tenSeconds = "10秒"
        case thirtySeconds = "30秒"
        case oneMinute = "1分钟"
        case twoMinutes = "2分钟"
        case never = "从不"
    }

    var body: some View {
        NavigationView {
            Form {
                // 账户安全
                accountSecuritySection

                // 自动填充
                autoFillSection

                // 安全设置
                securitySettingsSection

                // 外观
                appearanceSection

                // 关于
                aboutSection

                // 退出登录
                logoutSection
            }
            .scrollContentBackground(.hidden)
            .background(Color(hex: "0D1117"))
            .navigationTitle("设置")
            .alert("确认退出登录", isPresented: $showLogoutConfirm) {
                Button("取消", role: .cancel) {}
                Button("退出登录", role: .destructive) {
                    appState.logout()
                }
            } message: {
                Text("退出登录后需要重新输入主密码才能访问密码库")
            }
        }
    }

    // MARK: - 账户安全

    private var accountSecuritySection: some View {
        Section(header: sectionHeader("账户安全")) {
            // 用户信息
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Color(hex: "E94560").opacity(0.15))
                        .frame(width: 50, height: 50)
                    Image(systemName: "person.fill")
                        .font(.title3)
                        .foregroundColor(Color(hex: "E94560"))
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(appState.currentUser?.name ?? "用户")
                        .font(.subheadline.bold())
                        .foregroundColor(.white)
                    Text(appState.currentUser?.email ?? "user@example.com")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .contentShape(Rectangle())
            .onTapGesture { showAccountDetail = true }

            // 生物识别
            if BiometricAuthManager.shared.canUseBiometrics {
                Toggle(isOn: $enableBiometrics) {
                    Label(
                        BiometricAuthManager.shared.biometricType == .faceID ? "Face ID 解锁" : "Touch ID 解锁",
                        systemImage: BiometricAuthManager.shared.biometricType == .faceID ? "faceid" : "touchid"
                    )
                    .foregroundColor(.white)
                }
                .tint(Color(hex: "E94560"))
            }

            // 修改主密码
            SettingsNavigationRow(
                icon: "key.fill",
                title: "修改主密码",
                color: .orange
            ) {}
        }
    }

    // MARK: - 自动填充

    private var autoFillSection: some View {
        Section(header: sectionHeader("自动填充")) {
            Toggle(isOn: $enableAutoFill) {
                Label("密码自动填充", systemImage: "text.append")
                    .foregroundColor(.white)
            }
            .tint(Color(hex: "E94560"))

            if enableAutoFill {
                VStack(alignment: .leading, spacing: 12) {
                    Text("设置自动填充")
                        .font(.subheadline.bold())
                        .foregroundColor(.white)

                    VStack(alignment: .leading, spacing: 8) {
                        instructionRow(number: 1, text: "打开「设置」应用")
                        instructionRow(number: 2, text: "点击「密码」>「密码选项」")
                        instructionRow(number: 3, text: "在「使用密码和通行密钥来源」中选择 VaultKey")
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }

    // MARK: - 安全设置

    private var securitySettingsSection: some View {
        Section(header: sectionHeader("安全")) {
            // 自动锁定时间
            Picker(selection: $autoLockDuration) {
                ForEach(AutoLockDuration.allCases, id: \.self) { duration in
                    Text(duration.rawValue).tag(duration)
                }
            } label: {
                Label("自动锁定", systemImage: "lock.fill")
                    .foregroundColor(.white)
            }

            // 剪贴板清除时间
            Picker(selection: $clearClipboardDuration) {
                ForEach(ClearClipboardDuration.allCases, id: \.self) { duration in
                    Text(duration.rawValue).tag(duration)
                }
            } label: {
                Label("清除剪贴板", systemImage: "clipboard")
                    .foregroundColor(.white)
            }

            // 清除缓存
            SettingsNavigationRow(
                icon: "trash.fill",
                title: "清除缓存",
                color: .red
            ) {}
        }
    }

    // MARK: - 外观

    private var appearanceSection: some View {
        Section(header: sectionHeader("外观")) {
            Picker(selection: $selectedTheme) {
                ForEach(AppTheme.allCases, id: \.self) { theme in
                    Label(theme.rawValue, systemImage: theme.icon).tag(theme)
                }
            } label: {
                Label("主题", systemImage: "paintbrush.fill")
                    .foregroundColor(.white)
            }
        }
    }

    // MARK: - 关于

    private var aboutSection: some View {
        Section(header: sectionHeader("关于")) {
            SettingsNavigationRow(
                icon: "info.circle.fill",
                title: "关于 VaultKey",
                color: .blue
            ) { showAbout = true }

            SettingsNavigationRow(
                icon: "star.fill",
                title: "给我们评分",
                color: .yellow
            ) {}

            SettingsNavigationRow(
                icon: "envelope.fill",
                title: "联系支持",
                color: .green
            ) {}

            HStack {
                Label("版本", systemImage: "number")
                    .foregroundColor(.white)
                Spacer()
                Text("1.0.0 (1)")
                    .foregroundColor(.gray)
            }
        }
    }

    // MARK: - 退出登录

    private var logoutSection: some View {
        Section {
            Button(action: { showLogoutConfirm = true }) {
                HStack {
                    Spacer()
                    Text("退出登录")
                        .font(.headline)
                        .foregroundColor(.red)
                    Spacer()
                }
            }
        }
    }

    // MARK: - 辅助视图

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.subheadline.bold())
            .foregroundColor(.gray)
    }

    private func instructionRow(number: Int, text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            ZStack {
                Circle()
                    .fill(Color(hex: "E94560"))
                    .frame(width: 22, height: 22)
                Text("\(number)")
                    .font(.caption2.bold())
                    .foregroundColor(.white)
            }

            Text(text)
                .font(.subheadline)
                .foregroundColor(.white)
        }
    }
}

// MARK: - 设置导航行

struct SettingsNavigationRow: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(color.opacity(0.15))
                        .frame(width: 30, height: 30)

                    Image(systemName: icon)
                        .font(.caption)
                        .foregroundColor(color)
                }

                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.white)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
    }
}
