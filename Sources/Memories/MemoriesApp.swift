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
        .frame(minWidth: 960, minHeight: 640)
        .background(Theme.bg)
        .preferredColorScheme(.light)
    }
    .windowStyle(.titleBar)
    .windowToolbarStyle(.unifiedCompact(showsTitle: false))
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
    .background(Theme.bg)
  }
}

struct DetailColumn: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    VStack(spacing: 0) {
      TopBar()
      Divider().overlay(Theme.rule)

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
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .background(Theme.bg)
  }
}

// ── Top bar ───────────────────────────────────────────────

struct TopBar: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    HStack(spacing: 12) {
      NavSwitcher()
      Spacer(minLength: 16)
      LanguageSwitcher()
      Rectangle()
        .fill(.black.opacity(0.10))
        .frame(width: 1, height: 16)
      SearchField()
      NewMemoryButton()
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 9)
    .background(Theme.bg)
  }
}

// ── Nav + Language pieces ─────────────────────────────────

struct NavSwitcher: View {
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
    .background(.black.opacity(0.06), in: RoundedRectangle(cornerRadius: 8))
  }

  private func isActive(_ r: AppState.Route) -> Bool {
    if case .detail = state.route { return false }
    return state.route == r
  }

  @ViewBuilder
  private func seg(_ label: String, active: Bool, action: @escaping () -> Void) -> some View {
    Button(action: action) {
      Text(label)
        .font(Theme.sans(12, weight: active ? .semibold : .medium))
        .foregroundStyle(active ? Theme.ink : Theme.ink2)
        .padding(.horizontal, 11)
        .padding(.vertical, 5)
        .background(
          active ? Color(red: 1, green: 0.992, blue: 0.973) : .clear,
          in: RoundedRectangle(cornerRadius: 6)
        )
        .shadow(color: active ? .black.opacity(0.07) : .clear, radius: 2, y: 1)
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
            .tracking(0.5)
            .foregroundStyle(state.language == l ? Theme.ink : Theme.ink3)
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(
              state.language == l ? Color(red: 1, green: 0.992, blue: 0.973) : .clear,
              in: RoundedRectangle(cornerRadius: 6)
            )
            .shadow(color: state.language == l ? .black.opacity(0.07) : .clear, radius: 2, y: 1)
        }
        .buttonStyle(.plain)
      }
    }
    .padding(2)
    .background(.black.opacity(0.06), in: RoundedRectangle(cornerRadius: 8))
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
        .frame(width: 148)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 5)
    .background(.black.opacity(0.04), in: RoundedRectangle(cornerRadius: 7))
    .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(.black.opacity(0.07), lineWidth: 0.5))
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
          .font(Theme.sans(12, weight: .semibold))
      }
      .padding(.horizontal, 11)
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
