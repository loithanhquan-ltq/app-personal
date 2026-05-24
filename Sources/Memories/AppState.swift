// AppState.swift — observable model, language, navigation, photo storage + GitHub sync.

import SwiftUI
import AppKit

@MainActor
final class AppState: ObservableObject {
  @AppStorage("memories.lang") private var rawLang: String = "en"

  @Published var content: Content
  @Published var route: Route = .library
  @Published var query: String = ""
  @Published var filterChapter: String? = nil
  @Published var photos: [String: URL] = [:]
  @Published var userFavorites: Set<String> = []
  @Published var toast: String? = nil
  private var toastTask: Task<Void, Never>? = nil

  // GitHub photo sync
  @Published var githubToken: String? = UserDefaults.standard.string(forKey: "github.token")
  @Published var showGitHubSetup = false
  @Published var uploadingSlots: Set<String> = []
  @Published var uploadErrors: [String: String] = [:]
  private var pendingUploadSlots: Set<String> = []

  enum Route: Hashable {
    case library, timeline, letters, atlas, people, search, detail(String)
  }

  init() {
    let l = Language(rawValue: UserDefaults.standard.string(forKey: "memories.lang") ?? "en") ?? .en
    self.content = Datasets.content(for: l)
    let saved = UserDefaults.standard.array(forKey: "memories.favorites") as? [String]
    userFavorites = Set(saved ?? content.memories.filter(\.favorite).map(\.id))
    loadPhotos()
    Task { await self.syncRemotePhotos() }
  }

  var language: Language { content.lang }

  func setLanguage(_ l: Language) {
    rawLang = l.rawValue
    content = Datasets.content(for: l)
  }

  func open(_ memoryId: String) {
    withAnimation(.easeInOut(duration: 0.18)) { route = .detail(memoryId) }
  }

  func openChapter(_ id: String) {
    withAnimation(.easeInOut(duration: 0.18)) { filterChapter = id; route = .timeline }
  }

  func clearFilters() { filterChapter = nil; query = "" }

  func isFavorite(_ id: String) -> Bool { userFavorites.contains(id) }

  func toggleFavorite(_ id: String) {
    if userFavorites.contains(id) {
      userFavorites.remove(id)
      showToast("Removed from favorites")
    } else {
      userFavorites.insert(id)
      showToast("Added to favorites ★")
    }
    UserDefaults.standard.set(Array(userFavorites), forKey: "memories.favorites")
  }

  func showToast(_ message: String) {
    toastTask?.cancel()
    withAnimation(.easeInOut(duration: 0.2)) { toast = message }
    toastTask = Task { @MainActor [weak self] in
      try? await Task.sleep(for: .seconds(2.5))
      guard let self, !Task.isCancelled else { return }
      withAnimation(.easeInOut(duration: 0.2)) { self.toast = nil }
    }
  }

  // MARK: - GitHub token

  func setGithubToken(_ token: String) {
    githubToken = token
    UserDefaults.standard.set(token, forKey: "github.token")
    Task {
      await syncRemotePhotos()
      await uploadPending(token: token)
    }
  }

  func disconnectGithub() {
    githubToken = nil
    UserDefaults.standard.removeObject(forKey: "github.token")
  }

  // MARK: - Remote photo sync

  func syncRemotePhotos() async {
    let service = GitHubPhotosService()
    let slotIds = content.memories.map { "hero-\($0.id)" }
                + content.places.map  { "place-\($0.id)" }

    await withTaskGroup(of: Void.self) { group in
      for slotId in slotIds where photos[slotId] == nil {
        group.addTask { [weak self] in
          guard let self else { return }
          let url = service.rawURL(for: slotId)
          guard let (data, resp) = try? await URLSession.shared.data(from: url),
                (resp as? HTTPURLResponse)?.statusCode == 200 else { return }
          let dest = await self.photoDir.appendingPathComponent("\(slotId).jpg")
          try? data.write(to: dest)
          await MainActor.run {
            self.photos[slotId] = dest
          }
        }
      }
    }
    savePhotos()
  }

  // MARK: - Photo store

  private var photoDir: URL {
    let fm = FileManager.default
    let support = try! fm.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    let dir = support.appendingPathComponent("Memories/Photos", isDirectory: true)
    try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir
  }

  private var photoIndex: URL { photoDir.appendingPathComponent("index.json") }

  private func loadPhotos() {
    guard let data = try? Data(contentsOf: photoIndex),
          let dict = try? JSONDecoder().decode([String: String].self, from: data) else { return }
    photos = dict.compactMapValues { name in
      let url = photoDir.appendingPathComponent(name)
      return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }
  }

  private func savePhotos() {
    let dict = photos.compactMapValues { $0.lastPathComponent }
    if let data = try? JSONEncoder().encode(dict) {
      try? data.write(to: photoIndex)
    }
  }

  func setPhoto(_ id: String, source: URL) {
    guard let nsImage = NSImage(contentsOf: source),
          let tiff    = nsImage.tiffRepresentation,
          let bitmap  = NSBitmapImageRep(data: tiff),
          let jpeg    = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.85])
    else { return }

    let dest = photoDir.appendingPathComponent("\(id).jpg")
    try? FileManager.default.removeItem(at: dest)
    do {
      try jpeg.write(to: dest)
      photos[id] = dest
      savePhotos()

      if let token = githubToken {
        Task { await uploadSlot(id: id, jpegData: jpeg, token: token) }
      } else {
        pendingUploadSlots.insert(id)
      }
    } catch {
      NSLog("setPhoto failed: \(error)")
    }
  }

  func retryUpload(id: String) {
    guard let token = githubToken,
          let localURL = photos[id],
          let data = try? Data(contentsOf: localURL) else { return }
    uploadErrors.removeValue(forKey: id)
    Task { await uploadSlot(id: id, jpegData: data, token: token) }
  }

  func clearPhoto(_ id: String) {
    if let url = photos[id] { try? FileManager.default.removeItem(at: url) }
    photos.removeValue(forKey: id)
    pendingUploadSlots.remove(id)
    uploadErrors.removeValue(forKey: id)
    savePhotos()
  }

  private func uploadSlot(id: String, jpegData: Data, token: String) async {
    uploadingSlots.insert(id)
    uploadErrors.removeValue(forKey: id)
    do {
      try await GitHubPhotosService().upload(jpegData: jpegData, slotId: id, token: token)
      pendingUploadSlots.remove(id)
    } catch {
      uploadErrors[id] = error.localizedDescription
    }
    uploadingSlots.remove(id)
  }

  private func uploadPending(token: String) async {
    let slots = pendingUploadSlots
    for id in slots {
      guard let localURL = photos[id],
            let data = try? Data(contentsOf: localURL) else { continue }
      await uploadSlot(id: id, jpegData: data, token: token)
    }
  }
}
