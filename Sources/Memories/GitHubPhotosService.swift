import Foundation

struct GitHubPhotosService {
  static let repo   = "loithanhquan-ltq/app-personal"
  static let branch = "main"
  static let folder = "assets/photos"

  func rawURL(for slotId: String) -> URL {
    URL(string: "https://raw.githubusercontent.com/\(Self.repo)/\(Self.branch)/\(Self.folder)/\(slotId).jpg")!
  }

  func upload(jpegData: Data, slotId: String, token: String) async throws {
    let path = "\(Self.folder)/\(slotId).jpg"
    let sha  = try await getSHA(path: path, token: token)

    struct Body: Encodable {
      let message: String; let content: String; let sha: String?
    }
    let body = Body(
      message: "photo: \(slotId)",
      content: jpegData.base64EncodedString(),
      sha: sha
    )

    var req = apiRequest(path: "/repos/\(Self.repo)/contents/\(path)", token: token, method: "PUT")
    req.httpBody = try JSONEncoder().encode(body)

    let (data, resp) = try await URLSession.shared.data(for: req)
    let status = (resp as? HTTPURLResponse)?.statusCode ?? 0
    guard status == 200 || status == 201 else {
      throw GitHubPhotosError.uploadFailed(status, String(data: data, encoding: .utf8) ?? "")
    }
  }

  func validate(token: String) async throws {
    let req = apiRequest(path: "/repos/\(Self.repo)", token: token, method: "GET")
    let (data, resp) = try await URLSession.shared.data(for: req)
    let status = (resp as? HTTPURLResponse)?.statusCode ?? 0
    guard status == 200 else {
      throw GitHubPhotosError.invalidToken(String(data: data, encoding: .utf8) ?? "")
    }
  }

  private func getSHA(path: String, token: String) async throws -> String? {
    let req = apiRequest(path: "/repos/\(Self.repo)/contents/\(path)", token: token, method: "GET")
    let (data, resp) = try await URLSession.shared.data(for: req)
    guard (resp as? HTTPURLResponse)?.statusCode == 200 else { return nil }
    struct Info: Decodable { let sha: String }
    return try? JSONDecoder().decode(Info.self, from: data).sha
  }

  private func apiRequest(path: String, token: String, method: String) -> URLRequest {
    var req = URLRequest(url: URL(string: "https://api.github.com\(path)")!)
    req.httpMethod = method
    req.setValue("Bearer \(token)",             forHTTPHeaderField: "Authorization")
    req.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
    req.setValue("application/json",            forHTTPHeaderField: "Content-Type")
    req.setValue("Memories-macOS/1.0",          forHTTPHeaderField: "User-Agent")
    return req
  }
}

enum GitHubPhotosError: LocalizedError {
  case invalidToken(String)
  case uploadFailed(Int, String)

  var errorDescription: String? {
    switch self {
    case .invalidToken:            return "Invalid token — check it has Contents write access for this repo."
    case .uploadFailed(let c, _): return "Upload failed (HTTP \(c)). Check your token permissions."
    }
  }
}
