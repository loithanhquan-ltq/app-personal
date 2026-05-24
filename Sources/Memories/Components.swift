import SwiftUI
import UniformTypeIdentifiers

// MARK: - Shared helpers

private func hashSeed(_ s: String) -> UInt32 {
    var h: UInt32 = 2166136261
    for c in s.unicodeScalars { h ^= UInt32(c.value); h = h &* 16777619 }
    return h
}

// MARK: - PhotoPlaceholder

struct PhotoPlaceholder: View {
    let seed: String
    var height: CGFloat = 180
    var radius: CGFloat = 8
    var label: String? = nil

    private var hue: Double { Double(hashSeed(seed) % 360) / 360.0 }

    var body: some View {
        ZStack {
            LinearGradient(
                stops: [
                    .init(color: Color(hue: hue, saturation: 0.22, brightness: 0.88), location: 0.0),
                    .init(color: Color(hue: hue, saturation: 0.28, brightness: 0.80), location: 0.35),
                    .init(color: Color(hue: hue, saturation: 0.18, brightness: 0.93), location: 0.68),
                    .init(color: Color(hue: hue, saturation: 0.22, brightness: 0.86), location: 1.0),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            RadialGradient(gradient: Gradient(colors: [.clear, Color.black.opacity(0.07)]),
                           center: .center, startRadius: 40, endRadius: 200)
                .blendMode(.multiply)
            if let label {
                VStack {
                    Spacer()
                    HStack {
                        Text(label)
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(Color.black.opacity(0.50))
                            .padding(.horizontal, 7).padding(.vertical, 3)
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 4))
                            .padding(8)
                        Spacer()
                    }
                }
            }
        }
        .frame(maxWidth: .infinity).frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: radius))
        .overlay(RoundedRectangle(cornerRadius: radius).stroke(Color.black.opacity(0.06), lineWidth: 0.5))
    }
}

// MARK: - ImageSlotView

struct ImageSlotView: View {
    let slotId: String
    var placeholder: String = "Drop a photo"
    var radius: CGFloat = 12

    @ObservedObject private var store = ImageStore.shared
    @State private var isTargeted = false
    @State private var showPicker = false

    var body: some View {
        ZStack {
            if let img = store.load(id: slotId) {
                Image(nsImage: img)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .clipped()
            } else {
                emptySlot
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: radius))
        .overlay(
            RoundedRectangle(cornerRadius: radius)
                .stroke(isTargeted ? Theme.accent : Color.black.opacity(0.15),
                        style: StrokeStyle(lineWidth: isTargeted ? 2 : 1, dash: isTargeted ? [] : [5, 4]))
        )
        .contentShape(Rectangle())
        .onTapGesture { if store.load(id: slotId) == nil { showPicker = true } }
        .onDrop(of: [UTType.image.identifier, UTType.fileURL.identifier],
                isTargeted: $isTargeted) { providers in
            for p in providers {
                if p.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
                    p.loadDataRepresentation(forTypeIdentifier: UTType.image.identifier) { data, _ in
                        guard let data, let img = NSImage(data: data) else { return }
                        ImageStore.shared.save(id: slotId, image: img)
                    }
                    return true
                }
                if p.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
                    p.loadItem(forTypeIdentifier: UTType.fileURL.identifier) { item, _ in
                        guard let data = item as? Data,
                              let url = URL(dataRepresentation: data, relativeTo: nil),
                              let img = NSImage(contentsOf: url) else { return }
                        ImageStore.shared.save(id: slotId, image: img)
                    }
                    return true
                }
            }
            return false
        }
        .fileImporter(isPresented: $showPicker, allowedContentTypes: [.image]) { result in
            if case .success(let url) = result {
                _ = url.startAccessingSecurityScopedResource()
                if let img = NSImage(contentsOf: url) { store.save(id: slotId, image: img) }
                url.stopAccessingSecurityScopedResource()
            }
        }
        .contextMenu {
            if store.load(id: slotId) != nil {
                Button("Replace photo…") { showPicker = true }
                Button("Remove photo", role: .destructive) { store.remove(id: slotId) }
            } else {
                Button("Choose photo…") { showPicker = true }
            }
        }
    }

    private var emptySlot: some View {
        ZStack {
            Color.black.opacity(0.04)
            VStack(spacing: 6) {
                Image(systemName: "photo").font(.system(size: 22)).foregroundStyle(Color.black.opacity(0.25))
                Text(placeholder).font(.system(size: 11.5, weight: .medium)).foregroundStyle(Color.black.opacity(0.35))
                Text("click or drop a photo").font(.system(size: 10)).foregroundStyle(Color.black.opacity(0.25))
            }
        }
    }
}

