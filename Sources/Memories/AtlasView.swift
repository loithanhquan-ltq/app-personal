import SwiftUI

struct AtlasView: View {
    @Environment(AppState.self) private var state

    private var placesWithMemories: [Place] {
        AppData.places.filter { p in AppData.memories.contains { $0.place == p.id } }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 4) {
                Text("\(placesWithMemories.count) places · \(AppData.memories.count) memories".uppercased())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.ink3).tracking(1.4)
                Text("Atlas")
                    .font(.custom("Georgia", size: 44))
                    .foregroundStyle(Theme.ink).tracking(-1)
                Text("Every place that stayed with you.")
                    .font(.custom("Georgia", size: 15).italic())
                    .foregroundStyle(Theme.ink3)
            }
            .padding(.bottom, 24)

            // Abstract map
            AbstractMapView()
                .padding(.bottom, 36)

            // Place postcards grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: 3), spacing: 16) {
                ForEach(placesWithMemories) { place in
                    PlaceCard(place: place) { memId in state.openMemory(memId) }
                }
            }
        }
        .padding(.horizontal, 36)
        .padding(.top, 18)
        .padding(.bottom, 80)
    }
}

// MARK: - Abstract Map

struct AbstractMapView: View {
    @State private var hoverPlace: String? = nil

    private var placesWithMemories: [Place] {
        AppData.places.filter { p in AppData.memories.contains { $0.place == p.id } }
    }

    var body: some View {
        GeometryReader { geo in
            let W = geo.size.width
            let H = geo.size.height

            ZStack {
                // Canvas: dots + continents + arcs
                Canvas { ctx, size in
                    drawDotGrid(ctx: ctx, size: size)
                    drawContinents(ctx: ctx, size: size)
                    drawArcs(ctx: ctx, size: size)
                }

                // Interactive pins
                ForEach(placesWithMemories) { place in
                    let pt = project(lat: place.lat, lng: place.lng, W: W, H: H)
                    let count = AppData.memories.filter { $0.place == place.id }.count
                    PlacePinView(place: place, count: count, hovered: hoverPlace == place.id)
                        .onHover { hoverPlace = $0 ? place.id : nil }
                        .position(pt)
                }
            }
        }
        .frame(height: 300)
        .background(Theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.rule, lineWidth: 0.5))
        .padding(.vertical, 2)
    }

    private func project(lat: Double, lng: Double, W: CGFloat, H: CGFloat) -> CGPoint {
        CGPoint(x: CGFloat((lng + 180) / 360) * W,
                y: CGFloat((90 - lat) / 180) * H)
    }

    private func drawDotGrid(ctx: GraphicsContext, size: CGSize) {
        let spacing: CGFloat = 20
        var x: CGFloat = 0
        while x < size.width {
            var y: CGFloat = 0
            while y < size.height {
                let dot = Path(ellipseIn: CGRect(x: x, y: y, width: 1.4, height: 1.4))
                ctx.fill(dot, with: .color(Color.black.opacity(0.16)))
                y += spacing
            }
            x += spacing
        }
    }

    private func drawContinents(ctx: GraphicsContext, size: CGSize) {
        let W = size.width, H = size.height
        let continents: [(Double, Double, Double, Double)] = [
            (0.12*W, 0.26*H, 0.23*W, 0.21*H),
            (0.33*W, 0.52*H, 0.11*W, 0.33*H),
            (0.47*W, 0.24*H, 0.13*W, 0.24*H),
            (0.52*W, 0.48*H, 0.24*W, 0.38*H),
            (0.62*W, 0.29*H, 0.28*W, 0.31*H),
            (0.82*W, 0.67*H, 0.09*W, 0.17*H),
        ]
        for (x, y, w, h) in continents {
            let rect = CGRect(x: x, y: y, width: w, height: h)
            let ellipse = Path(ellipseIn: rect)
            ctx.fill(ellipse, with: .color(Theme.accent.opacity(0.06)))
            ctx.stroke(ellipse, with: .color(Theme.accent.opacity(0.18)),
                      style: StrokeStyle(lineWidth: 0.6, dash: [2, 3]))
        }
    }

    private func drawArcs(ctx: GraphicsContext, size: CGSize) {
        let W = size.width, H = size.height
        let sorted = AppData.memories.sorted { $0.sortKey < $1.sortKey }
        var prev: CGPoint? = nil
        for m in sorted {
            guard let place = AppData.place(id: m.place) else { continue }
            let pt = CGPoint(x: CGFloat((place.lng + 180) / 360) * W,
                             y: CGFloat((90 - place.lat) / 180) * H)
            if let p = prev {
                let dx = pt.x - p.x, dy = pt.y - p.y
                if sqrt(dx*dx + dy*dy) > 2 {
                    let mid = CGPoint(x: (p.x + pt.x) / 2, y: (p.y + pt.y) / 2 - 25)
                    var arc = Path()
                    arc.move(to: p)
                    arc.addQuadCurve(to: pt, control: mid)
                    ctx.stroke(arc, with: .color(Theme.accent.opacity(0.35)),
                              style: StrokeStyle(lineWidth: 0.8, dash: [2, 3]))
                }
            }
            prev = pt
        }
    }
}

