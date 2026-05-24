// AppData.swift — Content struct + Datasets (EN / FR / VI).

import Foundation

struct Content {
  let lang: Language
  let strings: Strings
  let chapters: [Chapter]
  let people: [Person]
  let places: [Place]
  let memories: [Memory]
  let letters: [Letter]

  static let startDate: Date = {
    var c = DateComponents(); c.year = 2022; c.month = 6; c.day = 9
    return Calendar(identifier: .gregorian).date(from: c)!
  }()

  func daysSinceStart(now: Date = .now) -> Int {
    max(0, Calendar.current.dateComponents([.day], from: Self.startDate, to: now).day ?? 0)
  }

  func chapter(_ id: String) -> Chapter? { chapters.first { $0.id == id } }
  func place(_ id: String)   -> Place?   { places.first   { $0.id == id } }
  func person(_ id: String)  -> Person?  { people.first   { $0.id == id } }
  func memory(_ id: String)  -> Memory?  { memories.first { $0.id == id } }
}

enum Datasets {
  static func content(for lang: Language) -> Content {
    switch lang {
    case .en: english
    case .fr: french
    case .vi: vietnamese
    }
  }

  // ───── English ─────
  static let english = Content(
    lang: .en,
    strings: Strings(
      appName: "Memories",
      wordmark: "Us",
      sectionLibrary: "Library", sectionChapters: "Chapters", sectionAtlas: "Atlas", sectionPeople: "People",
      sideAll: "All memories", sideToday: "Today", sideLetters: "Letters", sideFavorites: "Favorites",
      sidePlaces: "Places we've been", sideEveryone: "You & the cast",
      footerDays: "days", footerSince: "since 9 June 2022",
      tabLibrary: "Library", tabTimeline: "Timeline", tabLetters: "Letters", tabAtlas: "Atlas", tabPeople: "People",
      searchPlaceholder: "Search memories", newMemory: "New memory",
      libraryEyebrow: { "Since 9 June 2022 · \($0) memories · written for you" },
      libraryHeadlineA: "days,", libraryHeadlineB: " and counting.",
      librarySubtitle: "A little notebook of us — kept here so I don't forget.",
      sectionWhereItBegan: "Where it began", dayOnePrefix: "Day 1",
      sectionAnniversaries: "Every June 9", sectionAnniversariesSub: "The anniversaries",
      yearLabel: "YEAR",
      sectionChaptersTitle: "Chapters", sectionChaptersSub: "Browse by season",
      memoriesCount: { $0 == 1 ? "1 memory" : "\($0) memories" },
      sectionRecent: "Recently added",
      sectionFavorites: "Favorites", sectionFavoritesSub: "The ones I keep coming back to",
      timelineAllRange: "Everything · June 2022 – today", timelineAllTitle: "Timeline",
      back: "Back", metaChapter: "Chapter", metaPlace: "Place", metaTags: "Tags",
      withPeople: "With", moreFrom: "More from", earlier: "Earlier", later: "Later",
      peopleEyebrow: "Mostly you", peopleHeadline: "The cast",
      peopleSubtitle: "A love story is mostly two people. The others were there too.",
      peopleInAll: { "In \($0) of \($1) memories — which is to say, in every one of them." },
      peopleAlsoIn: "Also in the story", peopleMentioned: "mentioned in passing",
      atlasEyebrow: { "\($0) places · \($1) memories" }, atlasHeadline: "Atlas",
      atlasSubtitle: "Every place that stayed with us.",
      lettersEyebrow: { "\($0) letters · for you only" },
      lettersHeadline: "Letters to you",
      lettersSubtitle: "A drawer of things I wanted to say out loud and almost did. One letter for every chapter that mattered. More coming.",
      lettersWriteAnother: "Write another letter", waxSeal: "us",
      searchResults: { $0 == 1 ? "1 result" : "\($0) results" },
      searchResultsFor: { "Results for \"\($0)\"" },
      searchEmpty: "Nothing yet. Try a year, a place, or a person."
    ),
    chapters: [
      .init(id: "beginning", label: "Beginning",   span: "June – Aug 2022",        hue: 18),
      .init(id: "falling",   label: "Falling",     span: "Sep 2022 – May 2023",    hue: 354),
      .init(id: "building",  label: "Building",    span: "Jun 2023 – May 2024",    hue: 330),
      .init(id: "staying",   label: "Staying",     span: "Jun 2024 – May 2025",    hue: 280),
      .init(id: "now",       label: "Settling In", span: "Jun 2025 – Now",         hue: 220),
    ],
    people: [
      .init(id: "you",     name: "You",          role: "the one this is for", initials: "♥"),
      .init(id: "yourmom", name: "Your mom",     role: "family",  initials: "YM"),
      .init(id: "yourdad", name: "Your dad",     role: "family",  initials: "YD"),
      .init(id: "friend",  name: "My oldest friend", role: "witness", initials: "OF"),
    ],
    places: [
      .init(id: "home",    label: "Ho Chi Minh City", country: "where it all began", lat: 10.78, lng: 106.70),
      .init(id: "cafe",    label: "Ho Chi Minh City", country: "where it all began", lat: 10.78, lng: 106.70),
      .init(id: "dalat",   label: "Đà Lạt",           country: "the highlands",      lat: 11.94, lng: 108.43),
      .init(id: "hoian",   label: "Nha Trang",         country: "the sea",            lat: 12.24, lng: 109.19),
      .init(id: "parents", label: "Bảo Lộc",           country: "the pine town",      lat: 11.54, lng: 107.81),
      .init(id: "apt",     label: "Bạc Liêu",          country: "the south",          lat:  9.28, lng: 105.72),
    ],
    memories: enMemories,
    letters: enLetters
  )

