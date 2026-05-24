// Theme.swift — shared design tokens

import SwiftUI

enum Theme {
  static let bg      = Color(red: 0.969, green: 0.953, blue: 0.925)
  static let card    = Color(red: 1.000, green: 0.992, blue: 0.973)
  static let ink     = Color(red: 0.122, green: 0.106, blue: 0.086)
  static let ink2    = Color(red: 0.353, green: 0.322, blue: 0.286)
  static let ink3    = Color(red: 0.545, green: 0.510, blue: 0.463)
  static let accent  = Color(red: 0.643, green: 0.290, blue: 0.165)
  static let accent2 = Color(red: 0.243, green: 0.420, blue: 0.345)
  static let rule    = Color.black.opacity(0.10)

  // Letter / paper
  static let paperCream1 = Color(red: 0.992, green: 0.973, blue: 0.925)
  static let paperCream2 = Color(red: 0.976, green: 0.945, blue: 0.871)
  static let inkBrown    = Color(red: 0.231, green: 0.165, blue: 0.110)
  static let woodDark    = Color(red: 0.922, green: 0.878, blue: 0.788)
  static let woodLight   = Color(red: 0.878, green: 0.827, blue: 0.714)

  static func serif(_ size: CGFloat, italic: Bool = false, weight: Font.Weight = .regular) -> Font {
    let f = Font.custom("Newsreader", size: size, relativeTo: .body).weight(weight)
    return italic ? f.italic() : f
  }
  static func sans(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
    Font.system(size: size, weight: weight, design: .default)
  }
  static func mono(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
    Font.system(size: size, weight: weight, design: .monospaced)
  }
  static func hand(_ size: CGFloat) -> Font {
    Font.custom("Caveat", size: size, relativeTo: .body)
  }
  static func script(_ size: CGFloat) -> Font {
    Font.custom("Dancing Script", size: size, relativeTo: .body)
  }
}

extension Color {
  static func chapterTint(hue: Double, light: Double = 0.92, sat: Double = 0.20) -> Color {
    Color(hue: hue / 360.0, saturation: sat, brightness: light)
  }
}
