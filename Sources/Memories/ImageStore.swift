import SwiftUI

class ImageStore: ObservableObject {
    static let shared = ImageStore()

    private let directory: URL
    private var cache: [String: NSImage] = [:]

    init() {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        directory = support.appendingPathComponent("Memories/Photos", isDirectory: true)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    }

    func load(id: String) -> NSImage? {
        if let cached = cache[id] { return cached }
        let url = directory.appendingPathComponent("\(id).jpg")
        guard let data = try? Data(contentsOf: url),
              let img = NSImage(data: data) else { return nil }
        cache[id] = img
        return img
    }

    func save(id: String, image: NSImage) {
        guard let data = image.jpegData() else { return }
        let url = directory.appendingPathComponent("\(id).jpg")
        try? data.write(to: url)
        cache[id] = image
        DispatchQueue.main.async { self.objectWillChange.send() }
    }

    func remove(id: String) {
        let url = directory.appendingPathComponent("\(id).jpg")
        try? FileManager.default.removeItem(at: url)
        cache.removeValue(forKey: id)
        DispatchQueue.main.async { self.objectWillChange.send() }
    }
}

extension NSImage {
    func jpegData(quality: CGFloat = 0.85) -> Data? {
        guard let tiff = tiffRepresentation,
              let rep = NSBitmapImageRep(data: tiff) else { return nil }
        return rep.representation(using: .jpeg, properties: [.compressionFactor: quality])
    }
}
