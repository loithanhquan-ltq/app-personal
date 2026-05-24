import SwiftUI
import Observation

enum SidebarItem: Hashable {
    case library
    case allMemories
    case letters
    case favorites
    case chapter(String)
    case atlas
    case people
}

@Observable
class AppState {
    var sidebarSelection: SidebarItem? = .library
    var detailMemoryId: String? = nil
    var searchQuery: String = ""

    var toolbarTitle: String {
        if !searchQuery.isEmpty { return "Search" }
        if let mid = detailMemoryId, let m = AppData.memory(id: mid) { return m.title }
        switch sidebarSelection {
        case .library:          return "Us"
        case .allMemories:      return "All memories"
        case .letters:          return "Letters"
        case .favorites:        return "Favorites"
        case .chapter(let id):  return AppData.chapter(id: id)?.label ?? "Chapter"
        case .atlas:            return "Atlas"
        case .people:           return "People"
        case nil:               return "Memories"
        }
    }

    func openMemory(_ id: String) {
        detailMemoryId = id
        searchQuery = ""
    }

    func goBack() {
        detailMemoryId = nil
    }

    func navigate(to item: SidebarItem) {
        sidebarSelection = item
        detailMemoryId = nil
        searchQuery = ""
    }
}
