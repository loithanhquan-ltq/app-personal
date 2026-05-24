import SwiftUI

struct TimelineView: View {
    @Environment(AppState.self) private var state
    var filterChapter: String? = nil
    var favoritesOnly: Bool = false

    private var memories: [Memory] {
        var list = filterChapter != nil
            ? AppData.memories(forChapter: filterChapter!)
            : AppData.memories
        if favoritesOnly { list = list.filter { $0.favorite } }
        return list.sorted { $0.sortKey < $1.sortKey }
    }

    private var byYear: [(year: Int, memories: [Memory])] {
        Dictionary(grouping: memories, by: \.year)
            .sorted { $0.key < $1.key }
            .map { (year: $0.key, memories: $0.value) }
    }

    private var heading: String {
        if favoritesOnly { return "Favorites" }
        if let id = filterChapter { return AppData.chapter(id: id)?.label ?? "Chapter" }
        return "Timeline"
    }

    private var subheading: String {
        if let id = filterChapter { return AppData.chapter(id: id)?.span ?? "" }
        return "Everything · June 2022 – today"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 4) {
                Text(subheading.uppercased())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.ink3)
                    .tracking(1.4)
                Text(heading)
                    .font(.custom("Georgia", size: 44))
                    .foregroundStyle(Theme.ink)
                    .tracking(-1)
                Text("\(memories.count) \(memories.count == 1 ? "memory" : "memories")")
                    .font(.custom("Georgia", size: 15).italic())
                    .foregroundStyle(Theme.ink3)
            }
            .padding(.bottom, 12)

            // Year groups
            ForEach(byYear, id: \.year) { group in
                YearMarkView(year: group.year)
                ForEach(group.memories) { m in
                    MemoryCardWide(memory: m) { state.openMemory(m.id) }
                    Divider().background(Theme.rule).padding(.horizontal, 16)
                }
            }
        }
        .padding(.horizontal, 36)
        .padding(.top, 18)
        .padding(.bottom, 80)
    }
}

struct YearMarkView: View {
    let year: Int

    var body: some View {
        HStack(alignment: .lastTextBaseline, spacing: 14) {
            Text("\(year)")
                .font(.custom("Georgia", size: 44))
                .foregroundStyle(Theme.ink)
                .fontDesign(.serif)
                .tracking(-1)
            Rectangle()
                .fill(Theme.rule)
                .frame(maxWidth: .infinity, maxHeight: 1)
        }
        .padding(.vertical, 24)
    }
}
