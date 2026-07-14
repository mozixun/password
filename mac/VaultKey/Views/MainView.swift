import SwiftUI

/// Mac 主视图：三栏分割视图（侧边栏 + 内容区 + 详情区）
struct MainView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedSidebarItem: SidebarItem? = .allItems
    @State private var selectedVaultItem: VaultItem?
    @State private var searchText = ""
    @State private var columnVisibility: NavigationSplitViewVisibility = .all

    /// 侧边栏项目
    enum SidebarItem: String, CaseIterable, Identifiable {
        case allItems = "所有项目"
        case favorites = "收藏"
        case login = "登录信息"
        case card = "支付卡"
        case identity = "身份信息"
        case note = "安全笔记"
        case trash = "回收站"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .allItems: return "square.grid.2x2"
            case .favorites: return "star"
            case .login: return "globe"
            case .card: return "creditcard"
            case .identity: return "person"
            case .note: return "note.text"
            case .trash: return "trash"
            }
        }

        var itemCount: Int {
            switch self {
            case .allItems: return 42
            case .favorites: return 5
            case .login: return 25
            case .card: return 8
            case .identity: return 3
            case .note: return 6
            case .trash: return 2
            }
        }
    }

    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            // 侧边栏
            sidebar
        } content: {
            // 内容区（项目列表）
            contentList
        } detail: {
            // 详情区
            if let item = selectedVaultItem {
                MacItemDetailView(item: item)
            } else {
                emptyDetailView
            }
        }
        .navigationTitle("VaultKey")
        .searchable(text: $searchText, prompt: "搜索项目...")
        .onChange(of: selectedSidebarItem) { _ in
            selectedVaultItem = nil
        }
    }

    // MARK: - 侧边栏

    private var sidebar: some View {
        List(selection: $selectedSidebarItem) {
            // 项目分类
            Section("密码库") {
                ForEach(SidebarItem.allCases.filter { $0 != .trash }) { item in
                    SidebarRow(item: item, isSelected: selectedSidebarItem == item)
                        .tag(item)
                }
            }

            // 密码库列表
            Section("共享密码库") {
                ForEach(Vault.sampleVaults.filter { $0.isShared }) { vault in
                    HStack(spacing: 10) {
                        Image(systemName: vault.vaultType.icon)
                            .foregroundColor(Color(hex: vault.vaultType.color))
                        Text(vault.name)
                            .font(.subheadline)
                        Spacer()
                        Text("\(vault.itemCount)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Section {
                SidebarRow(item: .trash, isSelected: selectedSidebarItem == .trash)
                    .tag(SidebarItem.trash)
            }
        }
        .listStyle(.sidebar)
        .frame(minWidth: 200)
    }

    // MARK: - 内容列表

    private var contentList: some View {
        List(VaultItem.sampleItems, selection: $selectedVaultItem) { item in
            MacItemRow(item: item)
                .tag(item)
        }
        .listStyle(.inset)
        .frame(minWidth: 300)
        .overlay {
            if VaultItem.sampleItems.isEmpty {
                ContentUnavailableView(
                    "暂无项目",
                    systemImage: "key",
                    description: Text("点击「新建」添加第一个项目")
                )
            }
        }
    }

    // MARK: - 空详情视图

    private var emptyDetailView: some View {
        VStack(spacing: 16) {
            Image(systemName: "lock.shield")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            Text("选择一个项目查看详情")
                .font(.title3)
                .foregroundColor(.secondary)
            Text("或使用 ⌘⇧Space 快速搜索")
                .font(.subheadline)
                .foregroundColor(.tertiary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - 侧边栏行视图

struct SidebarRow: View {
    let item: MainView.SidebarItem
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: item.icon)
                .font(.subheadline)
                .foregroundColor(isSelected ? Color(hex: "E94560") : .secondary)
                .frame(width: 20)

            Text(item.rawValue)
                .font(.subheadline)
                .foregroundColor(isSelected ? .primary : .secondary)

            Spacer()

            if item != .allItems {
                Text("\(item.itemCount)")
                    .font(.caption2)
                    .foregroundColor(.tertiary)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.gray.opacity(0.15))
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Mac 项目行视图

struct MacItemRow: View {
    let item: VaultItem

    var body: some View {
        HStack(spacing: 12) {
            // 类型图标
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(hex: item.type.color).opacity(0.15))
                    .frame(width: 36, height: 36)

                Image(systemName: item.typeIcon)
                    .font(.callout.bold())
                    .foregroundColor(Color(hex: item.type.color))
            }

            // 项目信息
            VStack(alignment: .leading, spacing: 2) {
                Text(item.name)
                    .font(.subheadline.bold())

                Text(item.subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            // 收藏标记
            if item.isFavorite {
                Image(systemName: "star.fill")
                    .font(.caption)
                    .foregroundColor(.yellow)
            }

            // 更新时间
            Text(item.updatedAt, style: .date)
                .font(.caption2)
                .foregroundColor(.tertiary)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Mac 项目详情视图

struct MacItemDetailView: View {
    let item: VaultItem
    @State private var copiedField: String? = nil

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // 头部
                headerSection

                Divider()

                // 字段区域
                fieldsSection

                Divider()

                // 附加信息
                additionalInfoSection
            }
            .padding(24)
        }
    }

    // MARK: - 头部

    private var headerSection: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(hex: item.type.color).opacity(0.15))
                    .frame(width: 56, height: 56)

                Image(systemName: item.typeIcon)
                    .font(.title2.bold())
                    .foregroundColor(Color(hex: item.type.color))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.title2.bold())

                Text(item.typeDisplayName)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // 操作按钮
            HStack(spacing: 8) {
                Button(action: copyItem) {
                    Label("复制", systemImage: "doc.on.doc")
                }
                .buttonStyle(.bordered)

                Button(action: {}) {
                    Label("编辑", systemImage: "pencil")
                }
                .buttonStyle(.bordered)

                Button(action: {}) {
                    Label("分享", systemImage: "square.and.arrow.up")
                }
                .buttonStyle(.bordered)
            }
        }
    }

    // MARK: - 字段区域

    private var fieldsSection: some View {
        VStack(spacing: 12) {
            MacDetailField(label: "网站", value: "github.com", icon: "globe")
            MacDetailField(label: "用户名", value: "developer@github.com", icon: "person")
            MacDetailField(label: "密码", value: "P@ssw0rd123!", icon: "lock", isSensitive: true)
        }
    }

    // MARK: - 附加信息

    private var additionalInfoSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("附加信息")
                .font(.headline)

            HStack {
                Text("创建时间")
                    .foregroundColor(.secondary)
                Spacer()
                Text(item.createdAt, style: .date)
            }
            .font(.subheadline)

            HStack {
                Text("修改时间")
                    .foregroundColor(.secondary)
                Spacer()
                Text(item.updatedAt, style: .date)
            }
            .font(.subheadline)

            if !item.tags.isEmpty {
                HStack {
                    Text("标签")
                        .foregroundColor(.secondary)
                    Spacer()
                    ForEach(item.tags, id: \.self) { tag in
                        Text(tag)
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(hex: "E94560").opacity(0.1))
                            .cornerRadius(4)
                    }
                }
                .font(.subheadline)
            }
        }
    }

    // MARK: - 方法

    private func copyItem() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(item.subtitle, forType: .string)
    }
}

// MARK: - Mac 详情字段行

struct MacDetailField: View {
    let label: String
    let value: String
    let icon: String
    var isSensitive: Bool = false

    @State private var isRevealed = false

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(width: 20)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(isSensitive && !isRevealed ? String(repeating: "•", count: 12) : value)
                    .font(.subheadline)
                    .textSelection(.enabled)
            }

            Spacer()

            if isSensitive {
                Button(action: { isRevealed.toggle() }) {
                    Image(systemName: isRevealed ? "eye.slash" : "eye")
                        .font(.caption)
                }
                .buttonStyle(.borderless)
            }

            Button(action: {
                NSPasteboard.general.clearContents()
                NSPasteboard.general.setString(value, forType: .string)
            }) {
                Image(systemName: "doc.on.doc")
                    .font(.caption)
            }
            .buttonStyle(.borderless)
        }
        .padding(.vertical, 6)
        .padding(.horizontal, 12)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
}
