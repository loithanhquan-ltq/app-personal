import SwiftUI

struct ContentView: View {
    @State private var appState = AppState()

    var body: some View {
        NavigationSplitView {
            SidebarView()
                .navigationSplitViewColumnWidth(min: 190, ideal: 220, max: 260)
        } detail: {
            MainContentView()
        }
        .environment(appState)
        .searchable(text: Binding(
            get: { appState.searchQuery },
            set: { appState.searchQuery = $0 }
        ), placement: .toolbar, prompt: "Search memories")
        .background(Theme.bg)
        .toolbar {
            ToolbarItem(placement: .principal) {
                ViewTabPicker()
            }
            ToolbarItem(placement: .primaryAction) {
                Button { } label: {
                    Label("New memory", systemImage: "plus")
                        .font(.system(size: 11.5, weight: .semibold))
                }
                .tint(Theme.accent)
            }
        }
        .environment(appState)
    }
}

// MARK: - View tab picker (toolbar centre)

struct ViewTabPicker: View {
    @Environment(AppState.self) private var state

    private let tabs: [(label: String, item: SidebarItem)] = [
        ("Library",  .library),
        ("Timeline", .allMemories),
        ("Letters",  .letters),
        ("Atlas",    .atlas),
        ("People",   .people),
    ]

    var body: some View {
        HStack(spacing: 1) {
            ForEach(tabs, id: \.label) { tab in
                let selected = state.sidebarSelection == tab.item && state.detailMemoryId == nil
                Button {
                    state.navigate(to: tab.item)
                } label: {
                    Text(tab.label)
                        .font(.system(size: 11.5, weight: .medium))
                        .foregroundStyle(selected ? Theme.ink : Theme.ink2)
                        .padding(.horizontal, 10).padding(.vertical, 4)
                        .background(
                            selected
                            ? RoundedRectangle(cornerRadius: 5)
                                .fill(Theme.card)
                                .shadow(color: .black.opacity(0.08), radius: 2, y: 1)
                            : nil
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(2)
        .background(Theme.ink.opacity(0.06), in: RoundedRectangle(cornerRadius: 7))
    }
}

// MARK: - Main content router

struct MainContentView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        ScrollView {
            Group {
                if !state.searchQuery.isEmpty {
                    SearchView()
                } else if let memId = state.detailMemoryId {
                    DetailView(memoryId: memId)
                } else {
                    switch state.sidebarSelection {
                    case .library, nil:
                        LibraryView()
                    case .allMemories:
                        TimelineView(filterChapter: nil)
                    case .chapter(let c):
                        TimelineView(filterChapter: c)
                    case .letters:
                        LettersView()
                    case .atlas:
                        AtlasView()
                    case .people:
                        PeopleView()
                    case .favorites:
                        TimelineView(filterChapter: nil, favoritesOnly: true)
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
        .background(Theme.bg)
        .scrollContentBackground(.hidden)
    }
}
