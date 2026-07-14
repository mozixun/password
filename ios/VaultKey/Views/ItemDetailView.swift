import SwiftUI

/// 项目详情视图：展示不同类型项目的详细字段，支持复制、TOTP、编辑、分享
struct ItemDetailView: View {
    let item: VaultItem

    @State private var isEditing = false
    @State private var showShareSheet = false
    @State private var copiedField: String? = nil
    @State private var totpCode = "482910"
    @State private var totpRemainingSeconds = 30

    /// TOTP 倒计时计时器
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // 头部信息
                headerSection

                // 类型特定字段
                fieldsSection

                // TOTP 区域（仅登录类型）
                if item.type == .login {
                    totpSection
                }

                // 附加信息
                additionalInfoSection
            }
            .padding()
        }
        .navigationTitle(item.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button(action: { showShareSheet = true }) {
                    Image(systemName: "square.and.arrow.up")
                }

                Button(action: { isEditing.toggle() }) {
                    Text(isEditing ? "完成" : "编辑")
                        .bold()
                }
            }
        }
        .sheet(isPresented: $showShareSheet) {
            // 分享功能
            ActivityViewController(activityItems: [item.name])
        }
        .onReceive(timer) { _ in
            updateTOTP()
        }
    }

    // MARK: - 头部区域

    private var headerSection: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(item.typeColor.opacity(0.15))
                    .frame(width: 60, height: 60)

                Image(systemName: item.typeIcon)
                    .font(.title2.bold())
                    .foregroundColor(item.typeColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.title2.bold())
                    .foregroundColor(.white)

                Text(item.typeDisplayName)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }

            Spacer()
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - 字段区域

    @ViewBuilder
    private var fieldsSection: some View {
        switch item.type {
        case .login:
            loginFields
        case .card:
            cardFields
        case .identity:
            identityFields
        case .note:
            noteFields
        }
    }

    /// 登录信息字段
    private var loginFields: some View {
        VStack(spacing: 0) {
            DetailFieldRow(
                icon: "globe",
                label: "网站",
                value: item.subtitle,
                isSensitive: false,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "person",
                label: "用户名",
                value: "user@example.com",
                isSensitive: false,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "lock",
                label: "密码",
                value: "P@ssw0rd123!",
                isSensitive: true,
                copiedField: $copiedField
            )
        }
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    /// 支付卡字段
    private var cardFields: some View {
        VStack(spacing: 0) {
            DetailFieldRow(
                icon: "creditcard",
                label: "卡号",
                value: "4111 •••• •••• 1234",
                isSensitive: true,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "calendar",
                label: "有效期",
                value: "12/28",
                isSensitive: false,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "lock",
                label: "CVV",
                value: "123",
                isSensitive: true,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "person",
                label: "持卡人",
                value: "张三",
                isSensitive: false,
                copiedField: $copiedField
            )
        }
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    /// 身份信息字段
    private var identityFields: some View {
        VStack(spacing: 0) {
            DetailFieldRow(
                icon: "person",
                label: "姓名",
                value: "张三",
                isSensitive: false,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "phone",
                label: "手机号码",
                value: "138****8888",
                isSensitive: false,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "envelope",
                label: "邮箱",
                value: "zhangsan@example.com",
                isSensitive: false,
                copiedField: $copiedField
            )

            Divider().background(Color.white.opacity(0.1))

            DetailFieldRow(
                icon: "number",
                label: "身份证号",
                value: "110***********1234",
                isSensitive: true,
                copiedField: $copiedField
            )
        }
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    /// 安全笔记字段
    private var noteFields: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("笔记内容", systemImage: "note.text")
                .font(.caption)
                .foregroundColor(.gray)

            Text("这是一条安全笔记的内容，用于保存重要的私密信息。")
                .font(.body)
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white.opacity(0.05))
                .cornerRadius(12)
        }
    }

    // MARK: - TOTP 区域

    private var totpSection: some View {
        VStack(spacing: 12) {
            HStack {
                Label("验证码", systemImage: "lock.shield")
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
            }

            HStack {
                Text(totpCode)
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "E94560"))
                    .tracking(4)

                Spacer()

                // 倒计时圆环
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.1), lineWidth: 3)
                        .frame(width: 40, height: 40)

                    Circle()
                        .trim(from: 0, to: CGFloat(totpRemainingSeconds) / 30)
                        .stroke(Color(hex: "E94560"), style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .frame(width: 40, height: 40)
                        .rotationEffect(.degrees(-90))

                    Text("\(totpRemainingSeconds)")
                        .font(.caption.bold())
                        .foregroundColor(.white)
                }

                // 复制按钮
                Button(action: {
                    UIPasteboard.general.string = totpCode
                    copiedField = "totp"
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        copiedField = nil
                    }
                }) {
                    Image(systemName: copiedField == "totp" ? "checkmark" : "doc.on.doc")
                        .foregroundColor(Color(hex: "E94560"))
                        .padding(8)
                        .background(Color(hex: "E94560").opacity(0.15))
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - 附加信息

    private var additionalInfoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("附加信息")
                .font(.headline)
                .foregroundColor(.white)

            HStack {
                Label("创建时间", systemImage: "calendar.badge.plus")
                Spacer()
                Text("2024年1月15日")
                    .foregroundColor(.gray)
            }
            .font(.subheadline)

            HStack {
                Label("修改时间", systemImage: "pencil.circle")
                Spacer()
                Text("2024年6月20日")
                    .foregroundColor(.gray)
            }
            .font(.subheadline)

            HStack {
                Label("所属密码库", systemImage: "folder.fill")
                Spacer()
                Text("个人")
                    .foregroundColor(.gray)
            }
            .font(.subheadline)
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(16)
    }

    // MARK: - 方法

    /// 更新 TOTP 倒计时
    private func updateTOTP() {
        if totpRemainingSeconds > 0 {
            totpRemainingSeconds -= 1
        } else {
            totpRemainingSeconds = 30
            // 生成新的 TOTP 码
            totpCode = String(format: "%06d", Int.random(in: 0...999999))
        }
    }
}

// MARK: - 子视图

/// 详情字段行
struct DetailFieldRow: View {
    let icon: String
    let label: String
    let value: String
    let isSensitive: Bool
    @Binding var copiedField: String?
    @State private var isRevealed = false

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundColor(.gray)
                .frame(width: 20)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.gray)
                Text(isSensitive && !isRevealed ? maskedValue : value)
                    .font(.subheadline)
                    .foregroundColor(.white)
            }

            Spacer()

            // 显示/隐藏按钮（敏感字段）
            if isSensitive {
                Button(action: { isRevealed.toggle() }) {
                    Image(systemName: isRevealed ? "eye.slash.fill" : "eye.fill")
                        .foregroundColor(.gray)
                        .font(.subheadline)
                }
            }

            // 复制按钮
            Button(action: copyValue) {
                Image(systemName: copiedField == label ? "checkmark" : "doc.on.doc")
                    .foregroundColor(copiedField == label ? .green : Color(hex: "E94560"))
                    .font(.subheadline)
            }
        }
        .padding()
    }

    /// 遮蔽后的值
    private var maskedValue: String {
        String(repeating: "•", count: min(value.count, 12))
    }

    /// 复制字段值
    private func copyValue() {
        UIPasteboard.general.string = value
        copiedField = label
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            copiedField = nil
        }
    }
}

/// 分享活动控制器包装
struct ActivityViewController: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
