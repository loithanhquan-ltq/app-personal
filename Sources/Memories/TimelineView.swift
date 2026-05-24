// TimelineView.swift — chronological feed, grouped by year, optionally filtered by chapter.

import SwiftUI

struct TimelineView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    let list = state.content.memories
      .filter { state.filterChapter == nil || $0.chapterId == state.filterChapter }
      .sorted { $0.sortKey < $1.sortKey }
    let chapter = state.filterChapter.flatMap { state.content.chapter($0) }
    let byYear: [Int: [Memory]] = Dictionary(grouping: list) { $0.year }
    let years = byYear.keys.sorted()

    ScrollView {
      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: 8) {
          Text((chapter?.span ?? s.timelineAllRange).uppercased())
            .font(Theme.mono(11, weight: .medium))
            .tracking(1.4)
            .foregroundStyle(Theme.ink3)
          Text(chapter?.label ?? s.timelineAllTitle)
            .font(Theme.serif(44, italic: true, weight: .regular))
            .foregroundStyle(Theme.ink)
            .tracking(-1)
          Text(s.memoriesCount(list.count))
            .font(Theme.serif(15, italic: true))
            .foregroundStyle(Theme.ink3)
        }
        .padding(.top, 6)
        .padding(.bottom, 4)

        ForEach(years, id: \.self) { y in
          YearMark(year: y)
          VStack(spacing: 4) {
            ForEach(byYear[y] ?? []) { m in
              MemoryWideCard(memory: m)
            }
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

struct YearMark: View {
  let year: Int
  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: 14) {
      Text("\(year)")
        .font(Theme.serif(44, weight: .medium))
        .foregroundStyle(Theme.ink)
        .tracking(-1)
      Rectangle().fill(Theme.rule).frame(height: 1)
    }
    .padding(.top, 24)
    .padding(.bottom, 10)
  }
}

struct MemoryWideCard: View {
  let memory: Memory
  @EnvironmentObject var state: AppState
  @State private var isHovered = false

  var body: some View {
    Button { state.open(memory.id) } label: {
      HStack(alignment: .top, spacing: 22) {
        PhotoSlot(id: "wide-\(memory.id)", placeholder: "photo · \(memory.date)",
                  cornerRadius: 8, height: 150)
          .frame(width: 220)
        VStack(alignment: .leading, spacing: 6) {
          Text("\(memory.date) · \(state.content.place(memory.placeId)?.label ?? "")\(state.isFavorite(memory.id) ? " · ★" : "")".uppercased())
            .font(Theme.mono(10.5, weight: .medium))
            .tracking(1)
            .foregroundStyle(Theme.ink3)
          Text(memory.title)
            .font(Theme.serif(26, weight: .medium))
            .foregroundStyle(Theme.ink)
            .tracking(-0.3)
            .multilineTextAlignment(.leading)
          Text(memory.body)
            .font(Theme.serif(15))
            .foregroundStyle(Theme.ink2)
            .lineSpacing(4)
            .lineLimit(3)
            .multilineTextAlignment(.leading)
            .frame(maxWidth: 620, alignment: .leading)
          HStack(spacing: 6) {
            ChipView(state.content.chapter(memory.chapterId)?.label ?? "", accent: true)
            ForEach(memory.tags, id: \.self) { t in ChipView(t) }
          }
          .padding(.top, 8)
        }
        Spacer(minLength: 0)
      }
      .padding(16)
      .background(isHovered ? Theme.card : Color.clear, in: RoundedRectangle(cornerRadius: 12))
      .overlay(
        RoundedRectangle(cornerRadius: 12)
          .strokeBorder(isHovered ? Theme.rule : Color.clear, lineWidth: 0.5)
      )
      .contentShape(RoundedRectangle(cornerRadius: 12))
    }
    .buttonStyle(.plain)
    .onHover { isHovered = $0 }
    .animation(.easeOut(duration: 0.12), value: isHovered)
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

struct ChipView: View {
  let text: String
  let accent: Bool
  init(_ text: String, accent: Bool = false) { self.text = text; self.accent = accent }
  var body: some View {
    Text(text)
      .font(Theme.sans(11, weight: .medium))
      .foregroundStyle(accent ? Theme.accent : Theme.ink2)
      .padding(.horizontal, 9)
      .padding(.vertical, 3)
      .background(Capsule().fill(accent ? Theme.accent.opacity(0.10) : .black.opacity(0.05)))
      .overlay(Capsule().strokeBorder(accent ? Theme.accent.opacity(0.25) : .black.opacity(0.08),
                                      lineWidth: 0.5))
  }
}