struct PlacePinView: View {
    let place: Place
    let count: Int
    let hovered: Bool

    private var radius: CGFloat { CGFloat(5 + min(count, 6)) * 1.2 }

    var body: some View {
        ZStack {
            Circle().fill(Theme.accent.opacity(0.10)).frame(width: (radius+5)*2, height: (radius+5)*2)
            Circle().fill(Theme.accent).frame(width: radius*2, height: radius*2)
                .overlay(Circle().stroke(Color.white, lineWidth: 1.5))
        }
        .overlay(alignment: .trailing) {
            Text(place.label)
                .font(.system(size: 11, design: .monospaced))
                .foregroundStyle(hovered ? Theme.ink : Theme.ink2)
                .fixedSize()
                .offset(x: radius + 8 + CGFloat(place.label.count) * 3.5)
        }
        .scaleEffect(hovered ? 1.15 : 1.0)
        .animation(.spring(duration: 0.2), value: hovered)
    }
}

// MARK: - Place card

struct PlaceCard: View {
    let place: Place
    let onOpen: (String) -> Void
    @State private var hovering = false

    private var memories: [Memory] {
        AppData.memories.filter { $0.place == place.id }
    }

    var body: some View {
        Button {
            if let first = memories.first { onOpen(first.id) }
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                PhotoPlaceholder(seed: "place-\(place.id)", height: 150, radius: 8,
                                 label: "PHOTO · \(place.label.lowercased())")

                HStack(alignment: .lastTextBaseline) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(place.label)
                            .font(.custom("Georgia", size: 20))
                            .foregroundStyle(Theme.ink).tracking(-0.2)
                        Text(place.country)
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.ink3)
                    }
                    Spacer()
                    Text("\(memories.count) \(memories.count == 1 ? "memory" : "memories")")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.ink3)
                        .padding(.horizontal, 7).padding(.vertical, 3)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(Theme.rule, lineWidth: 0.5))
                }
                .padding(.top, 12)

                HStack(spacing: 0) {
                    ForEach(Array(memories.prefix(3).enumerated()), id: \.element.id) { i, m in
                        Text(m.title + (i < min(memories.count, 3) - 1 ? " · " : ""))
                            .font(.custom("Georgia", size: 12.5).italic())
                            .foregroundStyle(Theme.ink2)
                    }
                }
                .padding(.top, 10)
                .lineLimit(1)
            }
            .padding(14)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.rule, lineWidth: 0.5))
            .scaleEffect(hovering ? 1.01 : 1.0)
            .shadow(color: .black.opacity(hovering ? 0.07 : 0), radius: 10, y: 4)
            .animation(.spring(duration: 0.2), value: hovering)
        }
        .buttonStyle(.plain)
        .onHover { hovering = $0 }
    }
}
