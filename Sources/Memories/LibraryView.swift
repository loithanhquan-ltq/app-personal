import SwiftUI

struct LibraryView: View {
    @Environment(AppState.self) private var state
    @State private var heartScale: CGFloat = 1.0

    private let days = AppData.daysSinceStart
    private let favorites = Array(AppData.favorites.prefix(4))
    private let anniversaries = AppData.anniversaries
    private let recent = Array(AppData.memories.sorted { $0.sortKey > $1.sortKey }.prefix(3))

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // ── Hero: day counter ──────────────────────────────
            HStack(alignment: .bottom, spacing: 32) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Since 9 June 2022 · \(AppData.memories.count) memories · written for you")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.ink3)
                        .textCase(.uppercase)
                        .tracking(1.4)

                    HStack(alignment: .firstTextBaseline, spacing: 0) {
                        Text("\(days.formatted())")
                            .font(.custom("Georgia", size: 62).italic())
                            .foregroundStyle(Theme.accent)
                            .scaleEffect(heartScale)
                            .animation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true),
                                       value: heartScale)
                        Text(" days,")
                            .font(.custom("Georgia", size: 62).italic())
                            .foregroundStyle(Theme.ink)
                        Text(" and counting.")
                            .font(.custom("Georgia", size: 62).italic())
                            .foregroundStyle(Theme.ink3)
                    }
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)

                    Text("A little notebook of us — kept here so I don't forget.")
                        .font(.custom("Georgia", size: 17).italic())
                        .foregroundStyle(Theme.ink2)
                }

                Spacer()

                // Years grid
                HStack(spacing: 8) {
                    ForEach([2022, 2023, 2024, 2025, 2026], id: \.self) { year in
                        let n = AppData.memories.filter { $0.year == year }.count
                        VStack(spacing: 2) {
                            Text("\(year)")
                                .font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(Theme.ink3)
                            Text("\(n)")
                                .font(.custom("Georgia", size: 22))
                                .foregroundStyle(Theme.ink)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 10)
                        .background(Theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.rule, lineWidth: 0.5))
                    }
                }
            }
            .padding(.bottom, 30)
            .onAppear { heartScale = 1.04 }

            // ── Where it began ─────────────────────────────────
            SectionBlock(title: "Where it began", subtitle: "9 June 2022") {
                if let dayOne = AppData.memory(id: "m01") {
                    Button { state.openMemory(dayOne.id) } label: {
                        HStack(spacing: 28) {
                            ImageSlotView(slotId: "hero-m01",
                                         placeholder: "A photo from 9 June 2022",
                                         radius: 10)
                            .frame(width: 320, height: 220)

                            VStack(alignment: .leading, spacing: 0) {
                                Text("Day 1 · \(dayOne.date)")
                                    .font(.system(size: 10.5, design: .monospaced))
                                    .foregroundStyle(Theme.ink3)
                                    .textCase(.uppercase).tracking(1.2)
                                Text(dayOne.title)
                                    .font(.custom("Georgia", size: 30).italic())
                                    .foregroundStyle(Theme.ink)
                                    .padding(.top, 8).padding(.bottom, 12)
                                Text(dayOne.body)
                                    .font(.custom("Georgia", size: 16))
                                    .foregroundStyle(Theme.ink2)
                                    .lineSpacing(5)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(22)
                        .background(Theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.rule, lineWidth: 0.5))
                    }
                    .buttonStyle(.plain)
                }
            }

            // ── Every June 9 ───────────────────────────────────
            SectionBlock(title: "Every June 9", subtitle: "The anniversaries") {
                HStack(spacing: 12) {
                    ForEach(Array(anniversaries.enumerated()), id: \.element.id) { i, m in
                        Button { state.openMemory(m.id) } label: {
                            VStack(alignment: .leading, spacing: 0) {
                                Text("YEAR \(i)")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundStyle(Color.black.opacity(0.45))
                                    .tracking(1)
                                Spacer()
                                Text(m.title)
                                    .font(.custom("Georgia", size: 20).italic())
                                    .foregroundStyle(Theme.ink)
                                    .lineLimit(2)
                                Text(m.date)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Theme.ink2)
                                    .padding(.top, 6)
                            }
                            .padding(18)
                            .frame(maxWidth: .infinity, minHeight: 130, alignment: .topLeading)
                            .background(
                                LinearGradient(
                                    colors: [
                                        Color(hue: (354 - Double(i) * 8) / 360, saturation: 0.28, brightness: 0.94),
                                        Color(hue: (340 - Double(i) * 12) / 360, saturation: 0.40, brightness: 0.88),
                                    ],
                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.black.opacity(0.06), lineWidth: 0.5))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // ── Favorites ──────────────────────────────────────
            SectionBlock(title: "Favorites", subtitle: "The ones you keep coming back to") {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 4), spacing: 14) {
                    ForEach(favorites) { m in
                        MemoryCardTile(memory: m) { state.openMemory(m.id) }
                    }
                }
            }

            // ── Chapters ───────────────────────────────────────
            SectionBlock(title: "Chapters", subtitle: "Browse by season") {
                HStack(spacing: 10) {
                    ForEach(AppData.chapters) { c in
                        Button { state.navigate(to: .chapter(c.id)) } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(c.span.uppercased())
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundStyle(Color.black.opacity(0.45))
                                    .tracking(0.8)
                                Text(c.label)
                                    .font(.custom("Georgia", size: 20).italic())
                                    .foregroundStyle(Theme.ink)
                                let n = AppData.memories(forChapter: c.id).count
                                Text("\(n) \(n == 1 ? "memory" : "memories")")
                                    .font(.system(size: 11))
                                    .foregroundStyle(Theme.ink3)
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Theme.chapterFill(hue: c.hue))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Theme.chapterDot(hue: c.hue).opacity(0.4), lineWidth: 0.5)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // ── Recently added ─────────────────────────────────
            SectionBlock(title: "Recently added") {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 3), spacing: 14) {
                    ForEach(recent) { m in
                        MemoryCardTile(memory: m) { state.openMemory(m.id) }
                    }
                }
            }
        }
        .padding(.horizontal, 36)
        .padding(.top, 20)
        .padding(.bottom, 60)
    }
}
