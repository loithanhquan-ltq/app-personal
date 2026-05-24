import SwiftUI

struct SidebarView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        @Bindable var st = state
        List(selection: $st.sidebarSelection) {
            Section("Library") {
                SideLabel("All memories", icon: "book.closed", count: AppData.memories.count)
                    .tag(SidebarItem.allMemories)
                SideLabel("Today", icon: "sparkles")
                    .tag(SidebarItem.library)
                SideLabel("Letters", icon: "pencil", count: AppData.letters.count)
                    .tag(SidebarItem.letters)
                SideLabel("Favorites", icon: "heart", count: AppData.favorites.count)
                    .tag(SidebarItem.favorites)
            }

            Section("Chapters") {
                ForEach(AppData.chapters) { chapter in
                    HStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Theme.chapterDot(hue: chapter.hue))
                            .frame(width: 9, height: 9)
                        Text(chapter.label)
                        Spacer()
                        Text("\(AppData.memories(forChapter: chapter.id).count)")
                            .font(.system(size: 11)).foregroundStyle(Theme.ink3)
                    }
                    .tag(SidebarItem.chapter(chapter.id))
                }
            }

            Section("Atlas") {
                SideLabel("Places we've been", icon: "map")
                    .tag(SidebarItem.atlas)
            }

            Section("People") {
                SideLabel("You & the cast", icon: "person.2")
                    .tag(SidebarItem.people)
            }
        }
        .listStyle(.sidebar)
        .onChange(of: state.sidebarSelection) { _, _ in
            state.detailMemoryId = nil
            state.searchQuery = ""
        }
        .safeAreaInset(edge: .bottom) {
            DayCounterFooter()
        }
    }
}

private struct SideLabel: View {
    let title: String
    let icon: String
    var count: Int? = nil

    init(_ title: String, icon: String, count: Int? = nil) {
        self.title = title; self.icon = icon; self.count = count
    }

    var body: some View {
        HStack {
            Label(title, systemImage: icon)
            if let count {
                Spacer()
                Text("\(count)").font(.system(size: 11)).foregroundStyle(Theme.ink3)
            }
        }
    }
}

struct DayCounterFooter: View {
    @ObservedObject private var updater = UpdateChecker.shared

    var body: some View {
        VStack(spacing: 6) {
            // Update badge — only visible when a newer version exists
            if let version = updater.availableVersion {
                Button {
                    updater.openReleasesPage()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.down.circle.fill")
                            .font(.system(size: 11))
                        Text("Update available: v\(version)")
                            .font(.system(size: 11, weight: .medium))
                        Spacer()
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10).padding(.vertical, 7)
                    .frame(maxWidth: .infinity)
                    .background(Theme.accent, in: RoundedRectangle(cornerRadius: 7))
                }
                .buttonStyle(.plain)
            }

            // Day counter
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .lastTextBaseline, spacing: 4) {
                    Text("\(AppData.daysSinceStart.formatted())")
                        .font(.custom("Georgia", size: 20))
                        .foregroundStyle(Theme.accent)
                    Text("days")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Theme.ink.opacity(0.70))
                }
                Text("since 9 June 2022")
                    .font(.system(size: 10.5))
                    .italic()
                    .foregroundStyle(Theme.ink.opacity(0.55))
            }
            .padding(.horizontal, 12).padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
        }
        .padding([.horizontal, .bottom], 8)
    }
}
