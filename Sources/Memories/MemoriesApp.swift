// MemoriesApp.swift — entry point + window + root layout.

import SwiftUI
import AppKit

@main
struct MemoriesApp: App {
  @StateObject private var state = AppState()

  init() {
    NSApplication.shared.setActivationPolicy(.regular)
    NSApplication.shared.activate(ignoringOtherApps: true)
    DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
      Task { await UpdateChecker.shared.checkSilently() }
    }
  }

  var body: some Scene {
    Window(state.content.strings.appName, id: "main") {
      RootView()
        .environmentObject(state)
        .frame(minWidth: 1100, minHeight: 700)
        .background(Theme.bg)
        .preferredColorScheme(.light)
    }
    .windowStyle(.titleBar)
    .windowToolbarStyle(.unified(showsTitle: false))
    .commands {
      CommandGroup(replacing: .appInfo) {
        Button("About \(state.content.strings.appName)") { }
      }
      CommandGroup(after: .appInfo) {
        Button("Check for Updates…") { UpdateChecker.shared.checkAndAlert() }
      }
      CommandGroup(replacing: .newItem) {}
      CommandMenu("Language") {
        Button("English")    { state.setLanguage(.en) }.keyboardShortcut("e", modifiers: [.command, .shift])
        Button("Français")   { state.setLanguage(.fr) }.keyboardShortcut("f", modifiers: [.command, .shift])
        Button("Tiếng Việt") { state.setLanguage(.vi) }.keyboardShortcut("v", modifiers: [.command, .shift])
      }
    }
  }
}

struct RootView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    NavigationSplitView {
      Sidebar()
        .navigationSplitViewColumnWidth(min: 220, ideal: 240, max: 280)
    } detail: {
      DetailColumn()
    }
    .navigationTitle("")
    .toolbar {
      ToolbarItem(placement: .principal) { TitleSegmentedSwitcher() }
      ToolbarItem(placement: .primaryAction) { LanguageSwitcher() }
      ToolbarItem(placement: .primaryAction) { SearchField() }
      ToolbarItem(placement: .primaryAction) { NewMemoryButton() }
    }
    .background(Theme.bg)
  }
}

struct DetailColumn: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    Group {
      if !state.query.trim().isEmpty {
        SearchResultsView()
      } else {
        switch state.route {
        case .library:         LibraryView()
        case .timeline:        TimelineView()
        case .letters:         LettersView()
        case .atlas:           AtlasView()
        case .people:          PeopleView()
        case .search:          SearchResultsView()
        case .detail(let id):  DetailView(memoryId: id)
        }
      }
    }
    .background(Theme.bg)
    .navigationSubtitle(routeTitle)
  }

  private var routeTitle: String {
    let s = state.content.strings
    if !state.query.trim().isEmpty { return s.searchPlaceholder }
    switch state.route {
    case .library:  return s.tabLibrary
    case .timeline:
      if let c = state.filterChapter, let ch = state.content.chapter(c) { return ch.label }
      return s.tabTimeline
    case .letters:  return s.tabLetters
    case .atlas:    return s.tabAtlas
    case .people:   return s.tabPeople
    case .search:   return s.searchPlaceholder
    case .detail(let id): return state.content.memory(id)?.title ?? "Memory"
    }
  }
}

// ── Toolbar pieces ────────────────────────────────────────

struct TitleSegmentedSwitcher: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    HStack(spacing: 1) {
      seg(s.tabLibrary,  active: isActive(.library))  { state.clearFilters(); state.route = .library }
      seg(s.tabTimeline, active: isActive(.timeline)) { state.clearFilters(); state.route = .timeline }
      seg(s.tabLetters,  active: isActive(.letters))  { state.clearFilters(); state.route = .letters }
      seg(s.tabAtlas,    active: isActive(.atlas))    { state.clearFilters(); state.route = .atlas }
      seg(s.tabPeople,   active: isActive(.people))   { state.clearFilters(); state.route = .people }
    }
    .padding(2)
    .background(.black.opacity(0.06), in: RoundedRectangle(cornerRadius: 7))
  }

  private func isActive(_ r: AppState.Route) -> Bool {
    if case .detail = state.route, case .timeline = r { return false }
    return state.route == r
  }

  @ViewBuilder
  private func seg(_ label: String, active: Bool, action: @escaping () -> Void) -> some View {
    Button(action: action) {
      Text(label)
        .font(Theme.sans(11.5, weight: .medium))
        .foregroundStyle(active ? Theme.ink : Theme.ink2)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(active ? Color(red: 1, green: 0.992, blue: 0.973) : .clear,
                    in: RoundedRectangle(cornerRadius: 5))
        .shadow(color: active ? .black.opacity(0.08) : .clear, radius: 1, y: 1)
    }
    .buttonStyle(.plain)
  }
}

struct LanguageSwitcher: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    HStack(spacing: 1) {
      ForEach(Language.allCases) { l in
        Button { state.setLanguage(l) } label: {
          Text(l.label)
            .font(Theme.sans(11, weight: .semibold))
            .tracking(0.4)
            .foregroundStyle(state.language == l ? Theme.ink : Theme.ink3)
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(state.language == l ? Color(red: 1, green: 0.992, blue: 0.973) : .clear,
                        in: RoundedRectangle(cornerRadius: 5))
            .shadow(color: state.language == l ? .black.opacity(0.08) : .clear, radius: 1, y: 1)
        }
        .buttonStyle(.plain)
      }
    }
    .padding(2)
    .background(.black.opacity(0.06), in: RoundedRectangle(cornerRadius: 7))
  }
}

struct SearchField: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: "magnifyingglass")
        .font(.system(size: 11, weight: .medium))
        .foregroundStyle(Theme.ink3)
      TextField(state.content.strings.searchPlaceholder, text: $state.query)
        .textFieldStyle(.plain)
        .font(Theme.sans(12))
        .foregroundStyle(Theme.ink)
        .frame(width: 160)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 4)
    .background(.black.opacity(0.05), in: RoundedRectangle(cornerRadius: 7))
    .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(.black.opacity(0.06), lineWidth: 0.5))
  }
}

struct NewMemoryButton: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    Button {} label: {
      HStack(spacing: 4) {
        Image(systemName: "plus")
          .font(.system(size: 10, weight: .bold))
        Text(state.content.strings.newMemory)
          .font(Theme.sans(11.5, weight: .semibold))
      }
      .padding(.horizontal, 10)
      .padding(.vertical, 5)
      .foregroundStyle(.white)
      .background(Theme.accent, in: RoundedRectangle(cornerRadius: 7))
    }
    .buttonStyle(.plain)
  }
}

extension String {
  func trim() -> String { trimmingCharacters(in: .whitespacesAndNewlines) }
}
