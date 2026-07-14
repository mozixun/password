import SwiftUI

/// 主标签视图：包含5个主要功能标签
struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @EnvironmentObject var appState: AppState

    /// 标签枚举
    enum Tab: CaseIterable {
        case home
        case items
        case generator
        case security
        case settings

        /// 标签名称
        var title: String {
            switch self {
            case .home: return "首页"
            case .items: return "项目"
            case .generator: return "生成器"
            case .security: return "安全"
            case .settings: return "设置"
            }
        }

        /// SF Symbol 图标
        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .items: return "key.fill"
            case .generator: return "wand.and.stars"
            case .security: return "shield.checkered"
            case .settings: return "gearshape.fill"
            }
        }

        /// 未选中状态的图标
        var iconUnfilled: String {
            switch self {
            case .home: return "house"
            case .items: return "key"
            case .generator: return "wand.and.stars"
            case .security: return "shield"
            case .settings: return "gearshape"
            }
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label(
                        Tab.home.title,
                        systemImage: selectedTab == .home ? Tab.home.icon : Tab.home.iconUnfilled
                    )
                }
                .tag(Tab.home)

            ItemsListView()
                .tabItem {
                    Label(
                        Tab.items.title,
                        systemImage: selectedTab == .items ? Tab.items.icon : Tab.items.iconUnfilled
                    )
                }
                .tag(Tab.items)

            GeneratorView()
                .tabItem {
                    Label(
                        Tab.generator.title,
                        systemImage: selectedTab == .generator ? Tab.generator.icon : Tab.generator.iconUnfilled
                    )
                }
                .tag(Tab.generator)

            SecurityView()
                .tabItem {
                    Label(
                        Tab.security.title,
                        systemImage: selectedTab == .security ? Tab.security.icon : Tab.security.iconUnfilled
                    )
                }
                .tag(Tab.security)

            SettingsView()
                .tabItem {
                    Label(
                        Tab.settings.title,
                        systemImage: selectedTab == .settings ? Tab.settings.icon : Tab.settings.iconUnfilled
                    )
                }
                .tag(Tab.settings)
        }
        .tint(Color(hex: "E94560"))
        .onChange(of: selectedTab) { newTab in
            // 触觉反馈
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }
    }
}
