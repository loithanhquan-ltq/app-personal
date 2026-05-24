// SidebarView.swift — left nav: library / chapters / atlas / people + day counter.

import SwiftUI

struct Sidebar: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    List {
      Section(s.sectionLibrary) {
        sideItem(s.sideAll, systemImage: "book.closed", count: state.content.memories.count,
                 selected: state.route == .timeline && state.filterChapter == nil) {
          state.clearFilters(); state.route = .timeline
        }
        sideItem(s.sideToday, systemImage: "sparkles", count: nil,
                 selected: state.route == .library) { state.clearFilters(); state.route = .library }
        sideItem(s.sideLetters, systemImage: "envelope", count: state.content.letters.count,
                 selected: state.route == .letters) { state.clearFilters(); state.route = .letters }
        sideItem(s.sideFavorites, systemImage: "heart",
                 count: state.content.memories.filter(\.favorite).count,
                 selected: false) { state.query = "favorite"; state.route = .search }
      }

      Section(s.sectionChapters) {
        ForEach(state.content.chapters) { c in
          chapterItem(c)
        }
      }

      Section(s.sectionAtlas) {
        sideItem(s.sidePlaces, systemImage: "map", count: nil,
                 selected: state.route == .atlas) { state.clearFilters(); state.route = .atlas }
      }

      Section(s.sectionPeople) {
        sideItem(s.sideEveryone, systemImage: "person.2", count: nil,
                 selected: state.route == .people) { state.clearFilters(); state.route = .people }
      }
    }
    .listStyle(.sidebar)
    .safeAreaInset(edge: .bottom) { DayCounterFooter() }
  }

  @ViewBuilder
  private func sideItem(_ label: String, systemImage: String, count: Int?,
                        selected: Bool, action: @escaping () -> Void) -> some View {
    Button(action: action) {
      HStack(spacing: 8) {
        Image(systemName: systemImage)
          .font(.system(size: 12, weight: .medium))
          .foregroundStyle(selected ? .white : Theme.ink2)
          .frame(width: 14)
        Text(label)
          .font(Theme.sans(12, weight: selected ? .semibold : .medium))
          .foregroundStyle(selected ? .white : Theme.ink)
          .lineLimit(1)
        Spacer()
        if let count {
          Text("\(count)")
            .font(Theme.sans(10.5, weight: .medium))
            .foregroundStyle(selected ? .white.opacity(0.75) : Theme.ink3)
        }
      }
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(selected ? Color(red: 0.137, green: 0.235, blue: 0.431).opacity(0.92) : .clear,
                  in: RoundedRectangle(cornerRadius: 6))
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    .listRowInsets(EdgeInsets(top: 1, leading: 0, bottom: 1, trailing: 0))
  }

  @ViewBuilder
  private func chapterItem(_ c: Chapter) -> some View {
    let count = state.content.memories.filter { $0.chapterId == c.id }.count
    let selected = state.route == .timeline && state.filterChapter == c.id
    Button {
      state.filterChapter = c.id
      state.query = ""
      state.route = .timeline
    } label: {
      HStack(spacing: 8) {
        RoundedRectangle(cornerRadius: 2)
          .fill(Color(hue: c.hue / 360, saturation: 0.45, brightness: 0.72))
          .frame(width: 9, height: 9)
          .overlay(RoundedRectangle(cornerRadius: 2).stroke(.black.opacity(0.15), lineWidth: 0.5))
        Text(c.label)
          .font(Theme.sans(12, weight: selected ? .semibold : .medium))
          .foregroundStyle(selected ? .white : Theme.ink)
          .lineLimit(1)
        Spacer()
        Text("\(count)")
          .font(Theme.sans(10.5, weight: .medium))
          .foregroundStyle(selected ? .white.opacity(0.75) : Theme.ink3)
      }
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(selected ? Color(red: 0.137, green: 0.235, blue: 0.431).opacity(0.92) : .clear,
                  in: RoundedRectangle(cornerRadius: 6))
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    .listRowInsets(EdgeInsets(top: 1, leading: 0, bottom: 1, trailing: 0))
  }
}

struct DayCounterFooter: View {
  @EnvironmentObject var state: AppState
  @ObservedObject private var updater = UpdateChecker.shared

  var body: some View {
    let days = state.content.daysSinceStart()
    let s = state.content.strings
    VStack(spacing: 6) {
      if updater.isUpdating {
        VStack(alignment: .leading, spacing: 5) {
          ProgressView(value: updater.updateProgress)
            .progressViewStyle(.linear)
            .tint(Theme.accent)
          Text("Downloading update…")
            .font(Theme.sans(10.5))
            .foregroundStyle(Theme.ink3)
        }
        .padding(.horizontal, 10).padding(.vertical, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 7))
        .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(Theme.rule, lineWidth: 0.5))
      } else if let errMsg = updater.updateError {
        VStack(alignment: .leading, spacing: 5) {
          Text("Update failed")
            .font(Theme.sans(11, weight: .semibold))
            .foregroundStyle(.red.opacity(0.85))
          Text(errMsg)
            .font(Theme.sans(10))
            .foregroundStyle(Theme.ink3)
            .lineLimit(2)
          Button("Retry") { updater.downloadAndInstall() }
            .font(Theme.sans(11, weight: .medium))
            .foregroundStyle(Theme.accent)
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 10).padding(.vertical, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 7))
        .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(.red.opacity(0.25), lineWidth: 0.5))
      } else if let version = updater.availableVersion {
        Button { updater.downloadAndInstall() } label: {
          HStack(spacing: 6) {
            Image(systemName: "arrow.down.circle.fill").font(.system(size: 11))
            Text("Update Now  v\(version)")
              .font(Theme.sans(11, weight: .medium))
            Spacer()
          }
          .foregroundStyle(.white)
          .padding(.horizontal, 10).padding(.vertical, 7)
          .frame(maxWidth: .infinity)
          .background(Theme.accent, in: RoundedRectangle(cornerRadius: 7))
        }
        .buttonStyle(.plain)
      }

      HStack {
        VStack(alignment: .leading, spacing: 2) {
          HStack(alignment: .firstTextBaseline, spacing: 4) {
            Text(formatNumber(days, locale: state.language.locale))
              .font(Theme.serif(22, weight: .medium))
              .foregroundStyle(Theme.accent)
              .tracking(-0.5)
            Text(s.footerDays)
              .font(Theme.sans(11, weight: .semibold))
              .foregroundStyle(Theme.ink.opacity(0.7))
          }
          Text(s.footerSince)
            .font(Theme.serif(11, italic: true))
            .foregroundStyle(Theme.ink2.opacity(0.7))
        }
        Spacer()
      }
      .padding(.horizontal, 12)
      .padding(.vertical, 10)
      .background(Theme.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
    }
    .padding(.horizontal, 8)
    .padding(.bottom, 8)
  }
}

func formatNumber(_ n: Int, locale: Locale = .current) -> String {
  let f = NumberFormatter()
  f.numberStyle = .decimal
  f.locale = locale
  return f.string(from: NSNumber(value: n)) ?? "\(n)"
}
