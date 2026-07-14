import Foundation
import LocalAuthentication

/// 生物识别认证管理器：支持 Face ID / Touch ID，降级为主密码验证
class BiometricAuthManager: ObservableObject {

    // MARK: - 发布属性

    /// 是否可以使用生物识别
    @Published var canUseBiometrics: Bool = false

    /// 生物识别类型
    @Published var biometricType: BiometricType = .none

    /// 是否正在认证
    @Published var isAuthenticating: Bool = false

    // MARK: - 单例（供非 SwiftUI 场景使用）

    static let shared = BiometricAuthManager()

    // MARK: - 生物识别类型

    enum BiometricType {
        case none
        case faceID
        case touchID

        var displayName: String {
            switch self {
            case .none: return "不可用"
            case .faceID: return "Face ID"
            case .touchID: return "Touch ID"
            }
        }
    }

    // MARK: - 初始化

    init() {
        checkBiometricAvailability()
    }

    // MARK: - 检查生物识别可用性

    /// 检查设备是否支持生物识别及类型
    private func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            canUseBiometrics = false
            biometricType = .none
            return
        }

        canUseBiometrics = true

        // 确定生物识别类型
        switch context.biometryType {
        case .faceID:
            biometricType = .faceID
        case .touchID:
            biometricType = .touchID
        default:
            biometricType = .none
            canUseBiometrics = false
        }
    }

    // MARK: - 生物识别认证

    /// 执行生物识别认证
    /// - Parameter completion: 认证结果回调
    func authenticate(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        context.localizedCancelTitle = "使用主密码"
        context.localizedFallbackTitle = "使用主密码"

        // 先检查可用性
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            // 生物识别不可用，尝试设备密码
            authenticateWithDevicePassword(completion: completion)
            return
        }

        isAuthenticating = true

        let reason = biometricType == .faceID
            ? "使用 Face ID 验证您的身份以解锁 VaultKey"
            : "使用 Touch ID 验证您的身份以解锁 VaultKey"

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { [weak self] success, error in
            DispatchQueue.main.async {
                self?.isAuthenticating = false

                if success {
                    completion(true)
                } else {
                    // 认证失败或用户取消
                    if let error = error as? LAError {
                        switch error.code {
                        case .userFallback:
                            // 用户选择使用主密码
                            completion(false)
                        case .userCancel:
                            completion(false)
                        case .biometryNotAvailable:
                            // 生物识别不可用，降级到设备密码
                            self?.authenticateWithDevicePassword(completion: completion)
                        default:
                            completion(false)
                        }
                    } else {
                        completion(false)
                    }
                }
            }
        }
    }

    /// 使用设备密码认证（降级方案）
    /// - Parameter completion: 认证结果回调
    private func authenticateWithDevicePassword(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            completion(false)
            return
        }

        isAuthenticating = true

        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "验证您的身份以解锁 VaultKey") { [weak self] success, _ in
            DispatchQueue.main.async {
                self?.isAuthenticating = false
                completion(success)
            }
        }
    }

    // MARK: - 检查生物识别状态

    /// 检查生物识别是否已注册
    /// - Returns: 是否已注册生物识别
    func isBiometryEnrolled() -> Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }

    /// 检查生物识别是否已锁定（太多次失败后）
    /// - Returns: 是否已锁定
    func isBiometryLocked() -> Bool {
        let context = LAContext()
        var error: NSError?
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)

        if let error = error as? LAError {
            return error.code == .biometryLockout
        }
        return false
    }

    /// 刷新生物识别可用性状态
    func refreshAvailability() {
        checkBiometricAvailability()
    }
}
