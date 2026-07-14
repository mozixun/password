import SwiftUI

/// 项目列表视图：搜索、分类筛选、列表展示、滑动操作
struct ItemsListView: View {
    @State private var searchText = ""
    @State private var selectedCategory: ItemCategory? = nil
    @State private var items: [VaultItem] = []
    @State private var isRefreshing = false
    @State private var showAddItem = false

    /// 项目分类
    enum ItemCategory: String, CaseIterable {
        case login = "登录信息"
        case card = "支付卡"
        case identity = "身份信息"
        case note = "安全笔记"
        case all = "全部"

        var icon: String {
            switch self {
            case .login: return "globe"
            case .card: return "creditcard"
            case .identity: return "person"
            case .note: return "note.text"
            case .all: return "square.grid.2x2"
            }
        }
    }

    /// 筛选后的项目列表
    var filteredItems: [VaultItem] {
        var result = items

        // 分类筛选
        if let category = selectedCategory, category != .all {
            result = result.filter { $0.type.rawValue == category.rawValue }
        }

        // 搜索筛选
        if !searchText.isEmpty {
            result = result.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.subtitle.localizedCaseInsensitiveContains(searchText)
            }
        }

        return result
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 搜索栏
                searchBar

                // 分类筛选条
                categoryFilterChips

                // 项目列表
                if filteredItems.isEmpty {
                    emptyStateView
                } else {
                    itemsList
                }
            }
            .navigationTitle("项目")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddItem = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showAddItem) {
                // TODO: 添加项目视图
                Text("添加新项目")
            }
        }
        .onAppear {
            loadItems()
        }
    }

    // MARK: - 搜索栏

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)

            TextField("搜索项目...", text: $searchText)
                .foregroundColor(.white)

            if !searchText.isEmpty {
                Button(action: { searchText = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .background(Color.white.opacity(0.08))
        .cornerRadius(10)
        .padding(.horizontal)
        .padding(.top, 8)
    }

    // MARK: - 分类筛选

    private var categoryFilterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(ItemCategory.allCases, id: \.self) { category in
                    CategoryChip(
                        title: category.rawValue,
                        icon: category.icon,
                        isSelected: selectedCategory == category ||
                            (category == .all && selectedCategory == nil),
                        action: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                if category == .all {
                                    selectedCategory = nil
                                } else {
                                    selectedCategory = category
                                }
                            }
                        }
                    )
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }

    // MARK: - 空状态

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "key")
                .font(.system(size: 48))
                .foregroundColor(.gray)
            Text(searchText.isEmpty ? "暂无项目" : "未找到匹配项目")
                .font(.headline)
                .foregroundColor(.gray)
            Text(searchText.isEmpty ? "点击右上角 + 添加第一个项目" : "尝试使用不同的关键词搜索")
                .font(.subheadline)
                .foregroundColor(.gray.opacity(0.7))
            Spacer()
        }
    }

    // MARK: - 项目列表

    private var itemsList: some View {
        List {
            ForEach(filteredItems) { item in
                NavigationLink(destination: ItemDetailView(item: item)) {
                    ItemRow(item: item)
                }
                .listRowBackground(Color.clear)
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                    Button(role: .destructive) {
                        deleteItem(item)
                    } label: {
                        Label("删除", systemImage: "trash")
                    }

                    Button {
                        // TODO: 编辑项目
                    } label: {
                        Label("编辑", systemImage: "pencil")
                    }
                    .tint(.blue)
                }
                .swipeActions(edge: .leading) {
                    Button {
                        copyItemField(item)
                    } label: {
                        Label("复制", systemImage: "doc.on.doc")
                    }
                    .tint(.green)
                }
            }
        }
        .listStyle(.plain)
        .refreshable {
            await refreshItems()
        }
    }

    // MARK: - 方法

    private func loadItems() {
        items = VaultItem.sampleItems
    }

    private func refreshItems() async {
        try? await Task.sleep(nanoseconds: 800_000_000)
        loadItems()
    }

    private func deleteItem(_ item: VaultItem) {
        withAnimation {
            items.removeAll { $0.id == item.id }
        }
    }

    private func copyItemField(_ item: VaultItem) {
        UIPasteboard.general.string = item.subtitle
        // 触觉反馈
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
}

// MARK: - 子视图

/// 分类筛选标签
struct CategoryChip: View {
    let title: String
    let icon: String
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
            .background(
                isSelected
                    ? Color(hex: "E94560").opacity(0.2)
                    : Color.white.opacity(0.05)
            )
            .foregroundColor(isSelected ? Color(hex: "E94560") : .gray)
            .cornerRadius(20)
            .overlay(
                Capsule()
                    .stroke(
                        isSelected ? Color(hex: "E94560").opacity(0.5) : Color.clear,
                        lineWidth: 1
                    )
            )
        }
    }
}

/// 项目行视图
struct ItemRow: View {
    let item: VaultItem

    var body: some View {
        HStack(spacing: 14) {
            // 类型图标
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(item.typeColor.opacity(0.15))
                    .frame(width: 44, height: 44)

                Image(systemName: item.typeIcon)
                    .font(.body.bold())
                    .foregroundColor(item.typeColor)
            }

            // 项目信息
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.subheadline.bold())
                    .foregroundColor(.white)

                Text(item.subtitle)
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineLimit(1)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.gray.opacity(0.5))
        }
        .padding(.vertical, 4)
    }
}
