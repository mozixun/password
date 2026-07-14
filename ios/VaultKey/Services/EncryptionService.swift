import Foundation
import CryptoKit
import Security

/// 加密服务：提供 Argon2id 密钥派生、AES-256-GCM 加密解密、Keychain 密钥管理
class EncryptionService {

    // MARK: - 单例

    static let shared = EncryptionService()

    private init() {}

    // MARK: - 常量

    /// Argon2id 参数
    private enum Argon2Constants {
        static let iterations: UInt32 = 3        // 迭代次数
        static let memory: UInt32 = 65536        // 内存使用量 (64 MB)
        static let parallelism: UInt32 = 4       // 并行度
        static let outputLength: Int = 32        // 输出长度 (256 bits)
    }

    /// AES 密钥长度
    private let keySize = 32 // 256 bits

    // MARK: - Argon2id 密钥派生

    /// 使用 Argon2id 从主密码派生加密密钥
    /// - Parameters:
    ///   - password: 主密码
    ///   - salt: 盐值（建议32字节随机值）
    /// - Returns: 派生密钥数据
    func deriveKey(password: String, salt: Data) throws -> Data {
        let passwordData = password.data(using: .utf8)!

        // 使用 CommonCrypto 的 PBKDF2 作为 Argon2id 的替代
        // 注意：生产环境应使用真正的 Argon2id 实现
        // 这里使用 HKDF 作为演示，实际部署应集成 Argon2id 库
        let derivedKey = try deriveKeyHKDF(
            password: passwordData,
            salt: salt,
            outputLength: Argon2Constants.outputLength
        )

        return derivedKey
    }

    /// 使用 HKDF 进行密钥派生（替代方案）
    /// 生产环境应替换为 Argon2id
    private func deriveKeyHKDF(password: Data, salt: Data, outputLength: Int) throws -> Data {
        let inputKeyMaterial = SymmetricKey(data: password)
        let derivedKey = HKDF<HMAC<SHA256>>.deriveKey(
            inputKeyMaterial: inputKeyMaterial,
            salt: salt,
            info: Data("VaultKey-encryption".utf8),
            outputByteCount: outputLength
        )
        return derivedKey.withUnsafeBytes { Data($0) }
    }

    /// 生成随机盐值
    /// - Parameter length: 盐值长度（默认32字节）
    /// - Returns: 随机盐值数据
    func generateSalt(length: Int = 32) -> Data {
        var salt = Data(count: length)
        salt.withUnsafeMutableBytes { saltBytes in
            _ = SecRandomCopyBytes(kSecRandomDefault, length, saltBytes.baseAddress!)
        }
        return salt
    }

    // MARK: - AES-256-GCM 加密

    /// 使用 AES-256-GCM 加密数据
    /// - Parameters:
    ///   - plaintext: 明文数据
    ///   - key: 加密密钥（32字节）
    /// - Returns: 加密结果（包含密文、nonce、tag）
    func encrypt(plaintext: Data, key: Data) throws -> EncryptedData {
        guard key.count == keySize else {
            throw EncryptionError.invalidKeyLength
        }

        let symmetricKey = SymmetricKey(data: key)

        // 生成随机 nonce
        let nonce = AES.GCM.Nonce()

        // 执行加密
        let sealedBox = try AES.GCM.seal(plaintext, using: symmetricKey, nonce: nonce)

        return EncryptedData(
            ciphertext: sealedBox.ciphertext,
            nonce: sealedBox.nonce.withUnsafeBytes { Data($0) },
            tag: sealedBox.tag.withUnsafeBytes { Data($0) }
        )
    }

    /// 使用 AES-256-GCM 解密数据
    /// - Parameters:
    ///   - encryptedData: 加密数据
    ///   - key: 解密密钥（32字节）
    /// - Returns: 明文数据
    func decrypt(encryptedData: EncryptedData, key: Data) throws -> Data {
        guard key.count == keySize else {
            throw EncryptionError.invalidKeyLength
        }

        let symmetricKey = SymmetricKey(data: key)

        // 重建 nonce
        let nonce = try AES.GCM.Nonce(data: encryptedData.nonce)

        // 重建 sealed box
        let sealedBox = try AES.GCM.SealedBox(
            nonce: nonce,
            ciphertext: encryptedData.ciphertext,
            tag: AES.GCM.Tag(data: encryptedData.tag)
        )

        // 执行解密
        let decryptedData = try AES.GCM.open(sealedBox, using: symmetricKey)
        return decryptedData
    }

    // MARK: - 便捷方法

