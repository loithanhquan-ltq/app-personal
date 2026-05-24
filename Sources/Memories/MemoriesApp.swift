import SwiftUI
import AppKit

@main
struct MemoriesApp: App {
    init() {
        NSApplication.shared.setActivationPolicy(.regular)
        NSApplication.shared.activate(ignoringOtherApps: true)
        // Silent update check 5 s after launch so it never blocks startup
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            Task { await UpdateChecker.shared.checkSilently() }
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .defaultSize(width: 1280, height: 820)
        .windowResizability(.contentMinSize)
        .commands {
            CommandGroup(replacing: .newItem) {}
            CommandGroup(after: .appInfo) {
                Button("Check for Updates…") {
                    UpdateChecker.shared.checkAndAlert()
                }
            }
        }
    }
}
