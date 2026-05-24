// PeopleView.swift — big "You" card + smaller cast cards.

import SwiftUI

struct PeopleView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    let you = state.content.person("you")!
    let others = state.content.people.filter { $0.id != "you" }
    let youMs = state.content.memories.filter { $0.peopleIds.contains("you") }

    ScrollView {
      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: 4) {
          Text(s.peopleEyebrow.uppercased())
            .font(Theme.mono(11, weight: .medium))
            .tracking(1.4)
            .foregroundStyle(Theme.ink3)
            .padding(.bottom, 8)
          Text(s.peopleHeadline)
            .font(Theme.serif(44, italic: true, weight: .regular))
            .foregroundStyle(Theme.ink)
            .tracking(-1)
          Text(s.peopleSubtitle)
            .font(Theme.serif(15, italic: true))
            .foregroundStyle(Theme.ink3)
        }
        .padding(.top, 6)
        .padding(.bottom, 28)

        // YOU — big card
        HStack(alignment: .center, spacing: 28) {
          ZStack {
            Circle()
              .fill(
                RadialGradient(colors: [.white, Color(red: 0.984, green: 0.886, blue: 0.863),
                                        Color(red: 0.851, green: 0.478, blue: 0.431)],
                               center: .init(x: 0.3, y: 0.3), startRadius: 10, endRadius: 130)
              )
              .frame(width: 180, height: 180)
              .shadow(color: Theme.accent.opacity(0.2), radius: 18, y: 8)
              .overlay(Circle().strokeBorder(.black.opacity(0.06), lineWidth: 0.5))
            Text(you.initials)
              .font(.system(size: 96))
              .foregroundStyle(Theme.accent)
          }
          VStack(alignment: .leading, spacing: 12) {
            Text(you.role.uppercased())
              .font(Theme.mono(11, weight: .medium))
              .tracking(1.2)
              .foregroundStyle(.black.opacity(0.55))
            Text(you.name)
              .font(Theme.serif(56, italic: true, weight: .medium))
              .foregroundStyle(Theme.ink)
              .tracking(-1.5)
            Text(s.peopleInAll(youMs.count, state.content.memories.count))
              .font(Theme.serif(17))
              .foregroundStyle(Theme.ink2)
              .lineSpacing(4)
              .frame(maxWidth: 520, alignment: .leading)
            FlowLayout(spacing: 6) {
              ForEach(youMs.prefix(5)) { m in
                Button { state.open(m.id) } label: {
                  Text(m.title)
                    .font(Theme.serif(14, italic: true))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, 10).padding(.vertical, 3)
                    .background(.white.opacity(0.5), in: Capsule())
                    .overlay(Capsule().strokeBorder(.black.opacity(0.08), lineWidth: 0.5))
                }
                .buttonStyle(.plain)
              }
            }
            .padding(.top, 4)
          }
          Spacer(minLength: 0)
        }
        .padding(28)
        .background(
          LinearGradient(colors: [
            Color(hue: 354/360, saturation: 0.20, brightness: 0.93),
            Color(hue: 340/360, saturation: 0.30, brightness: 0.86)
          ], startPoint: .topLeading, endPoint: .bottomTrailing),
          in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(.black.opacity(0.06), lineWidth: 0.5))
        .padding(.bottom, 22)

        Text(s.peopleAlsoIn.uppercased())
          .font(Theme.mono(10.5, weight: .medium))
          .tracking(1.2)
          .foregroundStyle(Theme.ink3)
          .padding(.horizontal, 4)
          .padding(.top, 12).padding(.bottom, 10)

        LazyVGrid(columns: [GridItem(.flexible(), spacing: 14),
                            GridItem(.flexible(), spacing: 14),
                            GridItem(.flexible(), spacing: 14)], spacing: 14) {
          ForEach(Array(others.enumerated()), id: \.1.id) { (i, p) in
            CastCard(person: p, hue: Double((i * 53 + 20) % 360),
                     memories: state.content.memories.filter { $0.peopleIds.contains(p.id) })
          }
        }
        Spacer(minLength: 80)
      }
      .padding(.horizontal, 36)
      .padding(.top, 14)
      .frame(maxWidth: 1000)
      .frame(maxWidth: .infinity, alignment: .center)
    }
  }
}

struct CastCard: View {
  let person: Person
  let hue: Double
  let memories: [Memory]
  @EnvironmentObject var state: AppState

  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      Avatar(initials: person.initials, hue: hue)
        .frame(width: 44, height: 44)
      VStack(alignment: .leading, spacing: 4) {
        Text(person.name)
          .font(Theme.serif(17, weight: .medium))
          .foregroundStyle(Theme.ink)
          .tracking(-0.2)
        Text(person.role.uppercased())
          .font(Theme.sans(10.5, weight: .medium))
          .tracking(1)
          .foregroundStyle(Theme.ink3)
        Text(memories.isEmpty
             ? state.content.strings.peopleMentioned
             : memories.map { "\"\($0.title)\"" }.joined(separator: ", "))
          .font(Theme.serif(13, italic: true))
          .foregroundStyle(Theme.ink2)
          .lineSpacing(2)
          .padding(.top, 4)
      }
      Spacer(minLength: 0)
    }
    .padding(14)
    .background(Theme.card, in: RoundedRectangle(cornerRadius: 12))
    .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Theme.rule, lineWidth: 0.5))
  }
}

struct FlowLayout: Layout {
  var spacing: CGFloat = 8

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    let maxWidth = proposal.width ?? .infinity
    var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0
    for sv in subviews {
      let sz = sv.sizeThatFits(.unspecified)
      if x + sz.width > maxWidth, x > 0 { x = 0; y += rowH + spacing; rowH = 0 }
      x += sz.width + spacing
      rowH = max(rowH, sz.height)
    }
    return CGSize(width: maxWidth.isFinite ? maxWidth : x, height: y + rowH)
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
    for sv in subviews {
      let sz = sv.sizeThatFits(.unspecified)
      if x + sz.width > bounds.maxX, x > bounds.minX { x = bounds.minX; y += rowH + spacing; rowH = 0 }
      sv.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(sz))
      x += sz.width + spacing
      rowH = max(rowH, sz.height)
    }
  }
}
