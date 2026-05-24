import Foundation
import AppKit

@MainActor
class UpdateChecker: ObservableObject {
    static let shared = UpdateChecker()

    @Published var availableVersion: String? = nil

    private let apiURL = "https://api.github.com/repos/loithanhquan-ltq/app-personal/releases/latest"
    private let releasesURL = "https://github.com/loithanhquan-ltq/app-personal/releases/latest"

    // Called on launch — silently sets availableVersion if a newer release exists.
    func checkSilently() {
        Task { await fetchLatest(showAlertIfUpToDate: false) }
    }

    // Called from the Help menu — shows an alert either way.
    func checkAndAlert() {
        Task { await fetchLatest(showAlertIfUpToDate: true) }
    }

    func openReleasesPage() {
        if let url = URL(string: releasesURL) {
            NSWorkspace.shared.open(url)
        }
    }

    private func fetchLatest(showAlertIfUpToDate: Bool) async {
        guard let url = URL(string: apiURL) else { return }

        var request = URLRequest(url: url)
        request.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")

        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONDecoder().decode(GitHubRelease.self, from: data) else { return }

        let latest = json.tagName.trimmingCharacters(in: CharacterSet(charactersIn: "v"))
        let isNewer = latest.compare(APP_VERSION, options: .numeric) == .orderedDescending

        if isNewer {
            availableVersion = latest
            showUpdateAlert(latestVersion: latest)
        } else if showAlertIfUpToDate {
            availableVersion = nil
            showUpToDateAlert()
        }
    }

    private func showUpdateAlert(latestVersion: String) {
        let alert = NSAlert()
        alert.messageText = "Update Available — v\(latestVersion)"
        alert.informativeText = "You have v\(APP_VERSION). Download the new version from GitHub Releases."
        alert.addButton(withTitle: "Download Update")
        alert.addButton(withTitle: "Later")
        alert.alertStyle = .informational
        if alert.runModal() == .alertFirstButtonReturn {
            openReleasesPage()
        }
    }

    private func showUpToDateAlert() {
        let alert = NSAlert()
        alert.messageText = "Memories is up to date"
        alert.informativeText = "You have the latest version (v\(APP_VERSION))."
        alert.addButton(withTitle: "OK")
        alert.alertStyle = .informational
        alert.runModal()
    }
}

private struct GitHubRelease: Decodable {
    let tagName: String
    enum CodingKeys: String, CodingKey { case tagName = "tag_name" }
}