// MARK: - ChipView

struct ChipView: View {
    let text: String
    var accent: Bool = false

    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .medium))
            .foregroundStyle(accent ? Theme.accent : Theme.ink2)
            .padding(.horizontal, 9).padding(.vertical, 3)
            .background(
                RoundedRectangle(cornerRadius: 999)
                    .fill(accent ? Theme.accent.opacity(0.10) : Theme.ink.opacity(0.05))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 999)
                    .stroke(accent ? Theme.accent.opacity(0.25) : Theme.ink.opacity(0.08), lineWidth: 0.5)
            )
    }
}

// MARK: - AvatarView

struct AvatarView: View {
    let initials: String
    var hue: Double = 30
    var size: CGFloat = 32

    var body: some View {
        ZStack {
            Circle().fill(LinearGradient(
                colors: [
                    Color(hue: hue / 360, saturation: 0.30, brightness: 0.86),
                    Color(hue: ((hue + 40).truncatingRemainder(dividingBy: 360)) / 360,
                          saturation: 0.40, brightness: 0.72),
                ],
                startPoint: .topLeading, endPoint: .bottomTrailing))
            Text(initials)
                .font(.system(size: size * 0.36, weight: .semibold))
                .foregroundStyle(Color.black.opacity(0.65))
        }
        .frame(width: size, height: size)
        .overlay(Circle().stroke(Color.black.opacity(0.1), lineWidth: 0.5))
        .shadow(color: .black.opacity(0.06), radius: 1, y: 1)
    }
}

// MARK: - SectionBlock

struct SectionBlock<Content: View>: View {
    let title: String
    var subtitle: String? = nil
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Text(title)
                    .font(.custom("Georgia", size: 22))
                    .foregroundStyle(Theme.ink)
                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.ink3)
                }
                Spacer()
            }
            .padding(.bottom, 14)
            content()
        }
        .padding(.bottom, 32)
    }
}

// MARK: - MemoryCardTile

struct MemoryCardTile: View {
    let memory: Memory
    var onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                PhotoPlaceholder(seed: memory.id, height: 130, radius: 6,
                                 label: "PHOTO · \(memory.date)")
                VStack(alignment: .leading, spacing: 4) {
                    Text(memory.title)
                        .font(.custom("Georgia", size: 16))
                        .foregroundStyle(Theme.ink)
                        .lineLimit(2)
                    Text("\(memory.date) · \(AppData.place(id: memory.place)?.label ?? "")")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.ink3)
                }
                .padding(.horizontal, 4).padding(.top, 10).padding(.bottom, 2)
            }
            .padding(10)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.rule, lineWidth: 0.5))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - MemoryCardWide

struct MemoryCardWide: View {
    let memory: Memory
    var onTap: () -> Void
    @State private var hovering = false

    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: 22) {
                PhotoPlaceholder(seed: memory.id, height: 150, radius: 8,
                                 label: "PHOTO · \(memory.date.lowercased())")
                    .frame(width: 220)

                VStack(alignment: .leading, spacing: 0) {
                    Text("\(memory.date) · \(AppData.place(id: memory.place)?.label ?? "")\(memory.favorite ? " · ★" : "")")
                        .font(.system(size: 10.5, design: .monospaced))
                        .foregroundStyle(Theme.ink3)
                        .textCase(.uppercase)
                        .tracking(1)

                    Text(memory.title)
                        .font(.custom("Georgia", size: 24))
                        .foregroundStyle(Theme.ink)
                        .lineSpacing(3)
                        .padding(.top, 6).padding(.bottom, 8)

                    Text(memory.body)
                        .font(.custom("Georgia", size: 15))
                        .foregroundStyle(Theme.ink2)
                        .lineSpacing(4)
                        .lineLimit(3)

                    HStack(spacing: 6) {
                        if let ch = AppData.chapter(id: memory.chapter) {
                            ChipView(text: ch.label, accent: true)
                        }
                        ForEach(memory.tags, id: \.self) { ChipView(text: $0) }
                    }
                    .padding(.top, 10)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 16).padding(.vertical, 18)
            .background(hovering ? Theme.ink.opacity(0.025) : .clear)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .onHover { hovering = $0 }
    }
}
