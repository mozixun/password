import SwiftUI

@main
struct VaultKeyApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var biometricAuth = BiometricAuthManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(biometricAuth)
        }
    }
}
