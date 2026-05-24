// SearchView.swift — live filter results.

import SwiftUI

struct SearchResultsView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    let q = state.query.lowercased().trim()
    let hits: [Memory] = state.content.memories.filter { m in
      if q == "favorite" { return m.favorite }
      return m.title.lowercased().contains(q)
        || m.body.lowercased().contains(q)
        || m.tags.contains(where: { $0.contains(q) })
        || (state.content.place(m.placeId)?.label.lowercased().contains(q) ?? false)
    }

    ScrollView {
      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: 8) {
          Text(s.searchResults(hits.count).uppercased())
            .font(Theme.mono(11, weight: .medium))
            .tracking(1.4)
            .foregroundStyle(Theme.ink3)
          Text(s.searchResultsFor(state.query.trim()))
            .font(Theme.serif(36, weight: .regular))
            .foregroundStyle(Theme.ink)
            .tracking(-0.6)
        }
        .padding(.top, 6)
        .padding(.bottom, 14)

        if hits.isEmpty {
          Text(s.searchEmpty)
            .font(Theme.serif(15, italic: true))
            .foregroundStyle(Theme.ink3)
            .padding(40)
        } else {
          ForEach(hits) { m in MemoryWideCard(memory: m) }
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
