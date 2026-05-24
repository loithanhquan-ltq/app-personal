import Foundation
import AppKit

@MainActor
class UpdateChecker: ObservableObject {
    static let shared = UpdateChecker()

    @Published var availableVersion: String? = nil
    @Published var isUpdating: Bool = false
    @Published var updateProgress: Double = 0.0
    @Published var updateError: String? = nil

    private var pendingZipURL: URL? = nil
    private let apiURL = "https://api.github.com/repos/loithanhquan-ltq/app-personal/releases/latest"

    func checkSilently() {
        Task { await fetchLatest() }
    }

    func checkAndAlert() {
        Task { await fetchLatest() }
    }

    func downloadAndInstall() {
        guard let zipURL = pendingZipURL else { return }
        Task { await performUpdate(zipURL: zipURL) }
    }

    private func fetchLatest() async {
        guard let url = URL(string: apiURL) else { return }
        var request = URLRequest(url: url)
        request.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")

        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let release = try? JSONDecoder().decode(GitHubRelease.self, from: data) else { return }

        let latest = release.tagName.trimmingCharacters(in: CharacterSet(charactersIn: "v"))
        guard latest.compare(APP_VERSION, options: .numeric) == .orderedDescending else { return }

        pendingZipURL = release.assets.first(where: { $0.name.hasSuffix(".zip") })
            .flatMap { URL(string: $0.browserDownloadUrl) }
        availableVersion = latest
    }

    private func performUpdate(zipURL: URL) async {
        isUpdating = true
        updateProgress = 0.0
        updateError = nil

        do {
            // Download
            let zipPath = try await downloadZip(from: zipURL)
            updateProgress = 0.7

            // Unzip
            let tmpDir = FileManager.default.temporaryDirectory
                .appendingPathComponent("memories-update-\(UUID().uuidString)")
            try FileManager.default.createDirectory(at: tmpDir, withIntermediateDirectories: true)
            try runProcess("/usr/bin/unzip", args: ["-o", zipPath.path, "-d", tmpDir.path])
            updateProgress = 0.9

            // Find Memories.app in unzip output
            guard let newApp = findApp(in: tmpDir) else {
                throw UpdateError.appNotFound
            }

            // Write and run replacement script
            let currentBundle = Bundle.main.bundleURL.path
            let scriptPath = "/tmp/memories-update.sh"
            let script = """
            #!/bin/bash
            sleep 2
            rm -rf "\(currentBundle)"
            cp -R "\(newApp.path)" "\(currentBundle)"
            xattr -cr "\(currentBundle)"
            open "\(currentBundle)"
            rm -- "$0"
            """
            try script.write(toFile: scriptPath, atomically: true, encoding: .utf8)
            try runProcess("/bin/chmod", args: ["+x", scriptPath])
            launchDetached(scriptPath)

            updateProgress = 1.0
            NSApplication.shared.terminate(nil)

        } catch {
            isUpdating = false
            updateError = error.localizedDescription
        }
    }

    private func downloadZip(from url: URL) async throws -> URL {
        let (asyncBytes, response) = try await URLSession.shared.bytes(from: url)
        let total = (response as? HTTPURLResponse)?.expectedContentLength ?? -1

        let dest = FileManager.default.temporaryDirectory
            .appendingPathComponent("Memories-update.zip")
        var data = Data()
        data.reserveCapacity(total > 0 ? Int(total) : 10_000_000)

        for try await byte in asyncBytes {
            data.append(byte)
            if total > 0 {
                let progress = Double(data.count) / Double(total) * 0.65
                updateProgress = progress
            }
        }
        try data.write(to: dest)
        return dest
    }

    private func findApp(in dir: URL) -> URL? {
        guard let enumerator = FileManager.default.enumerator(
            at: dir,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        ) else { return nil }

        for case let url as URL in enumerator {
            if url.pathExtension == "app" {
                return url
            }
        }
        return nil
    }

    private func runProcess(_ executable: String, args: [String]) throws {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: executable)
        p.arguments = args
        try p.run()
        p.waitUntilExit()
        guard p.terminationStatus == 0 else {
            throw UpdateError.processFailed(executable, p.terminationStatus)
        }
    }

    private func launchDetached(_ scriptPath: String) {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/bin/bash")
        p.arguments = [scriptPath]
        try? p.run()
    }
}

private enum UpdateError: LocalizedError {
    case appNotFound
    case processFailed(String, Int32)

    var errorDescription: String? {
        switch self {
        case .appNotFound: return "Memories.app not found in downloaded archive"
        case .processFailed(let cmd, let code): return "\(cmd) exited with code \(code)"
        }
    }
}

private struct GitHubRelease: Decodable {
    let tagName: String
    let assets: [Asset]

    struct Asset: Decodable {
        let name: String
        let browserDownloadUrl: String
        enum CodingKeys: String, CodingKey {
            case name
            case browserDownloadUrl = "browser_download_url"
        }
    }

    enum CodingKeys: String, CodingKey {
        case tagName = "tag_name"
        case assets
    }
}
