export type Language = "en" | "fr" | "vi";

export interface Chapter {
  id: string;
  label: string;
  span: string;
  hue: number;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface Place {
  id: string;
  label: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Memory {
  id: string;
  year: number;
  date: string;
  sortKey: string;
  chapterId: string;
  title: string;
  placeId: string;
  peopleIds: string[];
  tags: string[];
  body: string;
  favorite: boolean;
  photoCount?: number;
  hasAudio?: boolean;
}

export interface Letter {
  id: string;
  date: string;
  occasion: string;
  salutation: string;
  body: string;
  signature: string;
  signedName: string;
}

export interface Strings {
  appName: string;
  wordmark: string;

  sectionLibrary: string;
  sectionChapters: string;
  sectionAtlas: string;
  sectionPeople: string;
  sideAll: string;
  sideToday: string;
  sideLetters: string;
  sideFavorites: string;
  sidePlaces: string;
  sideEveryone: string;
  footerDays: string;
  footerSince: string;

  tabLibrary: string;
  tabTimeline: string;
  tabLetters: string;
  tabAtlas: string;
  tabPeople: string;
  searchPlaceholder: string;
  newMemory: string;

  libraryEyebrow: (n: number) => string;
  libraryHeadlineA: string;
  libraryHeadlineB: string;
  librarySubtitle: string;
  sectionWhereItBegan: string;
  dayOnePrefix: string;
  sectionAnniversaries: string;
  sectionAnniversariesSub: string;
  yearLabel: string;
  sectionChaptersTitle: string;
  sectionChaptersSub: string;
  memoriesCount: (n: number) => string;
  sectionRecent: string;
  sectionFavorites: string;
  sectionFavoritesSub: string;

  timelineAllRange: string;
  timelineAllTitle: string;

  back: string;
  metaChapter: string;
  metaPlace: string;
  metaTags: string;
  withPeople: string;
  moreFrom: string;
  earlier: string;
  later: string;

  peopleEyebrow: string;
  peopleHeadline: string;
  peopleSubtitle: string;
  peopleInAll: (inMemories: number, total: number) => string;
  peopleAlsoIn: string;
  peopleMentioned: string;

  atlasEyebrow: (places: number, memories: number) => string;
  atlasHeadline: string;
  atlasSubtitle: string;

  lettersEyebrow: (n: number) => string;
  lettersHeadline: string;
  lettersSubtitle: string;
  lettersWriteAnother: string;
  waxSeal: string;

  searchResults: (n: number) => string;
  searchResultsFor: (q: string) => string;
  searchEmpty: string;

  onThisDayLabel: string;
  onThisDayYearsAgo: (n: number) => string;

  reactionConnectPrompt: string;

  sectionReflections: string;
  sideStats: string;
  sideAnniversaryCard: string;
  sideAnniversary: string;

  statsHeadline: string;
  statsEyebrow: string;
  statsMemoriesPerMonth: string;
  statsTopPlaces: string;
  statsTopPeople: string;
  statsTitleCloud: string;
  statsPhotoCollage: string;

  cardPickMemory: string;
  cardCustomMessage: string;
  cardDownload: string;
  cardPreview: string;
  cardPlaceholder: string;
  cardTemplateMinimal: string;
  cardTemplatePhotoHeavy: string;
  cardTemplateQuote: string;
}

export interface Content {
  lang: Language;
  strings: Strings;
  chapters: Chapter[];
  people: Person[];
  places: Place[];
  memories: Memory[];
  letters: Letter[];
}
