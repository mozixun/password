import SwiftUI

/// 登录视图：支持邮箱+密码登录和生物识别登录
struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var biometricAuth: BiometricAuthManager

    @State private var email = ""
    @State private var masterPassword = ""
    @State private var rememberDevice = true
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showPassword = false
    @State private var logoScale: CGFloat = 0.5
    @State private var formOpacity: Double = 0
    @State private var formOffset: CGFloat = 30

    var body: some View {
        ZStack {
            // 背景渐变
            LinearGradient(
                colors: [Color(hex: "1A1A2E"), Color(hex: "16213E"), Color(hex: "0F3460")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 28) {
                    Spacer(minLength: 40)

                    // Logo 区域
                    logoSection

                    // 表单区域
                    formSection

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 28)
            }
        }
        .alert("登录失败", isPresented: $showError) {
            Button("确定", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .onAppear {
            playEntranceAnimation()
        }
    }

    // MARK: - Logo 区域

    private var logoSection: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color(hex: "E94560").opacity(0.15))
                    .frame(width: 120, height: 120)

                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 52))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color(hex: "E94560"), Color(hex: "FF6B6B")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }
            .scaleEffect(logoScale)

            Text("VaultKey")
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            Text("安全保管您的密码")
                .font(.subheadline)
                .foregroundColor(.gray)
        }
    }

    // MARK: - 表单区域

    private var formSection: some View {
        VStack(spacing: 20) {
            // 邮箱输入
            VStack(alignment: .leading, spacing: 8) {
                Label("邮箱地址", systemImage: "envelope.fill")
                    .font(.caption)
                    .foregroundColor(.gray)

                TextField("请输入邮箱地址", text: $email)
                    .textFieldStyle(CustomTextFieldStyle())
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .submitLabel(.next)
            }

            // 主密码输入
            VStack(alignment: .leading, spacing: 8) {
                Label("主密码", systemImage: "lock.fill")
                    .font(.caption)
                    .foregroundColor(.gray)

                HStack {
                    if showPassword {
                        TextField("请输入主密码", text: $masterPassword)
                            .textContentType(.password)
                            .submitLabel(.go)
                    } else {
                        SecureField("请输入主密码", text: $masterPassword)
                            .textContentType(.password)
                            .submitLabel(.go)
                    }

                    Button(action: { showPassword.toggle() }) {
                        Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                            .foregroundColor(.gray)
                    }
                }
                .textFieldStyle(CustomTextFieldStyle())
            }
            .onSubmit {
                performLogin()
            }

            // 记住此设备
            Toggle(isOn: $rememberDevice) {
                Text("记住此设备")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .toggleStyle(SwitchToggleStyle(tint: Color(hex: "E94560")))

            // 登录按钮
            Button(action: performLogin) {
                HStack(spacing: 8) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    }
                    Text(isLoading ? "登录中..." : "登录")
                        .font(.headline)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    isFormValid
                        ? LinearGradient(
                            colors: [Color(hex: "E94560"), Color(hex: "C23152")],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                        : LinearGradient(
                            colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.3)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                )
                .foregroundColor(.white)
                .cornerRadius(12)
                .shadow(
                    color: isFormValid ? Color(hex: "E94560").opacity(0.4) : Color.clear,
                    radius: 8, x: 0, y: 4
                )
            }
            .disabled(!isFormValid || isLoading)

            // 生物识别登录
            if biometricAuth.canUseBiometrics {
                Button(action: authenticateWithBiometrics) {
                    HStack(spacing: 10) {
                        Image(systemName: biometricAuth.biometricType == .faceID ? "faceid" : "touchid")
                        Text(biometricAuth.biometricType == .faceID ? "使用 Face ID 登录" : "使用 Touch ID 登录")
                    }
                    .font(.subheadline.bold())
                    .foregroundColor(Color(hex: "E94560"))
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(hex: "E94560").opacity(0.5), lineWidth: 1)
                    )
                }
            }

            // 注册链接
            HStack(spacing: 4) {
                Text("还没有账户？")
                    .foregroundColor(.gray)
                Button(action: {}) {
                    Text("立即注册")
                        .foregroundColor(Color(hex: "E94560"))
                        .bold()
                }
            }
            .font(.subheadline)
            .padding(.top, 8)
        }
        .opacity(formOpacity)
        .offset(y: formOffset)
    }

    // MARK: - 辅助属性

    private var isFormValid: Bool {
        !email.isEmpty && email.contains("@") && !masterPassword.isEmpty && masterPassword.count >= 8
    }

    // MARK: - 方法

    /// 播放入场动画
    private func playEntranceAnimation() {
        withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
            logoScale = 1.0
        }

        withAnimation(.easeOut(duration: 0.6).delay(0.3)) {
            formOpacity = 1.0
            formOffset = 0
        }
    }

    /// 执行登录
    private func performLogin() {
        guard isFormValid else { return }
        isLoading = true

        Task {
            do {
                let user = try await APIService.shared.login(
                    email: email,
                    password: masterPassword
                )

                if rememberDevice {
                    KeychainManager.shared.saveSession(token: user.id)
                }

                await MainActor.run {
                    isLoading = false
                    appState.login(user: user)
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }

    /// 使用生物识别登录
    private func authenticateWithBiometrics() {
        biometricAuth.authenticate { success in
            if success {
                // 生物识别成功，检查是否有保存的会话
                if KeychainManager.shared.hasSavedCredentials() {
                    appState.unlock()
                }
            } else {
                errorMessage = "生物识别验证失败"
                showError = true
            }
        }
    }
}
