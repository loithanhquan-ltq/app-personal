# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A native macOS SwiftUI app called **Memories** — a personal love-story scrapbook tracking a relationship from 9 June 2022 to today. Built with Swift Package Manager, no Xcode project required.

## Running the app

```bash
swift build          # compile
swift run            # build and launch
```

Requires macOS 14 (Sonoma) or later.

## Architecture

Swift Package Manager target: `Sources/Memories/`. All files in the same target, no imports needed between them.

| File | Purpose |
|---|---|
| `MemoriesApp.swift` | `@main` app entry, `WindowGroup` scene |
| `Models.swift` | Data structs: `Memory`, `Chapter`, `Person`, `Place`, `Letter` |
| `AppData.swift` | All content (memories, chapters, letters, places, people) + query helpers |
| `AppState.swift` | `@Observable` navigation state: sidebar selection, detail memory, search query |
| `Theme.swift` | `Theme` enum with warm paper palette colors (`bg`, `card`, `ink`, `accent`, etc.) |
| `ImageStore.swift` | Singleton that persists user-dropped photos to `~/Library/Application Support/Memories/Photos/` |
| `Components.swift` | Shared atoms: `PhotoPlaceholder`, `ImageSlotView`, `ChipView`, `AvatarView`, `MemoryCardTile`, `MemoryCardWide`, `SectionBlock` |
| `ContentView.swift` | `NavigationSplitView` root, `ViewTabPicker` toolbar centre, `MainContentView` router |
| `SidebarView.swift` | Sidebar list with sections (Library, Chapters, Atlas, People) + `DayCounterFooter` |
| `LibraryView.swift` | Home: animated day counter, "Where it began" hero, anniversaries strip, favorites, chapters, recent |
| `TimelineView.swift` | Year-grouped memory list; `filterChapter` + `favoritesOnly` params |
| `LettersView.swift` | Handwriting-styled love letters on simulated paper with wax seals |
| `AtlasView.swift` | `Canvas`-drawn abstract world map + place postcard grid |
| `PeopleView.swift` | "You" hero card + supporting cast grid |
| `DetailView.swift` | Full memory article with `ImageSlotView` hero, metadata, related, prev/next |
| `SearchView.swift` | Live search results powered by `AppData.search(_:)` |

## Navigation model

`AppState.sidebarSelection: SidebarItem?` drives the main view. `detailMemoryId: String?` overlays `DetailView`. `searchQuery: String` overrides everything with `SearchView`. The `.searchable` modifier on `NavigationSplitView` feeds `searchQuery`.

## Content

Edit `AppData.swift` to change memories, letters, chapters, places, or people. The `daysSinceStart` property auto-computes from `startDate = 2022-06-09`.

## Photos

`ImageSlotView(slotId:)` accepts drag-and-drop or click-to-pick images. They persist across launches in `Application Support/Memories/Photos/<slotId>.jpg`. Each memory's hero slot id is `"hero-<memoryId>"` (e.g. `"hero-m01"`).

## Design tokens

- Warm paper palette: `Theme.bg`, `Theme.card`, `Theme.ink`, `Theme.ink2`, `Theme.ink3`, `Theme.accent` (terracotta `#a44a2a`)
- Serif body: `Font.custom("Georgia", size:)`
- Handwriting: `Font.custom("Bradley Hand", size:)` for letters, `Font.custom("Snell Roundhand", size:)` for signatures
- Monospaced labels: `.font(.system(.caption2, design: .monospaced))`
