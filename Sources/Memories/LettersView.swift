// LettersView.swift — handwritten letters on cream paper, on a wood-desk background.

import SwiftUI

struct LettersView: View {
  @EnvironmentObject var state: AppState

  var body: some View {
    let s = state.content.strings
    ScrollView {
      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: 12) {
          Text(s.lettersEyebrow(state.content.letters.count).uppercased())
            .font(Theme.mono(11, weight: .medium))
            .tracking(1.4)
            .foregroundStyle(Color(red: 0.235, green: 0.157, blue: 0.078).opacity(0.55))
          Text(s.lettersHeadline)
            .font(Theme.script(68))
            .foregroundStyle(Theme.inkBrown)
            .tracking(-1)
          Text(s.lettersSubtitle)
            .font(Theme.serif(16, italic: true))
            .foregroundStyle(Color(red: 0.235, green: 0.157, blue: 0.078).opacity(0.7))
            .lineSpacing(4)
            .frame(maxWidth: 520, alignment: .leading)
        }
        .padding(.horizontal, 20)
        .padding(.top, 36)
        .padding(.bottom, 36)
        .frame(maxWidth: 720, alignment: .leading)
        .frame(maxWidth: .infinity, alignment: .center)

        ForEach(Array(state.content.letters.enumerated()), id: \.1.id) { (i, letter) in
          LetterCard(letter: letter, index: i)
            .padding(.bottom, 56)
        }

        HStack(spacing: 8) {
          Image(systemName: "plus")
            .font(.system(size: 12, weight: .medium))
            .foregroundStyle(Color(red: 0.235, green: 0.157, blue: 0.078).opacity(0.6))
          Text(s.lettersWriteAnother)
            .font(Theme.serif(15, italic: true))
            .foregroundStyle(Color(red: 0.235, green: 0.157, blue: 0.078).opacity(0.55))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .overlay(
          Capsule().strokeBorder(
            Color(red: 0.235, green: 0.157, blue: 0.078).opacity(0.3),
            style: StrokeStyle(lineWidth: 0.5, dash: [4, 4]))
        )
        .frame(maxWidth: .infinity)
        .padding(.bottom, 60)
        .padding(.top, 20)
      }
    }
    .background(
      ZStack {
        LinearGradient(colors: [Theme.woodDark, Theme.woodLight], startPoint: .top, endPoint: .bottom)
        RadialGradient(colors: [Color(red: 0.471, green: 0.314, blue: 0.196).opacity(0.12), .clear],
                       center: .top, startRadius: 60, endRadius: 600)
      }
    )
  }
}

struct LetterCard: View {
  let letter: Letter
  let index: Int

  var body: some View {
    let tilt = index % 2 == 0 ? -0.4 : 0.5
    ZStack(alignment: .topTrailing) {
      ZStack(alignment: .top) {
        Rectangle()
          .fill(LinearGradient(colors: [Theme.paperCream1, Theme.paperCream2],
                               startPoint: .top, endPoint: .bottom))
          .overlay(
            GeometryReader { geo in
              Canvas { ctx, size in
                let lineGap: CGFloat = 33
                let count = Int(size.height / lineGap) + 2
                let color = GraphicsContext.Shading.color(
                  Color(red: 0.549, green: 0.392, blue: 0.235).opacity(0.10))
                for i in 1..<count {
                  let y = CGFloat(i) * lineGap
                  var path = Path()
                  path.move(to: CGPoint(x: 0, y: y))
                  path.addLine(to: CGPoint(x: size.width, y: y))
                  ctx.stroke(path, with: color, lineWidth: 0.5)
                }
              }
              .frame(width: geo.size.width, height: geo.size.height)
            }
          )

        VStack(alignment: .leading, spacing: 0) {
          HStack {
            Spacer()
            Text(letter.occasion.isEmpty ? letter.date : "\(letter.date) · \(letter.occasion)")
              .font(Theme.serif(14, italic: true))
              .foregroundStyle(Color(red: 0.314, green: 0.216, blue: 0.118).opacity(0.6))
              .tracking(0.2)
          }
          .padding(.bottom, 18)

          Text(letter.salutation)
            .font(Theme.hand(30))
            .foregroundStyle(Theme.inkBrown)
            .padding(.bottom, 22)

          Text(letter.body)
            .font(Theme.hand(26))
            .foregroundStyle(Theme.inkBrown)
            .lineSpacing(8)
            .fixedSize(horizontal: false, vertical: true)
            .multilineTextAlignment(.leading)

          Text(letter.signature)
            .font(Theme.hand(28))
            .foregroundStyle(Theme.inkBrown)
            .padding(.top, 32)
          Text(letter.signedName)
            .font(Theme.script(36))
            .foregroundStyle(Theme.accent)
            .tracking(-0.5)
            .padding(.top, 4)
        }
        .padding(.horizontal, 60)
        .padding(.top, 52)
        .padding(.bottom, 56)
      }
      .clipShape(RoundedRectangle(cornerRadius: 4))
      .shadow(color: Color(red: 0.314, green: 0.216, blue: 0.118).opacity(0.25), radius: 24, x: 0, y: 18)

      WaxSeal()
        .offset(x: -28, y: -14)
    }
    .rotationEffect(.degrees(tilt))
    .frame(maxWidth: 720)
    .padding(.horizontal, 20)
    .frame(maxWidth: .infinity, alignment: .center)
  }
}

struct WaxSeal: View {
  @EnvironmentObject var state: AppState
  var body: some View {
    ZStack {
      Circle()
        .fill(
          RadialGradient(colors: [
            Color(hue: 0.05, saturation: 0.62, brightness: 0.62),
            Color(hue: 0.04, saturation: 0.66, brightness: 0.42),
            Color(hue: 0.04, saturation: 0.62, brightness: 0.32)
          ], center: .init(x: 0.3, y: 0.3), startRadius: 4, endRadius: 30)
        )
        .frame(width: 54, height: 54)
        .shadow(color: .black.opacity(0.18), radius: 6, x: 0, y: 4)
      Text(state.content.strings.waxSeal)
        .font(Theme.script(26))
        .foregroundStyle(Color(red: 1.0, green: 0.92, blue: 0.88).opacity(0.95))
        .rotationEffect(.degrees(-8))
        .shadow(color: .black.opacity(0.35), radius: 1, y: 1)
    }
  }
}
