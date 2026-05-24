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
            Text(placeholder.uppercased())
              .font(Theme.mono(10, weight: .medium))
              .foregroundStyle(.black.opacity(0.55))
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

      if hovering && state.photos[id] != nil {
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
    .onHover { hovering = $0 }
    .onDrop(of: [.fileURL, .image], isTargeted: $dropTargeted) { providers in
      handleDrop(providers)
    }
    .onTapGesture(count: 2) { pickFile() }
  }

  private func handleDrop(_ providers: [NSItemProvider]) -> Bool {
    guard let provider = providers.first else { return false }
    _ = provider.loadObject(ofClass: URL.self) { url, _ in
      guard let url else { return }
      DispatchQueue.main.async { state.setPhoto(id, source: url) }
    }
    return true
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
