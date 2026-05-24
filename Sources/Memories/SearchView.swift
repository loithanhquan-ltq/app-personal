import SwiftUI

struct SearchView: View {
    @Environment(AppState.self) private var state

    private var hits: [Memory] {
        AppData.search(state.searchQuery)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 4) {
                Text("\(hits.count) \(hits.count == 1 ? "result" : "results")".uppercased())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.ink3).tracking(1.4)
                (Text("Results for ") + Text("\"\(state.searchQuery)\"").italic().foregroundStyle(Theme.accent))
                    .font(.custom("Georgia", size: 36))
                    .foregroundStyle(Theme.ink).tracking(-0.6)
            }
            .padding(.bottom, 14)

            if hits.isEmpty {
                Text("Nothing yet. Try a year, a place, or a person.")
                    .font(.custom("Georgia", size: 16).italic())
                    .foregroundStyle(Theme.ink3)
                    .padding(.top, 40)
            } else {
                ForEach(hits) { m in
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
