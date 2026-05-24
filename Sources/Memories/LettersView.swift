import SwiftUI

struct LettersView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("\(AppData.letters.count) letters · for you only".uppercased())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Color(red: 60/255, green: 40/255, blue: 20/255).opacity(0.55))
                    .tracking(1.4)
                Text("Letters to you")
                    .font(.custom("Snell Roundhand", size: 64))
                    .foregroundStyle(Color(red: 59/255, green: 42/255, blue: 28/255))
                    .tracking(-1)
                Text("A drawer of things I wanted to say out loud and almost did.\nOne letter for every chapter that mattered. More coming.")
                    .font(.custom("Georgia", size: 16).italic())
                    .foregroundStyle(Color(red: 60/255, green: 40/255, blue: 20/255).opacity(0.70))
                    .lineSpacing(4)
            }
            .padding(.bottom, 36)

            // Letter cards
            ForEach(Array(AppData.letters.enumerated()), id: \.element.id) { i, letter in
                LetterCard(letter: letter, index: i)
                    .padding(.bottom, 56)
            }

            // Write another affordance
            HStack {
                Spacer()
                Label("Write another letter", systemImage: "plus")
                    .font(.custom("Georgia", size: 15).italic())
                    .foregroundStyle(Color(red: 60/255, green: 40/255, blue: 20/255).opacity(0.55))
                    .padding(.horizontal, 16).padding(.vertical, 8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 999)
                            .stroke(Color(red: 60/255, green: 40/255, blue: 20/255).opacity(0.30),
                                    style: StrokeStyle(lineWidth: 0.5, dash: [4, 3]))
                    )
                Spacer()
            }
        }
        .padding(.horizontal, 36)
        .padding(.top, 20)
        .padding(.bottom, 60)
        .frame(maxWidth: 760)
        .frame(maxWidth: .infinity)
        .background(
            LinearGradient(
                stops: [
                    .init(color: Color(red: 235/255, green: 224/255, blue: 201/255), location: 0),
                    .init(color: Color(red: 224/255, green: 211/255, blue: 182/255), location: 1),
                ],
                startPoint: .top, endPoint: .bottom
            )
        )
    }
}

// MARK: - Single letter card

struct LetterCard: View {
    let letter: Letter
    let index: Int

    private var tilt: Double { index % 2 == 0 ? -0.4 : 0.5 }
    private var showCoffeeRing: Bool { index % 3 == 1 }
    private let paperTop    = Color(red: 253/255, green: 248/255, blue: 236/255)
    private let paperBottom = Color(red: 249/255, green: 241/255, blue: 222/255)
    private let inkColor    = Color(red: 59/255, green: 42/255, blue: 28/255)

    var body: some View {
        ZStack(alignment: .topTrailing) {
            // Paper
            ZStack {
                // Paper gradient
                RoundedRectangle(cornerRadius: 4)
                    .fill(LinearGradient(colors: [paperTop, paperBottom],
                                        startPoint: .top, endPoint: .bottom))

                // Ruled lines overlay
                GeometryReader { geo in
                    Canvas { ctx, size in
                        let lineH: CGFloat = 34
                        var y = lineH
                        while y < size.height {
                            var line = Path()
                            line.move(to: CGPoint(x: 0, y: y))
                            line.addLine(to: CGPoint(x: size.width, y: y))
                            ctx.stroke(line, with: .color(Color(red: 140/255, green: 100/255, blue: 60/255).opacity(0.10)),
                                      lineWidth: 1)
                            y += lineH
                        }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 4))

                // Coffee ring
                if showCoffeeRing {
                    Circle()
                        .stroke(Color(red: 150/255, green: 90/255, blue: 40/255).opacity(0.10), lineWidth: 6)
                        .frame(width: 80, height: 80)
                        .rotationEffect(.degrees(15))
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                        .padding(60)
                }

                // Letter content
                VStack(alignment: .leading, spacing: 0) {
                    // Date line
                    HStack {
                        Spacer()
                        Text("\(letter.date) · \(letter.occasion)")
                            .font(.custom("Georgia", size: 14).italic())
                            .foregroundStyle(inkColor.opacity(0.60))
                    }
                    .padding(.bottom, 18)

                    // Salutation
                    Text(letter.salutation)
                        .font(.custom("Bradley Hand", size: 30))
                        .foregroundStyle(inkColor)
                        .padding(.bottom, 18)

                    // Body
                    Text(letter.body)
                        .font(.custom("Bradley Hand", size: 24))
                        .foregroundStyle(inkColor)
                        .lineSpacing(6)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    // Signature
                    VStack(alignment: .leading, spacing: 2) {
                        Text(letter.signature)
                            .font(.custom("Bradley Hand", size: 26))
                            .foregroundStyle(inkColor)
                        Text("me")
                            .font(.custom("Snell Roundhand", size: 36))
                            .foregroundStyle(Theme.accent)
                            .tracking(-0.5)
                    }
                    .padding(.top, 28)
                }
                .padding(.horizontal, 60)
                .padding(.vertical, 52)
            }
            .shadow(color: Color(red: 80/255, green: 55/255, blue: 30/255).opacity(0.20), radius: 30, x: 0, y: 14)
            .shadow(color: Color(red: 80/255, green: 55/255, blue: 30/255).opacity(0.12), radius: 12, x: 0, y: 6)
            .overlay(RoundedRectangle(cornerRadius: 4)
                .stroke(Color(red: 140/255, green: 100/255, blue: 60/255).opacity(0.18), lineWidth: 0.5))

            // Wax seal
            ZStack {
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color(hue: 25/360, saturation: 0.60, brightness: 0.62),
                                Color(hue: 25/360, saturation: 0.65, brightness: 0.42),
                                Color(hue: 25/360, saturation: 0.62, brightness: 0.32),
                            ],
                            center: UnitPoint(x: 0.3, y: 0.3),
                            startRadius: 0, endRadius: 27
                        )
                    )
                    .frame(width: 54, height: 54)
                    .shadow(color: .black.opacity(0.18), radius: 4, x: 0, y: 4)
                    .overlay(Circle().stroke(Color.white.opacity(0.12), lineWidth: 0.5))

                Text("us")
                    .font(.custom("Snell Roundhand", size: 26))
                    .foregroundStyle(Color(red: 255/255, green: 235/255, blue: 225/255).opacity(0.95))
                    .shadow(color: .black.opacity(0.35), radius: 1, y: 1)
            }
            .rotationEffect(.degrees(-8))
            .offset(x: -28, y: -14)
        }
        .rotationEffect(.degrees(tilt))
        .padding(.horizontal, 20)
    }
}
