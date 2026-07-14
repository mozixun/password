import SwiftUI

/// 密码生成器视图：支持密码/密码短语模式、长度调节、字符类型切换、强度指示
struct GeneratorView: View {
    @State private var isPassphraseMode = false
    @State private var passwordLength: Double = 20
    @State private var wordCount: Double = 4
    @State private var includeUppercase = true
    @State private var includeLowercase = true
    @State private var includeNumbers = true
    @State private var includeSymbols = true
    @State private var wordSeparator: WordSeparator = .hyphen
    @State private var capitalizeWords = true
    @State private var includeNumberInWord = true
    @State private var generatedPassword = ""
    @State private var generatedPassphrase = ""
    @State private var showCopiedToast = false

    /// 密码短语分隔符
    enum WordSeparator: String, CaseIterable {
        case hyphen = "连字符 (-)"
        case period = "句号 (.)"
        case space = "空格"
        case underscore = "下划线 (_)"
        case camelCase = "驼峰式"

        var character: String {
            switch self {
            case .hyphen: return "-"
            case .period: return "."
            case .space: return " "
            case .underscore: return "_"
            case .camelCase: return ""
            }
        }
    }

    /// 密码强度等级
    var passwordStrength: PasswordStrength {
        let pwd = isPassphraseMode ? generatedPassphrase : generatedPassword
        return PasswordStrength.evaluate(pwd)
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // 生成结果展示
                    generatedResultSection

                    // 模式切换
                    modeToggleSection

                    if isPassphraseMode {
                        // 密码短语选项
                        passphraseOptionsSection
                    } else {
                        // 密码选项
                        passwordOptionsSection
                    }

                    // 强度指示器
                    strengthIndicatorSection

                    // 操作按钮
                    actionButtonsSection
                }
                .padding()
            }
            .navigationTitle("生成器")
            .overlay(
                // 复制成功提示
                Group {
                    if showCopiedToast {
                        ToastView(message: "已复制到剪贴板", icon: "checkmark.circle.fill")
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }
                }
                , alignment: .top
            )
        }
        .onAppear {
            generateNew()
        }
    }

    // MARK: - 生成结果

    private var generatedResultSection: some View {
        VStack(spacing: 12) {
            // 生成的密码/密码短语显示
            Text(isPassphraseMode ? generatedPassphrase : generatedPassword)
                .font(.system(.title3, design: .monospaced))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .lineSpacing(6)
                .padding()
                .frame(maxWidth: .infinity, minHeight: 80)
                .background(Color.white.opacity(0.05))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(passwordStrength.color.opacity(0.3), lineWidth: 2)
                )

            // 重新生成按钮
            Button(action: generateNew) {
                Label("重新生成", systemImage: "arrow.clockwise")
                    .font(.subheadline.bold())
                    .foregroundColor(Color(hex: "E94560"))
            }
        }
    }

    // MARK: - 模式切换

    private var modeToggleSection: some View {
        VStack(spacing: 12) {
            Picker("生成模式", selection: $isPassphraseMode) {
                Text("密码").tag(false)
                Text("密码短语").tag(true)
            }
            .pickerStyle(.segmented)
        }
    }

    // MARK: - 密码选项

    private var passwordOptionsSection: some View {
        VStack(spacing: 16) {
            // 长度滑块
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("密码长度")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    Spacer()
                    Text("\(Int(passwordLength))")
                        .font(.subheadline.bold())
                        .foregroundColor(Color(hex: "E94560"))
                }

                Slider(value: $passwordLength, in: 5...128, step: 1)
                    .tint(Color(hex: "E94560"))
                    .onChange(of: passwordLength) { _ in generateNew() }
            }

            // 字符类型开关
            VStack(spacing: 12) {
                CharacterTypeToggle(
                    title: "大写字母 (A-Z)",
                    icon: "textformat",
                    isOn: $includeUppercase,
                    onToggle: generateNew
                )

                CharacterTypeToggle(
                    title: "小写字母 (a-z)",
                    icon: "textformat.lowercase",
                    isOn: $includeLowercase,
                    onToggle: generateNew
                )

                CharacterTypeToggle(
                    title: "数字 (0-9)",
                    icon: "number",
                    isOn: $includeNumbers,
                    onToggle: generateNew
                )

                CharacterTypeToggle(
                    title: "特殊符号 (!@#$)",
                    icon: "exclamationmark",
                    isOn: $includeSymbols,
                    onToggle: generateNew
                )
            }
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - 密码短语选项

    private var passphraseOptionsSection: some View {
        VStack(spacing: 16) {
            // 单词数量滑块
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("单词数量")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    Spacer()
                    Text("\(Int(wordCount))")
                        .font(.subheadline.bold())
                        .foregroundColor(Color(hex: "E94560"))
                }

                Slider(value: $wordCount, in: 3...20, step: 1)
                    .tint(Color(hex: "E94560"))
                    .onChange(of: wordCount) { _ in generateNew() }
            }

            // 单词分隔符
            VStack(alignment: .leading, spacing: 8) {
                Text("分隔符")
                    .font(.subheadline)
                    .foregroundColor(.gray)

                Picker("分隔符", selection: $wordSeparator) {
                    ForEach(WordSeparator.allCases, id: \.self) { sep in
                        Text(sep.rawValue).tag(sep)
                    }
                }
                .pickerStyle(.menu)
                .onChange(of: wordSeparator) { _ in generateNew() }
            }

            CharacterTypeToggle(
                title: "首字母大写",
                icon: "textformat",
                isOn: $capitalizeWords,
                onToggle: generateNew
            )

            CharacterTypeToggle(
                title: "包含数字",
                icon: "number",
                isOn: $includeNumberInWord,
                onToggle: generateNew
            )
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - 强度指示器

    private var strengthIndicatorSection: some View {
        VStack(spacing: 8) {
            HStack {
                Text("密码强度")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                Spacer()
                Text(passwordStrength.displayName)
                    .font(.subheadline.bold())
                    .foregroundColor(passwordStrength.color)
            }

            // 强度进度条
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 8)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(passwordStrength.color)
                        .frame(
                            width: geometry.size.width * passwordStrength.progress,
                            height: 8
                        )
                        .animation(.easeInOut(duration: 0.3), value: passwordStrength.progress)
                }
            }
            .frame(height: 8)

            // 熵值估算
            HStack {
                Text("熵值估算: \(passwordStrength.entropy) bits")
                    .font(.caption)
                    .foregroundColor(.gray)
                Spacer()
                Text("暴力破解时间: \(passwordStrength.crackTime)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - 操作按钮

    private var actionButtonsSection: some View {
        HStack(spacing: 16) {
            // 复制按钮
            Button(action: copyPassword) {
                HStack {
                    Image(systemName: "doc.on.doc")
                    Text("复制")
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(hex: "E94560"))
                .foregroundColor(.white)
                .cornerRadius(12)
            }

            // 使用此密码（保存到新项目）
            Button(action: {}) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("使用")
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(hex: "0F3460"))
                .foregroundColor(.white)
                .cornerRadius(12)
            }
        }
    }

    // MARK: - 方法

    /// 生成新密码
    private func generateNew() {
        if isPassphraseMode {
            generatedPassphrase = generatePassphrase()
        } else {
            generatedPassword = generatePassword()
        }
    }

    /// 生成随机密码
    private func generatePassword() -> String {
        var characters = ""
        if includeUppercase { characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }
        if includeLowercase { characters += "abcdefghijklmnopqrstuvwxyz" }
        if includeNumbers { characters += "0123456789" }
        if includeSymbols { characters += "!@#$%^&*()_+-=[]{}|;:',.<>?/" }

        guard !characters.isEmpty else { return "" }

        var result = ""
        let length = Int(passwordLength)

        // 确保每种选中的字符类型至少出现一次
        if includeUppercase { result += randomChar(from: "ABCDEFGHIJKLMNOPQRSTUVWXYZ") }
        if includeLowercase { result += randomChar(from: "abcdefghijklmnopqrstuvwxyz") }
        if includeNumbers { result += randomChar(from: "0123456789") }
        if includeSymbols { result += randomChar(from: "!@#$%^&*()_+-=[]{}|;:',.<>?/") }

        // 填充剩余长度
        while result.count < length {
            result += randomChar(from: characters)
        }

        // 打乱顺序
        return String(result.shuffled())
    }

    /// 生成密码短语
    private func generatePassphrase() -> String {
        let wordList = [
            "苹果", "大海", "阳光", "星辰", "森林", "河流", "山脉", "花朵",
            "月亮", "微风", "彩虹", "瀑布", "草原", "沙漠", "冰川", "火山",
            "珊瑚", "翡翠", "琥珀", "珍珠", "水晶", "凤凰", "白鹤", "飞鱼",
            "银杏", "松柏", "紫藤", "茉莉", "向日葵", "薰衣草", "樱花", "桂花"
        ]

        var words: [String] = []
        for _ in 0..<Int(wordCount) {
            var word = wordList.randomElement() ?? "密码"

            if capitalizeWords {
                word = word.prefix(1).uppercased() + word.dropFirst()
            }

            if includeNumberInWord {
                word += "\(Int.random(in: 0...9))"
            }

            words.append(word)
        }

        if wordSeparator == .camelCase {
            return words.map { $0.capitalized }.joined()
        }

        return words.joined(separator: wordSeparator.character)
    }

    /// 从字符串中随机取一个字符
    private func randomChar(from string: String) -> String {
        guard let char = string.randomElement() else { return "" }
        return String(char)
    }

    /// 复制密码到剪贴板
    private func copyPassword() {
        let text = isPassphraseMode ? generatedPassphrase : generatedPassword
        UIPasteboard.general.string = text

        withAnimation(.spring()) {
            showCopiedToast = true
        }

        UINotificationFeedbackGenerator().notificationOccurred(.success)

        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation(.easeOut) {
                showCopiedToast = false
            }
        }
    }
}

