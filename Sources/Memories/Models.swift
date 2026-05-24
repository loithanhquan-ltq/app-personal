import Foundation

struct Memory: Identifiable, Hashable {
    let id: String
    let year: Int
    let date: String
    let sortKey: String
    let chapter: String
    let title: String
    let place: String
    let people: [String]
    let tags: [String]
    var favorite: Bool
    let body: String
}

struct Chapter: Identifiable, Hashable {
    let id: String
    let label: String
    let span: String
    let hue: Double
}

struct Person: Identifiable, Hashable {
    let id: String
    let name: String
    let role: String
    let initials: String
}

struct Place: Identifiable, Hashable {
    let id: String
    let label: String
    let country: String
    let lat: Double
    let lng: Double
}

struct Letter: Identifiable {
    let id: String
    let date: String
    let occasion: String
    let salutation: String
    let body: String
    let signature: String
}
