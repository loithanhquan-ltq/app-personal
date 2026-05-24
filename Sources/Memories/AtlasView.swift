// AtlasView.swift — abstract dotted-grid map + postcard grid by place.

import SwiftUI

struct AtlasView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    let byPlace: [String: [Memory]] = Dictionary(grouping: state.content.memories) { $0.placeId }
    let order = state.content.places.filter { byPlace[$0.id] != nil }

    ScrollView {
      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: 4) {
          Text(s.atlasEyebrow(order.count, state.content.memories.count).uppercased())
            .font(Theme.mono(11, weight: .medium))
            .tracking(1.4)
            .foregroundStyle(Theme.ink3)
            .padding(.bottom, 8)
          Text(s.atlasHeadline)
            .font(Theme.serif(44, italic: true, weight: .regular))
            .foregroundStyle(Theme.ink)
            .tracking(-1)
          Text(s.atlasSubtitle)
            .font(Theme.serif(15, italic: true))
            .foregroundStyle(Theme.ink3)
        }
        .padding(.top, 6)
        .padding(.bottom, 24)

        AbstractMap(places: order, byPlace: byPlace)
          .padding(.bottom, 36)

        LazyVGrid(columns: [GridItem(.flexible(), spacing: 16),
                            GridItem(.flexible(), spacing: 16),
                            GridItem(.flexible(), spacing: 16)],
                  spacing: 16) {
          ForEach(order) { p in
            PlaceCard(place: p, memories: byPlace[p.id] ?? [])
          }
        }
        Spacer(minLength: 80)
      }
      .padding(.horizontal, 36)
      .padding(.top, 14)
      .frame(maxWidth: 1100)
      .frame(maxWidth: .infinity, alignment: .center)
    }
  }
}

struct AbstractMap: View {
  let places: [Place]
  let byPlace: [String: [Memory]]
  @EnvironmentObject var state: AppState

  private let W: CGFloat = 1000
  private let H: CGFloat = 420

  var body: some View {
    GeometryReader { geo in
      let scale = min(geo.size.width / W, 1)
      Canvas { ctx, size in
        let dotGap: CGFloat = 20
        let dotColor = GraphicsContext.Shading.color(.black.opacity(0.16))
        for x in stride(from: CGFloat(0), through: size.width, by: dotGap) {
          for y in stride(from: CGFloat(0), through: size.height, by: dotGap) {
            ctx.fill(Path(ellipseIn: CGRect(x: x, y: y, width: 1.4, height: 1.4)), with: dotColor)
          }
        }
        let blobs: [(CGFloat, CGFloat, CGFloat, CGFloat)] = [
          (120, 110, 230, 90), (330, 220, 110, 140),
          (470, 100, 130, 100), (520, 200, 240, 160),
          (620, 120, 280, 130), (820, 280, 90, 70),
        ]
        for b in blobs {
          let rect = CGRect(x: b.0 * scale, y: b.1 * scale, width: b.2 * scale, height: b.3 * scale)
          ctx.fill(Path(ellipseIn: rect), with: .color(Theme.accent.opacity(0.06)))
          ctx.stroke(Path(ellipseIn: rect), with: .color(Theme.accent.opacity(0.18)),
                     style: StrokeStyle(lineWidth: 0.6, dash: [2, 3]))
        }
        let ordered = state.content.memories.sorted { $0.sortKey < $1.sortKey }
          .compactMap { state.content.place($0.placeId) }
        for i in 1..<ordered.count {
          let p1 = project(ordered[i - 1], W: W, H: H, scale: scale)
          let p2 = project(ordered[i],     W: W, H: H, scale: scale)
          if hypot(p2.x - p1.x, p2.y - p1.y) < 2 { continue }
          let mid = CGPoint(x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 30)
          var path = Path()
          path.move(to: p1)
          path.addQuadCurve(to: p2, control: mid)
          ctx.stroke(path, with: .color(Theme.accent.opacity(0.35)),
                     style: StrokeStyle(lineWidth: 0.8, dash: [2, 3]))
        }
        for p in places {
          let pt = project(p, W: W, H: H, scale: scale)
          let count = byPlace[p.id]?.count ?? 0
          let r: CGFloat = 5 + min(CGFloat(count), 6) * 1.2
          ctx.fill(Path(ellipseIn: CGRect(x: pt.x - r - 5, y: pt.y - r - 5,
                                         width: (r + 5) * 2, height: (r + 5) * 2)),
                   with: .color(Theme.accent.opacity(0.10)))
          ctx.fill(Path(ellipseIn: CGRect(x: pt.x - r, y: pt.y - r, width: r * 2, height: r * 2)),
                   with: .color(Theme.accent))
          ctx.stroke(Path(ellipseIn: CGRect(x: pt.x - r, y: pt.y - r, width: r * 2, height: r * 2)),
                     with: .color(.white), lineWidth: 1.5)
          ctx.draw(Text(p.label).font(Theme.mono(11)).foregroundColor(Theme.ink2),
                   at: CGPoint(x: pt.x + r + 6, y: pt.y - 1), anchor: .leading)
        }
      }
      .frame(width: geo.size.width, height: H * scale)
    }
    .frame(height: 420)
    .padding(18)
    .background(Theme.card, in: RoundedRectangle(cornerRadius: 14))
    .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Theme.rule, lineWidth: 0.5))
  }

  private func project(_ p: Place, W: CGFloat, H: CGFloat, scale: CGFloat) -> CGPoint {
    let x = ((p.lng + 180) / 360) * Double(W) * Double(scale)
    let y = ((90 - p.lat) / 180) * Double(H) * Double(scale)
    return CGPoint(x: x, y: y)
  }
}

struct PlaceCard: View {
  let place: Place
  let memories: [Memory]
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    Button { if let first = memories.first { state.open(first.id) } } label: {
      VStack(alignment: .leading, spacing: 0) {
        PhotoSlot(id: "place-\(place.id)", placeholder: "photo · \(place.label)",
                  cornerRadius: 8, height: 150)
        HStack(alignment: .firstTextBaseline) {
          VStack(alignment: .leading, spacing: 2) {
            Text(place.label)
              .font(Theme.serif(22, weight: .medium))
              .foregroundStyle(Theme.ink)
              .tracking(-0.2)
            Text(place.country)
              .font(Theme.sans(11))
              .foregroundStyle(Theme.ink3)
          }
          Spacer()
          Text(s.memoriesCount(memories.count))
            .font(Theme.mono(11))
            .foregroundStyle(Theme.ink3)
            .padding(.horizontal, 7).padding(.vertical, 3)
            .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(Theme.rule, lineWidth: 0.5))
        }
        .padding(.top, 12)
        Text(memories.prefix(3).map { $0.title }.joined(separator: " · "))
          .font(Theme.serif(12.5, italic: true))
          .foregroundStyle(Theme.ink2)
          .lineLimit(2)
          .padding(.top, 10)
      }
      .padding(14)
      .background(Theme.card, in: RoundedRectangle(cornerRadius: 12))
      .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Theme.rule, lineWidth: 0.5))
    }
    .buttonStyle(.plain)
  }
}