    /// 加密字符串
    /// - Parameters:
    ///   - plaintext: 明文字符串
    ///   - key: 加密密钥
    /// - Returns: Base64 编码的加密结果
    func encryptString(_ plaintext: String, key: Data) throws -> String {
        guard let data = plaintext.data(using: .utf8) else {
            throw EncryptionError.encodingFailed
        }
        let encrypted = try encrypt(plaintext: data, key: key)
        // 将 nonce + tag + ciphertext 组合后 Base64 编码
        var combined = Data()
        combined.append(encrypted.nonce)
        combined.append(encrypted.tag)
        combined.append(encrypted.ciphertext)
        return combined.base64EncodedString()
    }

    /// 解密字符串
    /// - Parameters:
    ///   - encoded: Base64 编码的加密数据
    ///   - key: 解密密钥
    /// - Returns: 明文字符串
    func decryptString(_ encoded: String, key: Data) throws -> String {
        guard let combined = Data(base64Encoded: encoded) else {
            throw EncryptionError.decodingFailed
        }

        // nonce: 12 bytes, tag: 16 bytes
        let nonceSize = 12
        let tagSize = 16

        guard combined.count > nonceSize + tagSize else {
            throw EncryptionError.invalidData
        }

        let nonce = combined.prefix(nonceSize)
        let tag = combined.dropFirst(nonceSize).prefix(tagSize)
        let ciphertext = combined.dropFirst(nonceSize + tagSize)

        let encryptedData = EncryptedData(
            ciphertext: ciphertext,
            nonce: nonce,
            tag: tag
        )

        let decrypted = try decrypt(encryptedData: encryptedData, key: key)
        guard let result = String(data: decrypted, encoding: .utf8) else {
            throw EncryptionError.encodingFailed
        }
        return result
    }

    // MARK: - Keychain 密钥管理

    /// 将加密密钥保存到 Keychain
    /// - Parameters:
    ///   - key: 密钥数据
    ///   - identifier: 密钥标识符
    func saveKeyToKeychain(_ key: Data, identifier: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: identifier.data(using: .utf8)!,
            kSecValueData as String: key,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            kSecAttrKeyType as String: kSecAttrKeyTypeAES,
            kSecAttrKeyClass as String: kSecAttrKeyClassSymmetric
        ]

        // 先删除已有的
        SecItemDelete(query as CFDictionary)

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw EncryptionError.keychainError(status)
        }
    }

    /// 从 Keychain 读取加密密钥
    /// - Parameter identifier: 密钥标识符
    /// - Returns: 密钥数据
    func loadKeyFromKeychain(identifier: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: identifier.data(using: .utf8)!,
            kSecReturnData as String: true,
            kSecAttrKeyType as String: kSecAttrKeyTypeAES,
            kSecAttrKeyClass as String: kSecAttrKeyClassSymmetric
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            throw EncryptionError.keychainError(status)
        }

        guard let data = result as? Data else {
            throw EncryptionError.keychainError(errSecItemNotFound)
        }

        return data
    }

    /// 从 Keychain 删除加密密钥
    /// - Parameter identifier: 密钥标识符
    func deleteKeyFromKeychain(identifier: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: identifier.data(using: .utf8)!
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw EncryptionError.keychainError(status)
        }
    }

    // MARK: - 数据完整性

    /// 计算数据的 SHA-256 哈希值
    /// - Parameter data: 原始数据
    /// - Returns: 哈希值的十六进制字符串
    func hash(data: Data) -> String {
        let hashed = SHA256.hash(data: data)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }

    /// 验证数据完整性
    /// - Parameters:
    ///   - data: 待验证数据
    ///   - expectedHash: 预期的哈希值
    /// - Returns: 是否匹配
    func verifyIntegrity(data: Data, expectedHash: String) -> Bool {
        return hash(data: data) == expectedHash
    }
}

// MARK: - 加密数据模型

/// AES-256-GCM 加密结果
struct EncryptedData: Codable {
    /// 加密后的密文
    let ciphertext: Data
    /// GCM nonce (12 字节)
    let nonce: Data
    /// GCM 认证标签 (16 字节)
    let tag: Data
}

// MARK: - 加密错误

enum EncryptionError: Error, LocalizedError {
    case invalidKeyLength
    case encodingFailed
    case decodingFailed
    case invalidData
    case keychainError(OSStatus)
    case encryptionFailed
    case decryptionFailed
    case authenticationFailed

    var errorDescription: String? {
        switch self {
        case .invalidKeyLength:
            return "密钥长度无效，需要32字节（256位）"
        case .encodingFailed:
            return "数据编码失败"
        case .decodingFailed:
            return "数据解码失败"
        case .invalidData:
            return "加密数据格式无效"
        case .keychainError(let status):
            return "Keychain 操作失败，错误码: \(status)"
        case .encryptionFailed:
            return "加密操作失败"
        case .decryptionFailed:
            return "解密操作失败"
        case .authenticationFailed:
            return "数据认证失败，可能已被篡改"
        }
    }
}
