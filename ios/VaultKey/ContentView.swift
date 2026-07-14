import SwiftUI

/// 应用全局状态管理
class AppState: ObservableObject {
    /// 是否已登录
    @Published var isAuthenticated: Bool = false
    /// 是否已解锁（通过生物识别或主密码）
    @Published var isUnlocked: Bool = false
    /// 当前用户信息
    @Published var currentUser: UserProfile?
    /// 同步状态
    @Published var syncStatus: SyncStatus = .idle
    /// 是否显示启动画面
    @Published var showSplash: Bool = true

    init() {
        // 检查是否有已保存的登录凭据
        checkExistingSession()
    }

    /// 检查是否存在已保存的会话
    private func checkExistingSession() {
        if KeychainManager.shared.hasSavedCredentials() {
            isAuthenticated = true
            // 需要解锁才能访问数据
            isUnlocked = false
        }
    }

    /// 登录成功
    func login(user: UserProfile) {
        currentUser = user
        withAnimation(.easeInOut(duration: 0.3)) {
            isAuthenticated = true
            isUnlocked = true
        }
    }

    /// 通过生物识别解锁
    func unlock() {
        withAnimation(.easeInOut(duration: 0.3)) {
            isUnlocked = true
        }
    }

    /// 锁定应用
    func lock() {
        withAnimation(.easeInOut(duration: 0.3)) {
            isUnlocked = false
        }
    }

    /// 退出登录
    func logout() {
        withAnimation(.easeInOut(duration: 0.3)) {
            isAuthenticated = false
            isUnlocked = false
            currentUser = nil
        }
        KeychainManager.shared.clearCredentials()
    }
}

/// 同步状态枚举
enum SyncStatus {
    case idle
    case syncing
    case success
    case failed(Error)
}

/// 用户资料模型
struct UserProfile: Codable {
    let id: String
    let email: String
    let name: String
    let avatarURL: String?
    let createdAt: Date
    let lastSyncAt: Date?
}

/// 根视图：根据认证状态显示不同界面
struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var biometricAuth: BiometricAuthManager

    var body: some View {
        Group {
            if appState.showSplash {
                SplashView()
                    .onAppear {
                        // 启动画面延迟消失
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                            withAnimation(.easeOut(duration: 0.5)) {
                                appState.showSplash = false
                            }
                        }
                    }
            } else if !appState.isAuthenticated {
                LoginView()
            } else if !appState.isUnlocked {
                UnlockView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: appState.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: appState.isUnlocked)
    }
}

/// 启动画面
struct SplashView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "1A1A2E"), Color(hex: "16213E")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "E94560"), Color(hex: "FF6B6B")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )

                Text("VaultKey")
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
        }
    }
}

/// 解锁视图：使用 Face ID / Touch ID 解锁
struct UnlockView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var biometricAuth: BiometricAuthManager
    @State private var masterPassword = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isAuthenticating = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "1A1A2E"), Color(hex: "16213E")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 32) {
                // 图标
                Image(systemName: "lock.fill")
                    .font(.system(size: 56))
                    .foregroundColor(Color(hex: "E94560"))
                    .padding(.bottom, 8)

                Text("VaultKey 已锁定")
                    .font(.title2.bold())
                    .foregroundColor(.white)

                Text("使用生物识别或主密码解锁")
                    .font(.subheadline)
                    .foregroundColor(.gray)

                // 生物识别按钮
                if biometricAuth.canUseBiometrics {
                    Button(action: authenticateWithBiometrics) {
                        HStack(spacing: 12) {
                            Image(systemName: biometricAuth.biometricType == .faceID ? "faceid" : "touchid")
                                .font(.title2)
                            Text(biometricAuth.biometricType == .faceID ? "使用 Face ID 解锁" : "使用 Touch ID 解锁")
                                .font(.headline)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(hex: "E94560"))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(isAuthenticating)
                }

                // 主密码输入
                SecureField("输入主密码", text: $masterPassword)
                    .textFieldStyle(CustomTextFieldStyle())
                    .submitLabel(.go)
                    .onSubmit {
                        unlockWithPassword()
                    }

                Button(action: unlockWithPassword) {
                    Text("解锁")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(masterPassword.isEmpty ? Color.gray.opacity(0.3) : Color(hex: "0F3460"))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .disabled(masterPassword.isEmpty || isAuthenticating)
            }
            .padding(.horizontal, 32)
        }
        .alert("解锁失败", isPresented: $showError) {
            Button("确定", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }

    /// 使用生物识别解锁
    private func authenticateWithBiometrics() {
        isAuthenticating = true
        biometricAuth.authenticate { success in
            isAuthenticating = false
            if success {
                appState.unlock()
            } else {
                errorMessage = "生物识别验证失败，请重试或使用主密码解锁"
                showError = true
            }
        }
    }

    /// 使用主密码解锁
    private func unlockWithPassword() {
        guard !masterPassword.isEmpty else { return }
        isAuthenticating = true

        // 验证主密码
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            isAuthenticating = false
            // TODO: 实际验证逻辑
            appState.unlock()
        }
    }
}

// MARK: - 自定义样式

struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Color.white.opacity(0.1))
            .cornerRadius(12)
            .foregroundColor(.white)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
    }
}

// MARK: - Color 扩展

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Keychain 管理器

class KeychainManager {
    static let shared = KeychainManager()

    private init() {}

    func hasSavedCredentials() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "vaultkey_session",
            kSecReturnData as String: false
        ]
        let status = SecItemCopyMatching(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    func saveSession(token: String) {
        let data = token.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "vaultkey_session",
            kSecValueData as String: data
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func getSession() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "vaultkey_session",
            kSecReturnData as String: true
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    func clearCredentials() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: "vaultkey_session"
        ]
        SecItemDelete(query as CFDictionary)
    }
}
