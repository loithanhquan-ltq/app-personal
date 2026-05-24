// LibraryView.swift — landing page: day counter, day-one, anniversaries, chapters, recent.

import SwiftUI

struct LibraryView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    let days = state.content.daysSinceStart()
    let dayOne = state.content.memory("m01")!
    let favs = state.content.memories.filter { state.isFavorite($0.id) }
    let anniv = state.content.memories
      .filter { ["m01", "m10", "m14", "m17"].contains($0.id) }
    let recent = state.content.memories.sorted { $0.sortKey > $1.sortKey }.prefix(3)
    let yearCounts: [(Int, Int)] = Array(2022...2026).map { y in
      (y, state.content.memories.filter { $0.year == y }.count)
    }

    ScrollView {
      VStack(alignment: .leading, spacing: 36) {
        // Hero
        HStack(alignment: .bottom, spacing: 32) {
          VStack(alignment: .leading, spacing: 8) {
            Text(s.libraryEyebrow(state.content.memories.count).uppercased())
              .font(Theme.mono(11, weight: .medium))
              .tracking(1.4)
              .foregroundStyle(Theme.ink3)
            (Text(formatNumber(days, locale: state.language.locale))
              .font(Theme.serif(64, italic: true))
              .foregroundColor(Theme.accent)
            + Text(" " + s.libraryHeadlineA)
              .font(Theme.serif(64, italic: true))
              .foregroundColor(Theme.ink)
            + Text(s.libraryHeadlineB)
              .font(Theme.serif(64, italic: true))
              .foregroundColor(Theme.ink3))
              .lineSpacing(-12)
              .tracking(-2)
            Text(s.librarySubtitle)
              .font(Theme.serif(17, italic: true))
              .foregroundStyle(Theme.ink2)
          }
          Spacer(minLength: 0)
          HStack(spacing: 8) {
            ForEach(yearCounts, id: \.0) { (y, n) in
              VStack(spacing: 2) {
                Text("\(y)")
                  .font(Theme.mono(10.5))
                  .foregroundStyle(Theme.ink3)
                Text("\(n)")
                  .font(Theme.serif(22, weight: .medium))
                  .foregroundStyle(Theme.ink)
              }
              .padding(.horizontal, 12)
              .padding(.vertical, 8)
              .frame(minWidth: 56)
              .background(Theme.card, in: RoundedRectangle(cornerRadius: 10))
              .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Theme.rule, lineWidth: 0.5))
            }
          }
        }
        .padding(.top, 6)

        // Where it began
        SectionHeader(s.sectionWhereItBegan, subtitle: dayOne.date)
        Button { state.open(dayOne.id) } label: {
          HStack(alignment: .center, spacing: 28) {
            PhotoSlot(id: "hero-\(dayOne.id)", placeholder: "photo · \(dayOne.date)",
                      cornerRadius: 10, height: 260)
              .frame(maxWidth: .infinity)
            VStack(alignment: .leading, spacing: 12) {
              Text("\(s.dayOnePrefix) · \(dayOne.date)".uppercased())
                .font(Theme.mono(10.5, weight: .medium))
                .tracking(1.2)
                .foregroundStyle(Theme.ink3)
              Text(dayOne.title)
                .font(Theme.serif(32, italic: true, weight: .medium))
                .foregroundStyle(Theme.ink)
                .multilineTextAlignment(.leading)
              Text(dayOne.body)
                .font(Theme.serif(16))
                .foregroundStyle(Theme.ink2)
                .lineSpacing(4)
                .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
          }
          .padding(22)
          .background(Theme.card, in: RoundedRectangle(cornerRadius: 16))
          .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(Theme.rule, lineWidth: 0.5))
        }
        .buttonStyle(.plain)

        // Anniversaries
        SectionHeader(s.sectionAnniversaries, subtitle: s.sectionAnniversariesSub)
        HStack(spacing: 12) {
          ForEach(Array(anniv.enumerated()), id: \.1.id) { (i, m) in
            Button { state.open(m.id) } label: {
              VStack(alignment: .leading, spacing: 0) {
                Text("\(s.yearLabel) \(i)")
                  .font(Theme.mono(10.5, weight: .medium))
                  .tracking(1)
                  .foregroundStyle(.black.opacity(0.55))
                Spacer(minLength: 8)
                VStack(alignment: .leading, spacing: 6) {
                  Text(m.title)
                    .font(Theme.serif(22, italic: true, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.leading)
                  Text(m.date)
                    .font(Theme.sans(11))
                    .foregroundStyle(Theme.ink2)
                }
              }
              .padding(18)
              .frame(maxWidth: .infinity, minHeight: 130, alignment: .topLeading)
              .background(
                LinearGradient(colors: [
                  Color(hue: max(0, (354.0 - Double(i) * 8) / 360), saturation: 0.18, brightness: 0.94),
                  Color(hue: max(0, (340.0 - Double(i) * 12) / 360), saturation: 0.24, brightness: 0.88)
                ], startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 12))
              .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(.black.opacity(0.06), lineWidth: 0.5))
            }
            .buttonStyle(.plain)
          }
        }

        // Chapters strip
        SectionHeader(s.sectionChaptersTitle, subtitle: s.sectionChaptersSub)
        HStack(spacing: 10) {
          ForEach(state.content.chapters) { c in
            let count = state.content.memories.filter { $0.chapterId == c.id }.count
            Button { state.openChapter(c.id) } label: {
              VStack(alignment: .leading, spacing: 4) {
                Text(c.span.uppercased())
                  .font(Theme.mono(10, weight: .medium))
                  .tracking(0.8)
                  .foregroundStyle(.black.opacity(0.55))
                Text(c.label)
                  .font(Theme.serif(22, italic: true, weight: .medium))
                  .foregroundStyle(Theme.ink)
                Text(s.memoriesCount(count))
                  .font(Theme.sans(11))
                  .foregroundStyle(Theme.ink3)
              }
              .padding(16)
              .frame(maxWidth: .infinity, alignment: .leading)
              .background(
                LinearGradient(colors: [
                  Color(hue: c.hue / 360, saturation: 0.18, brightness: 0.94),
                  Color(hue: c.hue / 360, saturation: 0.26, brightness: 0.88)
                ], startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 12))
              .overlay(RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color(hue: c.hue / 360, saturation: 0.30, brightness: 0.78).opacity(0.4),
                               lineWidth: 0.5))
            }
            .buttonStyle(.plain)
          }
        }

        // Favorites
        SectionHeader(s.sectionFavorites, subtitle: s.sectionFavoritesSub)
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14),
                            GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)],
                  spacing: 14) {
          ForEach(favs.prefix(4)) { m in MemoryTile(memory: m) }
        }

        // Recently added
        SectionHeader(s.sectionRecent, subtitle: nil)
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14),
                            GridItem(.flexible(), spacing: 14)],
                  spacing: 14) {
          ForEach(Array(recent)) { m in MemoryTile(memory: m) }
        }

        Spacer(minLength: 60)
      }
      .padding(.horizontal, 36)
      .padding(.top, 14)
      .frame(maxWidth: 1100)
      .frame(maxWidth: .infinity, alignment: .center)
    }
  }
}

