// AppState.swift — observable model, language, navigation, photo storage.

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

  enum Route: Hashable {
    case library
    case timeline
    case letters
    case atlas
    case people
    case search
    case detail(String)
  }

  init() {
    let l = Language(rawValue: UserDefaults.standard.string(forKey: "memories.lang") ?? "en") ?? .en
    self.content = Datasets.content(for: l)
    loadPhotos()
  }

  var language: Language { content.lang }

  func setLanguage(_ l: Language) {
    rawLang = l.rawValue
    content = Datasets.content(for: l)
  }

  func open(_ memoryId: String) {
    route = .detail(memoryId)
  }

  func openChapter(_ id: String) {
    filterChapter = id
    route = .timeline
  }

  func clearFilters() {
    filterChapter = nil
    query = ""
  }

  // ── Photo store ──────────────────────────────────────────
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
    let ext = source.pathExtension.isEmpty ? "jpg" : source.pathExtension
    let dest = photoDir.appendingPathComponent("\(id).\(ext)")
    try? FileManager.default.removeItem(at: dest)
    do {
      try FileManager.default.copyItem(at: source, to: dest)
      photos[id] = dest
      savePhotos()
    } catch {
      NSLog("setPhoto failed: \(error)")
    }
  }

  func clearPhoto(_ id: String) {
    if let url = photos[id] {
      try? FileManager.default.removeItem(at: url)
    }
    photos.removeValue(forKey: id)
    savePhotos()
  }
}
