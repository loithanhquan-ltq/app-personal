// Models.swift

import Foundation

enum Language: String, CaseIterable, Identifiable {
  case en, fr, vi
  var id: String { rawValue }
  var label: String {
    switch self { case .en: "EN"; case .fr: "FR"; case .vi: "VI" }
  }
  var locale: Locale {
    switch self {
    case .en: Locale(identifier: "en_US")
    case .fr: Locale(identifier: "fr_FR")
    case .vi: Locale(identifier: "vi_VN")
    }
  }
}

struct Chapter: Identifiable, Hashable {
  let id: String
  let label: String
  let span: String
  let hue: Double
}

struct Person: Identifiable, Hashable {
  let id: String
  let name: String
  let role: String
  let initials: String
}

struct Place: Identifiable, Hashable {
  let id: String
  let label: String
  let country: String
  let lat: Double
  let lng: Double
}

struct Memory: Identifiable, Hashable {
  let id: String
  let year: Int
  let date: String
  let sortKey: String
  let chapterId: String
  let title: String
  let placeId: String
  let peopleIds: [String]
  let tags: [String]
  let body: String
  let favorite: Bool
}

struct Letter: Identifiable, Hashable {
  let id: String
  let date: String
  let occasion: String
  let salutation: String
  let body: String
  let signature: String
  let signedName: String
}

struct Strings {
  let appName: String
  let wordmark: String

  let sectionLibrary: String
  let sectionChapters: String
  let sectionAtlas: String
  let sectionPeople: String
  let sideAll: String
  let sideToday: String
  let sideLetters: String
  let sideFavorites: String
  let sidePlaces: String
  let sideEveryone: String
  let footerDays: String
  let footerSince: String

  let tabLibrary: String
  let tabTimeline: String
  let tabLetters: String
  let tabAtlas: String
  let tabPeople: String
  let searchPlaceholder: String
  let newMemory: String

  let libraryEyebrow: (Int) -> String
  let libraryHeadlineA: String
  let libraryHeadlineB: String
  let librarySubtitle: String
  let sectionWhereItBegan: String
  let dayOnePrefix: String
  let sectionAnniversaries: String
  let sectionAnniversariesSub: String
  let yearLabel: String
  let sectionChaptersTitle: String
  let sectionChaptersSub: String
  let memoriesCount: (Int) -> String
  let sectionRecent: String
  let sectionFavorites: String
  let sectionFavoritesSub: String

  let timelineAllRange: String
  let timelineAllTitle: String

  let back: String
  let metaChapter: String
  let metaPlace: String
  let metaTags: String
  let withPeople: String
  let moreFrom: String
  let earlier: String
  let later: String

  let peopleEyebrow: String
  let peopleHeadline: String
  let peopleSubtitle: String
  let peopleInAll: (Int, Int) -> String
  let peopleAlsoIn: String
  let peopleMentioned: String

  let atlasEyebrow: (Int, Int) -> String
  let atlasHeadline: String
  let atlasSubtitle: String

  let lettersEyebrow: (Int) -> String
  let lettersHeadline: String
  let lettersSubtitle: String
  let lettersWriteAnother: String
  let waxSeal: String

  let searchResults: (Int) -> String
  let searchResultsFor: (String) -> String
  let searchEmpty: String
}
