import SwiftUI

struct DetailView: View {
    let memoryId: String
    @Environment(AppState.self) private var state

    private var memory: Memory? { AppData.memory(id: memoryId) }
    private var place:   Place?   { memory.flatMap { AppData.place(id: $0.place) } }
    private var chapter: Chapter? { memory.flatMap { AppData.chapter(id: $0.chapter) } }
    private var people:  [Person] { memory?.people.compactMap { AppData.person(id: $0) } ?? [] }

    private var related: [Memory] {
        guard let m = memory else { return [] }
        return AppData.memories.filter { $0.chapter == m.chapter && $0.id != m.id }.prefix(3).map { $0 }
    }

    private var prevMemory: Memory? {
        guard let m = memory,
              let idx = AppData.memories.firstIndex(where: { $0.id == m.id }),
              idx > 0 else { return nil }
        return AppData.memories[idx - 1]
    }

    private var nextMemory: Memory? {
        guard let m = memory,
              let idx = AppData.memories.firstIndex(where: { $0.id == m.id }),
              idx < AppData.memories.count - 1 else { return nil }
        return AppData.memories[idx + 1]
    }

    var body: some View {
        guard let m = memory else { return AnyView(EmptyView()) }
        return AnyView(
            VStack(alignment: .leading, spacing: 0) {
                // Back bar
                HStack(spacing: 6) {
                    Button { state.goBack() } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left").font(.system(size: 12, weight: .medium))
                            Text("Back")
                        }
                        .foregroundStyle(Theme.accent)
                        .font(.system(size: 13))
                    }
                    .buttonStyle(.plain)
                    Spacer()
                    Button { } label: {
                        Image(systemName: m.favorite ? "heart.fill" : "heart")
                            .foregroundStyle(m.favorite ? Theme.accent : Theme.ink3)
                    }
                    .buttonStyle(.plain)
                    Button { } label: { Image(systemName: "square.and.arrow.up").foregroundStyle(Theme.ink3) }
                        .buttonStyle(.plain)
                    Button { } label: { Image(systemName: "pencil").foregroundStyle(Theme.ink3) }
                        .buttonStyle(.plain)
                }
                .padding(.horizontal, 24).padding(.top, 6).padding(.bottom, 14)

                // Hero image slot
                ImageSlotView(
                    slotId: "hero-\(m.id)",
                    placeholder: "A photo from \(m.date)\u{A0}·\u{A0}\(place?.label ?? "")",
                    radius: 14
                )
                .frame(maxWidth: .infinity)
                .frame(height: 360)
                .padding(.horizontal, 36)

                // Article
                VStack(alignment: .leading, spacing: 0) {
                    Text("\(m.date) · \(place?.label ?? ""), \(place?.country ?? "")")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.ink3)
                        .textCase(.uppercase).tracking(1.4)
                        .padding(.bottom, 10)

                    Text(m.title)
                        .font(.custom("Georgia", size: 48).italic())
                        .foregroundStyle(Theme.ink)
                        .tracking(-1.4)
                        .lineSpacing(4)
                        .padding(.bottom, 22)

                    Text(m.body)
                        .font(.custom("Georgia", size: 19))
                        .foregroundStyle(Theme.ink)
                        .lineSpacing(8)

                    // Metadata strip
                    HStack(alignment: .top, spacing: 0) {
                        MetaBlock(label: "Chapter") {
                            if let ch = chapter { ChipView(text: ch.label, accent: true) }
                        }
                        MetaBlock(label: "Place") {
                            HStack(spacing: 4) {
                                Text(place?.label ?? "").font(.custom("Georgia", size: 15)).foregroundStyle(Theme.ink)
                                Text(place?.country ?? "").font(.system(size: 11)).foregroundStyle(Theme.ink3)
                            }
                        }
                        MetaBlock(label: "Tags") {
                            HStack(spacing: 5) {
                                ForEach(m.tags, id: \.self) { ChipView(text: $0) }
                            }
                        }
                    }
                    .padding(.vertical, 20)
                    .overlay(alignment: .top)    { Divider().background(Theme.rule) }
                    .overlay(alignment: .bottom) { Divider().background(Theme.rule) }
                    .padding(.top, 36)

                    // People
                    if !people.isEmpty {
                        Text("With".uppercased())
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(Theme.ink3).tracking(1.4)
                            .padding(.top, 26).padding(.bottom, 12)

                        HStack(spacing: 14) {
                            ForEach(Array(people.enumerated()), id: \.element.id) { i, p in
                                HStack(spacing: 9) {
                                    AvatarView(initials: p.initials,
                                               hue: Double((AppData.people.firstIndex(where: { $0.id == p.id }) ?? 0) * 53 + 20),
                                               size: 36)
                                    VStack(alignment: .leading, spacing: 1) {
                                        Text(p.name).font(.custom("Georgia", size: 15)).foregroundStyle(Theme.ink)
                                        Text(p.role.uppercased()).font(.system(size: 10.5)).foregroundStyle(Theme.ink3).tracking(0.8)
                                    }
                                }
                            }
                        }
                    }
                }
                .frame(maxWidth: 720)
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 24)
                .padding(.top, 32)

                // Related
                if !related.isEmpty {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("More from \(chapter?.label ?? "")")
                            .font(.custom("Georgia", size: 22))
                            .foregroundStyle(Theme.ink).tracking(-0.2)

                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 3), spacing: 14) {
                            ForEach(related) { r in
                                MemoryCardTile(memory: r) { state.openMemory(r.id) }
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 48)
                }

                // Prev / Next
                HStack(spacing: 14) {
                    NavCard(label: "Earlier", memory: prevMemory) { state.openMemory($0) }
                    NavCard(label: "Later",   memory: nextMemory) { state.openMemory($0) }
                }
                .padding(.horizontal, 24)
                .padding(.top, 36)
                .padding(.bottom, 80)
            }
        )
    }
}

private struct MetaBlock<Content: View>: View {
    let label: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.ink3).tracking(1.2)
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct NavCard: View {
    let label: String
    let memory: Memory?
    let onTap: (String) -> Void

    var body: some View {
        if let m = memory {
            Button { onTap(m.id) } label: {
                VStack(alignment: .leading, spacing: 6) {
                    Text("← \(label)".uppercased())
                        .font(.system(size: 10.5, design: .monospaced))
                        .foregroundStyle(Theme.ink3).tracking(1.2)
                    Text(m.title)
                        .font(.custom("Georgia", size: 18))
                        .foregroundStyle(Theme.ink).tracking(-0.2)
                    Text(m.date)
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.ink3)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.card)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.rule, lineWidth: 0.5))
            }
            .buttonStyle(.plain)
        } else {
            Color.clear.frame(maxWidth: .infinity)
        }
    }
}