struct SectionHeader: View {
  let title: String
  let subtitle: String?
  init(_ title: String, subtitle: String? = nil) { self.title = title; self.subtitle = subtitle }
  var body: some View {
    HStack(alignment: .lastTextBaseline, spacing: 12) {
      Text(title)
        .font(Theme.serif(22, weight: .medium))
        .foregroundStyle(Theme.ink)
      if let subtitle {
        Text(subtitle)
          .font(Theme.sans(12))
          .foregroundStyle(Theme.ink3)
      }
      Spacer()
    }
  }
}

struct MemoryTile: View {
  let memory: Memory
  @EnvironmentObject var state: AppState
  @State private var isHovered = false

  var body: some View {
    Button { state.open(memory.id) } label: {
      VStack(alignment: .leading, spacing: 0) {
        PhotoSlot(id: "tile-\(memory.id)", placeholder: "photo · \(memory.date)",
                  cornerRadius: 6, height: 130)
        VStack(alignment: .leading, spacing: 4) {
          Text(memory.title)
            .font(Theme.serif(16, weight: .medium))
            .foregroundStyle(Theme.ink)
            .lineLimit(2)
            .multilineTextAlignment(.leading)
          Text("\(memory.date) · \(state.content.place(memory.placeId)?.label ?? "")")
            .font(Theme.sans(11))
            .foregroundStyle(Theme.ink3)
            .lineLimit(1)
        }
        .padding(.top, 10)
        .padding(.horizontal, 4)
        .padding(.bottom, 2)
      }
      .padding(10)
      .background(Theme.card, in: RoundedRectangle(cornerRadius: 10))
      .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Theme.rule, lineWidth: 0.5))
      .scaleEffect(isHovered ? 1.018 : 1.0)
      .shadow(color: isHovered ? .black.opacity(0.09) : .clear, radius: 10, y: 5)
    }
    .buttonStyle(.plain)
    .onHover { isHovered = $0 }
    .animation(.easeOut(duration: 0.15), value: isHovered)
    .contextMenu {
      Button("Open") { state.open(memory.id) }
      Divider()
      Button(state.isFavorite(memory.id) ? "Remove from Favorites" : "Add to Favorites") {
        state.toggleFavorite(memory.id)
      }
      Button("Copy Date") {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(memory.date, forType: .string)
      }
    }
  }
}