// MARK: - 子视图

/// 字符类型开关
struct CharacterTypeToggle: View {
    let title: String
    let icon: String
    @Binding var isOn: Bool
    let onToggle: () -> Void

    var body: some View {
        Toggle(isOn: $isOn) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.subheadline)
                    .foregroundColor(Color(hex: "E94560"))
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
        }
        .toggleStyle(SwitchToggleStyle(tint: Color(hex: "E94560")))
        .onChange(of: isOn) { _ in onToggle() }
    }
}

/// 提示视图
struct ToastView: View {
    let message: String
    let icon: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(.green)
            Text(message)
                .font(.subheadline.bold())
                .foregroundColor(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.green.opacity(0.2))
        .cornerRadius(10)
    }
}

// MARK: - 密码强度模型

enum PasswordStrength {
    case veryWeak
    case weak
    case fair
    case strong
    case veryStrong

    var displayName: String {
        switch self {
        case .veryWeak: return "非常弱"
        case .weak: return "弱"
        case .fair: return "一般"
        case .strong: return "强"
        case .veryStrong: return "非常强"
        }
    }

    var color: Color {
        switch self {
        case .veryWeak: return .red
        case .weak: return .orange
        case .fair: return .yellow
        case .strong: return .green
        case .veryStrong: return Color(hex: "00C853")
        }
    }

