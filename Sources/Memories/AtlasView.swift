// AtlasView.swift — MapKit map of South Vietnam + postcard grid by place.

import SwiftUI
import MapKit

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

        VietnamMap(places: order, byPlace: byPlace)
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

struct VietnamMap: View {
  let places: [Place]
  let byPlace: [String: [Memory]]
  @EnvironmentObject var state: AppState

  @State private var position: MapCameraPosition = .region(
    MKCoordinateRegion(
      center: CLLocationCoordinate2D(latitude: 10.8, longitude: 107.5),
      span: MKCoordinateSpan(latitudeDelta: 5.0, longitudeDelta: 6.0)
    )
  )

  var body: some View {
    // Deduplicate places at identical coordinates (home + cafe → one HCMC pin)
    let pinGroups: [(Place, Int)] = {
      var result: [(Place, Int)] = []
      var keyToIndex: [String: Int] = [:]
      for p in places {
        let key = "\(p.lat),\(p.lng)"
        let c = byPlace[p.id]?.count ?? 0
        if let idx = keyToIndex[key] { result[idx].1 += c }
        else { keyToIndex[key] = result.count; result.append((p, c)) }
      }
      return result
    }()

    // Travel route connecting cities in chronological order
    let routeCoords: [CLLocationCoordinate2D] = {
      let ordered = state.content.memories.sorted { $0.sortKey < $1.sortKey }
        .compactMap { state.content.place($0.placeId) }
      var deduped: [Place] = []
      for p in ordered {
        if let last = deduped.last,
           abs(last.lat - p.lat) < 0.001 && abs(last.lng - p.lng) < 0.001 { continue }
        deduped.append(p)
      }
      return deduped.map { CLLocationCoordinate2D(latitude: $0.lat, longitude: $0.lng) }
    }()

    Map(position: $position) {
      if routeCoords.count > 1 {
        MapPolyline(coordinates: routeCoords)
          .stroke(Theme.accent.opacity(0.55), style: StrokeStyle(lineWidth: 2, dash: [5, 5]))
      }
      ForEach(pinGroups, id: \.0.id) { (place, count) in
        Annotation(place.label,
                   coordinate: CLLocationCoordinate2D(latitude: place.lat, longitude: place.lng),
                   anchor: .bottom) {
          ZStack {
            Circle()
              .fill(Theme.accent.opacity(0.18))
              .frame(width: 28, height: 28)
            Circle()
              .fill(Theme.accent)
              .frame(width: 14, height: 14)
              .overlay(Circle().strokeBorder(.white, lineWidth: 2))
          }
          .shadow(color: .black.opacity(0.22), radius: 3, y: 1)
        }
      }
    }
    .mapStyle(.standard(elevation: .flat, pointsOfInterest: .excludingAll))
    .frame(height: 440)
    .clipShape(RoundedRectangle(cornerRadius: 14))
    .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Theme.rule, lineWidth: 0.5))
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
