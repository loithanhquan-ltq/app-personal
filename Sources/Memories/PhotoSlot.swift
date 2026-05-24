// PhotoSlot.swift — drag-and-drop image placeholder.

import SwiftUI
import AppKit
import UniformTypeIdentifiers

struct PhotoSlot: View {
  let id: String
  let placeholder: String
  var cornerRadius: CGFloat = 10
  var height: CGFloat = 220

  @EnvironmentObject var state: AppState
  @State private var hovering = false
  @State private var dropTargeted = false

  var body: some View {
    ZStack {
      if let url = state.photos[id], let img = NSImage(contentsOf: url) {
        Image(nsImage: img)
          .resizable()
          .scaledToFill()
          .frame(maxWidth: .infinity, maxHeight: .infinity)
          .clipped()
      } else {
        StripedPlaceholder(seed: id)
        VStack {
          Spacer()
          HStack {
            Text((hovering ? "Click to add photo" : placeholder).uppercased())
              .font(Theme.mono(10, weight: .medium))
              .foregroundStyle(hovering ? Theme.accent : .black.opacity(0.55))
              .padding(.horizontal, 7)
              .padding(.vertical, 3)
              .background(.white.opacity(0.78), in: RoundedRectangle(cornerRadius: 4))
              .padding(10)
            Spacer()
          }
        }
      }

      if dropTargeted {
        RoundedRectangle(cornerRadius: cornerRadius)
          .strokeBorder(Theme.accent, style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
        Text("Drop to set photo")
          .font(Theme.sans(12, weight: .semibold))
          .padding(.horizontal, 10).padding(.vertical, 5)
          .background(.white.opacity(0.92), in: Capsule())
          .foregroundStyle(Theme.accent)
      }

      // Upload status badges (top-right)
      if state.uploadingSlots.contains(id) {
        badge(top: true) {
          HStack(spacing: 5) {
            ProgressView().controlSize(.mini).tint(Theme.accent)
            Text("Syncing…").font(Theme.sans(10.5, weight: .medium)).foregroundStyle(Theme.ink2)
          }
        }
      } else if let errMsg = state.uploadErrors[id] {
        badge(top: true) {
          HStack(spacing: 5) {
            Image(systemName: "exclamationmark.triangle.fill")
              .font(.system(size: 10)).foregroundStyle(.orange)
            Text("Upload failed")
              .font(Theme.sans(10.5, weight: .medium)).foregroundStyle(Theme.ink2)
            Button("Retry") { state.retryUpload(id: id) }
              .font(Theme.sans(10.5, weight: .semibold)).foregroundStyle(Theme.accent)
              .buttonStyle(.plain)
          }
        }
        .help(errMsg)
      } else if state.photos[id] != nil && state.githubToken == nil {
        badge(top: true) {
          HStack(spacing: 4) {
            Image(systemName: "cloud.slash").font(.system(size: 10)).foregroundStyle(Theme.ink3)
            Text("Not synced").font(Theme.sans(10.5)).foregroundStyle(Theme.ink3)
          }
        }
      }

      // Remove button (bottom-right on hover)
      if hovering && state.photos[id] != nil && !state.uploadingSlots.contains(id) {
        VStack { Spacer(); HStack { Spacer()
          Button("Remove") { state.clearPhoto(id) }
            .buttonStyle(.borderless)
            .font(Theme.sans(11, weight: .medium))
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(.white.opacity(0.85), in: Capsule())
            .foregroundStyle(.black.opacity(0.7))
            .padding(8)
        } }
      }
    }
    .frame(height: height)
    .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
    .overlay(
      RoundedRectangle(cornerRadius: cornerRadius)
        .strokeBorder(.black.opacity(0.06), lineWidth: 0.5)
    )
    .contentShape(Rectangle())
    .onHover { hovering = $0 }
    .onDrop(of: [.fileURL, .image], isTargeted: $dropTargeted) { providers in
      handleDrop(providers)
    }
    .onTapGesture {
      if state.photos[id] == nil { pickFile() }
    }
  }

  @ViewBuilder
  private func badge<C: View>(top: Bool, @ViewBuilder _ content: () -> C) -> some View {
    VStack {
      if !top { Spacer() }
      HStack {
        Spacer()
        content()
          .padding(.horizontal, 8).padding(.vertical, 4)
          .background(.white.opacity(0.90), in: Capsule())
          .padding(8)
      }
      if top { Spacer() }
    }
  }

  private func handleDrop(_ providers: [NSItemProvider]) -> Bool {
    guard let provider = providers.first else { return false }
    if provider.canLoadObject(ofClass: URL.self) {
      _ = provider.loadObject(ofClass: URL.self) { url, _ in
        if let url, url.isFileURL {
          DispatchQueue.main.async { state.setPhoto(id, source: url) }
        } else {
          // Provider advertised a URL but gave a non-file one — fall back to image data
          dropImageData(from: provider)
        }
      }
    } else {
      // No URL at all (e.g. drag from browser or clipboard) — load raw image data
      dropImageData(from: provider)
    }
    return true
  }

  private func dropImageData(from provider: NSItemProvider) {
    guard provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) else { return }
    provider.loadDataRepresentation(forTypeIdentifier: UTType.image.identifier) { data, _ in
      guard let data, let img = NSImage(data: data),
            let tiff = img.tiffRepresentation else { return }
      let tmp = URL(fileURLWithPath: NSTemporaryDirectory())
        .appendingPathComponent(UUID().uuidString + ".tiff")
      try? tiff.write(to: tmp)
      DispatchQueue.main.async { state.setPhoto(id, source: tmp) }
    }
  }