  // ───── French ─────
  static let french = Content(
    lang: .fr,
    strings: Strings(
      appName: "Souvenirs", wordmark: "Nous",
      sectionLibrary: "Bibliothèque", sectionChapters: "Chapitres", sectionAtlas: "Atlas", sectionPeople: "Personnes",
      sideAll: "Tous les souvenirs", sideToday: "Aujourd'hui", sideLetters: "Lettres", sideFavorites: "Favoris",
      sidePlaces: "Les lieux", sideEveryone: "Toi & les autres",
      footerDays: "jours", footerSince: "depuis le 9 juin 2022",
      tabLibrary: "Bibliothèque", tabTimeline: "Chronologie", tabLetters: "Lettres", tabAtlas: "Atlas", tabPeople: "Les nôtres",
      searchPlaceholder: "Rechercher", newMemory: "Nouveau souvenir",
      libraryEyebrow: { "Depuis le 9 juin 2022 · \($0) souvenirs · écrits pour toi" },
      libraryHeadlineA: "jours,", libraryHeadlineB: " et ça continue.",
      librarySubtitle: "Un petit carnet de nous — gardé ici pour ne pas oublier.",
      sectionWhereItBegan: "Où tout a commencé", dayOnePrefix: "Jour 1",
      sectionAnniversaries: "Chaque 9 juin", sectionAnniversariesSub: "Les anniversaires",
      yearLabel: "AN",
      sectionChaptersTitle: "Chapitres", sectionChaptersSub: "Par saison",
      memoriesCount: { $0 == 1 ? "1 souvenir" : "\($0) souvenirs" },
      sectionRecent: "Récents",
      sectionFavorites: "Favoris", sectionFavoritesSub: "Ceux que je reviens visiter",
      timelineAllRange: "Tout · juin 2022 – aujourd'hui", timelineAllTitle: "Chronologie",
      back: "Retour", metaChapter: "Chapitre", metaPlace: "Lieu", metaTags: "Étiquettes",
      withPeople: "Avec", moreFrom: "Plus de", earlier: "Avant", later: "Après",
      peopleEyebrow: "Surtout toi", peopleHeadline: "Les nôtres",
      peopleSubtitle: "Une histoire d'amour, c'est surtout deux personnes. Les autres étaient là aussi.",
      peopleInAll: { "Dans \($0) souvenirs sur \($1) — c'est-à-dire, dans chacun d'eux." },
      peopleAlsoIn: "Aussi dans l'histoire", peopleMentioned: "mentionné en passant",
      atlasEyebrow: { "\($0) lieux · \($1) souvenirs" }, atlasHeadline: "Atlas",
      atlasSubtitle: "Chaque lieu qui est resté en nous.",
      lettersEyebrow: { "\($0) lettres · pour toi seule" },
      lettersHeadline: "Lettres à toi",
      lettersSubtitle: "Un tiroir de choses que je voulais dire à voix haute et que j'ai presque dites. Une lettre pour chaque chapitre qui comptait.",
      lettersWriteAnother: "Écrire une autre lettre", waxSeal: "nous",
      searchResults: { $0 == 1 ? "1 résultat" : "\($0) résultats" },
      searchResultsFor: { "Résultats pour « \($0) »" },
      searchEmpty: "Rien pour l'instant. Essaie une année, un lieu ou une personne."
    ),
    chapters: [
      .init(id: "beginning", label: "Le début",   span: "Juin – août 2022",          hue: 18),
      .init(id: "falling",   label: "Tomber",     span: "Sept 2022 – mai 2023",      hue: 354),
      .init(id: "building",  label: "Construire", span: "Juin 2023 – mai 2024",      hue: 330),
      .init(id: "staying",   label: "Rester",     span: "Juin 2024 – mai 2025",      hue: 280),
      .init(id: "now",       label: "Maintenant", span: "Juin 2025 – aujourd'hui",   hue: 220),
    ],
    people: [
      .init(id: "you",     name: "Toi",                 role: "celle à qui tout ceci s'adresse", initials: "♥"),
      .init(id: "yourmom", name: "Ta mère",             role: "famille", initials: "TM"),
      .init(id: "yourdad", name: "Ton père",            role: "famille", initials: "TP"),
      .init(id: "friend",  name: "Mon plus vieil ami",  role: "témoin",  initials: "PV"),
    ],
    places: [
      .init(id: "home",    label: "Hô-Chi-Minh-Ville", country: "là où tout a commencé",  lat: 10.78, lng: 106.70),
      .init(id: "cafe",    label: "Hô-Chi-Minh-Ville", country: "là où tout a commencé",  lat: 10.78, lng: 106.70),
      .init(id: "dalat",   label: "Đà Lạt",             country: "les hauts plateaux",     lat: 11.94, lng: 108.43),
      .init(id: "hoian",   label: "Nha Trang",           country: "la mer",                 lat: 12.24, lng: 109.19),
      .init(id: "parents", label: "Bảo Lộc",             country: "la ville des pins",      lat: 11.54, lng: 107.81),
      .init(id: "apt",     label: "Bạc Liêu",            country: "le sud",                 lat:  9.28, lng: 105.72),
    ],
    memories: frMemories,
    letters: frLetters
  )