    var progress: CGFloat {
        switch self {
        case .veryWeak: return 0.1
        case .weak: return 0.3
        case .fair: return 0.5
        case .strong: return 0.75
        case .veryStrong: return 1.0
        }
    }

    var entropy: Int {
        switch self {
        case .veryWeak: return 28
        case .weak: return 36
        case .fair: return 60
        case .strong: return 80
        case .veryStrong: return 128
        }
    }

    var crackTime: String {
        switch self {
        case .veryWeak: return "几秒"
        case .weak: return "几分钟"
        case .fair: return "数年"
        case .strong: return "数百年"
        case .veryStrong: return "数百万年"
        }
    }

    /// 评估密码强度
    static func evaluate(_ password: String) -> PasswordStrength {
        let length = password.count
        var poolSize = 0

        if password.contains(where: { $0.isUppercase }) { poolSize += 26 }
        if password.contains(where: { $0.isLowercase }) { poolSize += 26 }
        if password.contains(where: { $0.isNumber }) { poolSize += 10 }
        if password.contains(where: { !$0.isLetter && !$0.isNumber }) { poolSize += 32 }

        guard poolSize > 0 else { return .veryWeak }

        let entropy = Double(length) * log2(Double(poolSize))

        switch entropy {
        case ..<28: return .veryWeak
        case 28..<36: return .weak
        case 36..<60: return .fair
        case 60..<80: return .strong
        default: return .veryStrong
        }
    }
}