  private func pickFile() {
    let panel = NSOpenPanel()
    panel.allowedContentTypes = [.image]
    panel.allowsMultipleSelection = false
    if panel.runModal() == .OK, let url = panel.url {
      state.setPhoto(id, source: url)
    }
  }
}

struct StripedPlaceholder: View {
  let seed: String

  var body: some View {
    let h = seed.unicodeScalars.reduce(UInt32(2166136261)) { ($0 ^ $1.value) &* 16777619 }
    let hue = Double(h % 360) / 360.0
    let stripeAngle = Double(((h >> 8) % 30) + 20)

    GeometryReader { geo in
      ZStack {
        Canvas { ctx, size in
          let stripe: CGFloat = 18
          let count = Int(ceil((size.width + size.height) / stripe)) + 4
          let radians = stripeAngle * .pi / 180.0
          for i in 0..<count {
            let band = i % 3
            let color: Color = band == 0
              ? Color(hue: hue, saturation: 0.18, brightness: 0.86)
              : band == 1
                ? Color(hue: hue, saturation: 0.22, brightness: 0.78)
                : Color(hue: hue, saturation: 0.12, brightness: 0.92)
            var path = Path()
            let x = CGFloat(i) * stripe - size.height
            path.addRect(CGRect(x: x, y: -size.height, width: stripe, height: size.height * 3))
            ctx.translateBy(x: size.width / 2, y: size.height / 2)
            ctx.rotate(by: .radians(radians))
            ctx.translateBy(x: -size.width / 2, y: -size.height / 2)
            ctx.fill(path, with: .color(color))
            ctx.translateBy(x: size.width / 2, y: size.height / 2)
            ctx.rotate(by: .radians(-radians))
            ctx.translateBy(x: -size.width / 2, y: -size.height / 2)
          }
        }
        RoundedRectangle(cornerRadius: 0)
          .fill(
            RadialGradient(colors: [.clear, .black.opacity(0.08)],
                           center: .center,
                           startRadius: geo.size.width * 0.3,
                           endRadius: geo.size.width * 0.7)
          )
          .blendMode(.multiply)
      }
    }
  }
}