  // ───── Vietnamese ─────
  static let vietnamese = Content(
    lang: .vi,
    strings: Strings(
      appName: "Kỷ niệm", wordmark: "Mình",
      sectionLibrary: "Thư viện", sectionChapters: "Chương", sectionAtlas: "Bản đồ", sectionPeople: "Mọi người",
      sideAll: "Tất cả kỷ niệm", sideToday: "Hôm nay", sideLetters: "Lá thư", sideFavorites: "Yêu thích",
      sidePlaces: "Những nơi đã đến", sideEveryone: "Em & mọi người",
      footerDays: "ngày", footerSince: "từ 9 tháng 6, 2022",
      tabLibrary: "Thư viện", tabTimeline: "Dòng thời gian", tabLetters: "Lá thư", tabAtlas: "Bản đồ", tabPeople: "Mọi người",
      searchPlaceholder: "Tìm kiếm", newMemory: "Kỷ niệm mới",
      libraryEyebrow: { "Từ 9 tháng 6, 2022 · \($0) kỷ niệm · viết cho em" },
      libraryHeadlineA: "ngày,", libraryHeadlineB: " và vẫn còn tiếp.",
      librarySubtitle: "Một cuốn sổ nhỏ của mình — giữ ở đây để khỏi quên.",
      sectionWhereItBegan: "Nơi mọi thứ bắt đầu", dayOnePrefix: "Ngày 1",
      sectionAnniversaries: "Mỗi 9 tháng 6", sectionAnniversariesSub: "Những lần kỷ niệm",
      yearLabel: "NĂM",
      sectionChaptersTitle: "Chương", sectionChaptersSub: "Theo mùa",
      memoriesCount: { "\($0) kỷ niệm" },
      sectionRecent: "Mới thêm",
      sectionFavorites: "Yêu thích", sectionFavoritesSub: "Những điều anh thường quay lại",
      timelineAllRange: "Tất cả · tháng 6, 2022 – hôm nay", timelineAllTitle: "Dòng thời gian",
      back: "Quay lại", metaChapter: "Chương", metaPlace: "Nơi", metaTags: "Thẻ",
      withPeople: "Cùng với", moreFrom: "Thêm từ", earlier: "Trước", later: "Sau",
      peopleEyebrow: "Chủ yếu là em", peopleHeadline: "Mọi người",
      peopleSubtitle: "Một chuyện tình chủ yếu là hai người. Những người khác cũng có ở đó.",
      peopleInAll: { "Trong \($0) trên \($1) kỷ niệm — nghĩa là, trong từng cái một." },
      peopleAlsoIn: "Cũng có trong câu chuyện", peopleMentioned: "có nhắc đến thoáng qua",
      atlasEyebrow: { "\($0) nơi · \($1) kỷ niệm" }, atlasHeadline: "Bản đồ",
      atlasSubtitle: "Mọi nơi vẫn còn trong mình.",
      lettersEyebrow: { "\($0) lá thư · chỉ dành cho em" },
      lettersHeadline: "Thư gửi em",
      lettersSubtitle: "Một ngăn kéo những điều anh muốn nói ra tiếng và đã suýt nói. Một lá thư cho mỗi chương quan trọng.",
      lettersWriteAnother: "Viết một lá thư nữa", waxSeal: "mình",
      searchResults: { "\($0) kết quả" },
      searchResultsFor: { "Kết quả cho « \($0) »" },
      searchEmpty: "Chưa có gì. Thử một năm, một nơi, hoặc một người."
    ),
    chapters: [
      .init(id: "beginning", label: "Khởi đầu",   span: "Tháng 6 – tháng 8, 2022",        hue: 18),
      .init(id: "falling",   label: "Đang yêu",   span: "Tháng 9, 2022 – tháng 5, 2023",  hue: 354),
      .init(id: "building",  label: "Vun đắp",    span: "Tháng 6, 2023 – tháng 5, 2024",  hue: 330),
      .init(id: "staying",   label: "Ở lại",      span: "Tháng 6, 2024 – tháng 5, 2025",  hue: 280),
      .init(id: "now",       label: "Bây giờ",    span: "Tháng 6, 2025 – hôm nay",        hue: 220),
    ],
    people: [
      .init(id: "you",     name: "Em",                          role: "người mà tất cả điều này dành cho", initials: "♥"),
      .init(id: "yourmom", name: "Mẹ em",                       role: "gia đình", initials: "ME"),
      .init(id: "yourdad", name: "Bố em",                       role: "gia đình", initials: "BO"),
      .init(id: "friend",  name: "Bạn thân nhất của anh",       role: "chứng nhân", initials: "BT"),
    ],
    places: [
      .init(id: "home",    label: "Hồ Chí Minh",   country: "nơi tất cả bắt đầu", lat: 10.78, lng: 106.70),
      .init(id: "cafe",    label: "Hồ Chí Minh",   country: "nơi tất cả bắt đầu", lat: 10.78, lng: 106.70),
      .init(id: "dalat",   label: "Đà Lạt",         country: "cao nguyên",          lat: 11.94, lng: 108.43),
      .init(id: "hoian",   label: "Nha Trang",       country: "biển xanh",           lat: 12.24, lng: 109.19),
      .init(id: "parents", label: "Bảo Lộc",         country: "thành phố thông",     lat: 11.54, lng: 107.81),
      .init(id: "apt",     label: "Bạc Liêu",        country: "miền Nam",            lat:  9.28, lng: 105.72),
    ],
    memories: viMemories,
    letters: viLetters
  )
}
