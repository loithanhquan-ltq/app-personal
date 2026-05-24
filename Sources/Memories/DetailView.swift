// DetailView.swift — single memory article.

import SwiftUI

struct DetailView: View {
  let memoryId: String
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    guard let m = state.content.memory(memoryId) else {
      return AnyView(Text("Not found"))
    }
    let place = state.content.place(m.placeId)
    let chapter = state.content.chapter(m.chapterId)
    let people = m.peopleIds.compactMap { state.content.person($0) }
    let idx = state.content.memories.firstIndex { $0.id == m.id } ?? 0
    let prev = idx > 0 ? state.content.memories[idx - 1] : nil
    let next = idx < state.content.memories.count - 1 ? state.content.memories[idx + 1] : nil
    let related = state.content.memories.filter { $0.chapterId == m.chapterId && $0.id != m.id }.prefix(3)

    return AnyView(
      ScrollView {
        VStack(alignment: .leading, spacing: 0) {
          // Back bar
          HStack {
            Button { state.route = .timeline } label: {
              HStack(spacing: 4) {
                Image(systemName: "chevron.left").font(.system(size: 11, weight: .semibold))
                Text(s.back).font(Theme.sans(13))
              }
              .foregroundStyle(Theme.accent)
              .padding(.horizontal, 6).padding(.vertical, 4)
            }
            .buttonStyle(.plain)
            Spacer()
            iconBtn("heart\(m.favorite ? ".fill" : "")", accent: m.favorite)
            iconBtn("square.and.arrow.up")
            iconBtn("pencil")
          }
          .padding(.horizontal, 24)
          .padding(.bottom, 14)

          // Hero
          PhotoSlot(id: "hero-\(m.id)",
                    placeholder: "photo · \(m.date) · \(place?.label ?? "")",
                    cornerRadius: 14, height: 360)
            .padding(.horizontal, 36)

          // Article body
          VStack(alignment: .leading, spacing: 22) {
            Text("\(m.date) · \(place?.label ?? ""), \(place?.country ?? "")".uppercased())
              .font(Theme.mono(11, weight: .medium))
              .tracking(1.4)
              .foregroundStyle(Theme.ink3)
              .padding(.top, 32)
            Text(m.title)
              .font(Theme.serif(52, italic: true, weight: .medium))
              .foregroundStyle(Theme.ink)
              .tracking(-1.4)
              .multilineTextAlignment(.leading)
            Text(m.body)
              .font(Theme.serif(19))
              .foregroundStyle(Theme.ink)
              .lineSpacing(8)
              .multilineTextAlignment(.leading)

            // Metadata band
            HStack(alignment: .top, spacing: 24) {
              meta(s.metaChapter) {
                if let chapter { ChipView(chapter.label, accent: true) }
              }
              meta(s.metaPlace) {
                HStack(spacing: 6) {
                  Text(place?.label ?? "").font(Theme.serif(15)).foregroundStyle(Theme.ink)
                  Text(place?.country ?? "").font(Theme.sans(11)).foregroundStyle(Theme.ink3)
                }
              }
              meta(s.metaTags) {
                HStack(spacing: 5) {
                  ForEach(m.tags, id: \.self) { ChipView($0) }
                }
              }
            }
            .padding(.vertical, 20)
            .overlay(Rectangle().fill(Theme.rule).frame(height: 0.5), alignment: .top)
            .overlay(Rectangle().fill(Theme.rule).frame(height: 0.5), alignment: .bottom)

            // With (people)
            if !people.isEmpty {
              VStack(alignment: .leading, spacing: 12) {
                Text(s.withPeople.uppercased())
                  .font(Theme.mono(11, weight: .medium))
                  .tracking(1.4)
                  .foregroundStyle(Theme.ink3)
                HStack(alignment: .center, spacing: 14) {
                  ForEach(people) { p in
                    HStack(spacing: 9) {
                      Avatar(initials: p.initials, hue: avatarHue(p))
                        .frame(width: 36, height: 36)
                      VStack(alignment: .leading, spacing: 2) {
                        Text(p.name).font(Theme.serif(15)).foregroundStyle(Theme.ink)
                        Text(p.role.uppercased())
                          .font(Theme.sans(10.5, weight: .medium))
                          .tracking(0.8)
                          .foregroundStyle(Theme.ink3)
                      }
                    }
                  }
                  Spacer()
                }
              }
              .padding(.top, 6)
            }
          }
          .padding(.horizontal, 24)
          .frame(maxWidth: 720)
          .frame(maxWidth: .infinity, alignment: .center)

          // Related
          VStack(alignment: .leading, spacing: 14) {
            Text("\(s.moreFrom) \(chapter?.label ?? "")")
              .font(Theme.serif(22, weight: .medium))
              .foregroundStyle(Theme.ink)
              .tracking(-0.2)
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 14),
                                GridItem(.flexible(), spacing: 14),
                                GridItem(.flexible(), spacing: 14)], spacing: 14) {
              ForEach(Array(related)) { r in MemoryTile(memory: r) }
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 48)
          .frame(maxWidth: 940)
          .frame(maxWidth: .infinity, alignment: .center)

          // Prev / Next
          HStack(spacing: 14) {
            navCard(label: s.earlier, memory: prev, align: .leading)
            navCard(label: s.later,   memory: next, align: .trailing)
          }
          .padding(.horizontal, 24)
          .padding(.top, 36)
          .frame(maxWidth: 940)
          .frame(maxWidth: .infinity, alignment: .center)

          Spacer(minLength: 80)
        }
        .padding(.top, 6)
      }
    )
  }

  @ViewBuilder
  private func iconBtn(_ name: String, accent: Bool = false) -> some View {
    Image(systemName: name)
      .font(.system(size: 14, weight: .medium))
      .foregroundStyle(accent ? Theme.accent : Theme.ink2)
      .frame(width: 30, height: 30)
      .contentShape(Rectangle())
  }

  @ViewBuilder
  private func meta(_ label: String, @ViewBuilder _ content: () -> some View) -> some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(label.uppercased())
        .font(Theme.mono(10, weight: .medium))
        .tracking(1.2)
        .foregroundStyle(Theme.ink3)
      content()
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  @ViewBuilder
  private func navCard(label: String, memory: Memory?, align: HorizontalAlignment) -> some View {
    if let m = memory {
      Button { state.open(m.id) } label: {
        VStack(alignment: align, spacing: 6) {
          Text("← \(label)".uppercased())
            .font(Theme.mono(10.5, weight: .medium))
            .tracking(1.2)
            .foregroundStyle(Theme.ink3)
          Text(m.title)
            .font(Theme.serif(18, weight: .medium))
            .foregroundStyle(Theme.ink)
            .multilineTextAlignment(align == .leading ? .leading : .trailing)
          Text(m.date)
            .font(Theme.sans(11))
            .foregroundStyle(Theme.ink3)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: align == .leading ? .leading : .trailing)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Theme.rule, lineWidth: 0.5))
      }
      .buttonStyle(.plain)
    } else {
      Color.clear.frame(maxWidth: .infinity)
    }
  }

  private func avatarHue(_ p: Person) -> Double {
    let idx = state.content.people.firstIndex(where: { $0.id == p.id }) ?? 0
    return Double((idx * 53 + 20) % 360)
  }
}

struct Avatar: View {
  let initials: String
  let hue: Double
  var body: some View {
    Circle()
      .fill(
        LinearGradient(colors: [
          Color(hue: hue / 360, saturation: 0.18, brightness: 0.85),
          Color(hue: ((hue + 40).truncatingRemainder(dividingBy: 360)) / 360,
                saturation: 0.22, brightness: 0.72)
        ], startPoint: .topLeading, endPoint: .bottomTrailing)
      )
      .overlay(Text(initials)
        .font(Theme.sans(12, weight: .semibold))
        .foregroundStyle(.black.opacity(0.65)))
      .overlay(Circle().strokeBorder(.black.opacity(0.1), lineWidth: 0.5))
  }
}
