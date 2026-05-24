import SwiftUI

enum Theme {
    static let bg      = Color(red: 247/255, green: 243/255, blue: 236/255)
    static let card    = Color(red: 255/255, green: 253/255, blue: 248/255)
    static let ink     = Color(red: 31/255,  green: 27/255,  blue: 22/255)
    static let ink2    = Color(red: 90/255,  green: 82/255,  blue: 73/255)
    static let ink3    = Color(red: 139/255, green: 130/255, blue: 118/255)
    static let rule    = Color(red: 31/255,  green: 27/255,  blue: 22/255).opacity(0.10)
    static let accent  = Color(red: 164/255, green: 74/255,  blue: 42/255)

    static func chapterFill(hue: Double) -> Color {
        Color(hue: hue / 360, saturation: 0.28, brightness: 0.90)
    }
    static func chapterDot(hue: Double) -> Color {
        Color(hue: hue / 360, saturation: 0.50, brightness: 0.70)
    }
}
