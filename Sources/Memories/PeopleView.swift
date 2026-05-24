import SwiftUI

struct PeopleView: View {
    @Environment(AppState.self) private var state

    private let others = AppData.people.filter { $0.id != "you" }
    private let youMemories = AppData.memories.filter { $0.people.contains("you") }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 4) {
                Text("Mostly you".uppercased())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.ink3).tracking(1.4)
                Text("The cast")
                    .font(.custom("Georgia", size: 44).italic())
                    .foregroundStyle(Theme.ink).tracking(-1)
                Text("A love story is mostly two people. The others were there too.")
                    .font(.custom("Georgia", size: 15).italic())
                    .foregroundStyle(Theme.ink3)
            }
            .padding(.bottom, 28)

            // YOU — big card
            HStack(spacing: 28) {
                ZStack {
                    Circle()
                        .fill(RadialGradient(
                            colors: [.white, Color(red: 251/255, green: 226/255, blue: 220/255),
                                     Color(red: 217/255, green: 122/255, blue: 110/255)],
                            center: UnitPoint(x: 0.3, y: 0.3),
                            startRadius: 0, endRadius: 90
                        ))
                    Text("♥")
                        .font(.system(size: 96))
                        .foregroundStyle(Theme.accent)
                }
                .frame(width: 180, height: 180)
                .shadow(color: Theme.accent.opacity(0.20), radius: 20, y: 8)
                .overlay(Circle().stroke(Color.black.opacity(0.06), lineWidth: 0.5))

                VStack(alignment: .leading, spacing: 0) {
                    Text("the one this is for".uppercased())
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.ink.opacity(0.45))
                        .tracking(1.2)
                    Text("You")
                        .font(.custom("Georgia", size: 56).italic())
                        .foregroundStyle(Theme.ink)
                        .tracking(-1.5)
                        .padding(.top, 4).padding(.bottom, 10)
                    Text("In \(youMemories.count) of \(AppData.memories.count) memories — which is to say, in every one of them.")
                        .font(.custom("Georgia", size: 17))
                        .foregroundStyle(Theme.ink2)
                        .lineSpacing(4)

                    // Quick-links to a few memories
                    HStack(spacing: 8) {
                        ForEach(youMemories.prefix(5)) { m in
                            Button { state.openMemory(m.id) } label: {
                                Text(m.title)
                                    .font(.custom("Georgia", size: 14).italic())
                                    .foregroundStyle(Theme.ink)
                                    .padding(.horizontal, 10).padding(.vertical, 3)
                                    .background(Color.white.opacity(0.5), in: Capsule())
                                    .overlay(Capsule().stroke(Color.black.opacity(0.08), lineWidth: 0.5))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.top, 14)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(28)
            .background(
                LinearGradient(
                    colors: [
                        Color(hue: 354/360, saturation: 0.28, brightness: 0.93),
                        Color(hue: 340/360, saturation: 0.40, brightness: 0.86),
                    ],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.black.opacity(0.06), lineWidth: 0.5))
            .padding(.bottom, 22)

            // Supporting cast
            Text("Also in the story".uppercased())
                .font(.system(size: 10.5, design: .monospaced))
                .foregroundStyle(Theme.ink3)
                .tracking(1.2)
                .padding(.bottom, 10)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 3), spacing: 14) {
                ForEach(Array(others.enumerated()), id: \.element.id) { i, person in
                    PersonCard(person: person, hue: Double((i * 53 + 20) % 360),
                               onOpenMemory: { state.openMemory($0) })
                }
            }
        }
        .padding(.horizontal, 36)
        .padding(.top, 18)
        .padding(.bottom, 80)
    }
}

struct PersonCard: View {
    let person: Person
    let hue: Double
    let onOpenMemory: (String) -> Void

    private var theirMemories: [Memory] {
        AppData.memories.filter { $0.people.contains(person.id) }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            AvatarView(initials: person.initials, hue: hue, size: 44)

            VStack(alignment: .leading, spacing: 2) {
                Text(person.name)
                    .font(.custom("Georgia", size: 17))
                    .foregroundStyle(Theme.ink).tracking(-0.2)
                Text(person.role.uppercased())
                    .font(.system(size: 10.5))
                    .foregroundStyle(Theme.ink3)
                    .tracking(1)

                if theirMemories.isEmpty {
                    Text("mentioned in passing")
                        .font(.custom("Georgia", size: 13).italic())
                        .foregroundStyle(Theme.ink2)
                        .padding(.top, 6)
                } else {
                    Text(theirMemories.map { "\"\($0.title)\"" }.joined(separator: ", "))
                        .font(.custom("Georgia", size: 13).italic())
                        .foregroundStyle(Theme.ink2)
                        .lineLimit(2)
                        .padding(.top, 6)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.rule, lineWidth: 0.5))
    }
}
