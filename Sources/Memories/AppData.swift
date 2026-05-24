import Foundation

enum AppData {
    static let startDate: Date = {
        var c = DateComponents(); c.year = 2022; c.month = 6; c.day = 9
        return Calendar.current.date(from: c)!
    }()

    static var daysSinceStart: Int {
        Calendar.current.dateComponents([.day], from: startDate, to: Date()).day ?? 0
    }

    static let chapters: [Chapter] = [
        Chapter(id: "beginning", label: "Beginning", span: "June – Aug 2022",      hue: 18),
        Chapter(id: "falling",   label: "Falling",   span: "Sep 2022 – May 2023",  hue: 354),
        Chapter(id: "building",  label: "Building",  span: "Jun 2023 – May 2024",  hue: 330),
        Chapter(id: "staying",   label: "Staying",   span: "Jun 2024 – May 2025",  hue: 280),
        Chapter(id: "now",       label: "Now",       span: "Jun 2025 – today",     hue: 220),
    ]

    static let people: [Person] = [
        Person(id: "you",     name: "You",              role: "the one this is for", initials: "♥"),
        Person(id: "yourmom", name: "Your mom",         role: "family",              initials: "YM"),
        Person(id: "yourdad", name: "Your dad",         role: "family",              initials: "YD"),
        Person(id: "friend",  name: "My oldest friend", role: "witness",             initials: "OF"),
    ]

    static let places: [Place] = [
        Place(id: "home",    label: "Our city",      country: "— edit me",    lat: 10.78, lng: 106.70),
        Place(id: "cafe",    label: "The café",      country: "where it began", lat: 10.79, lng: 106.69),
        Place(id: "dalat",   label: "Đà Lạt",        country: "pines, mist",  lat: 11.94, lng: 108.43),
        Place(id: "hoian",   label: "Hội An",        country: "lanterns",     lat: 15.88, lng: 108.33),
        Place(id: "parents", label: "Your parents'", country: "a small town", lat: 16.46, lng: 107.59),
        Place(id: "apt",     label: "The apartment", country: "ours",         lat: 10.80, lng: 106.71),
    ]

    static let memories: [Memory] = [
        Memory(id: "m01", year: 2022, date: "9 June 2022", sortKey: "2022-06-09", chapter: "beginning",
               title: "Day one", place: "cafe", people: ["you"], tags: ["firsts", "anniversary"],
               favorite: true,
               body: "I won't pretend I remember every detail. But I remember thinking — this person is going to be in my life for a long time. I didn't know why. I just knew."),

        Memory(id: "m02", year: 2022, date: "June 2022", sortKey: "2022-06-15", chapter: "beginning",
               title: "Three days of messages", place: "home", people: ["you"], tags: ["firsts"],
               favorite: false,
               body: "We typed too fast and slept too little. I checked the chat between meetings. Once, between sentences. You sent a voice note at 1 AM and I played it four times before answering."),

        Memory(id: "m03", year: 2022, date: "July 2022", sortKey: "2022-07-12", chapter: "beginning",
               title: "Coffee, dinner, the long way home", place: "cafe", people: ["you"], tags: ["firsts", "dates"],
               favorite: true,
               body: "We sat in that café until they wiped the next table around us. Then we ate dinner. Then we walked. You said you weren't tired. I wasn't either. We made the city smaller that night."),

        Memory(id: "m04", year: 2022, date: "August 2022", sortKey: "2022-08-20", chapter: "beginning",
               title: "I said it first", place: "home", people: ["you"], tags: ["firsts"],
               favorite: false,
               body: "It came out before I could decide whether to say it. You laughed — not at me, with relief — and said it back. I have never been more glad to have failed to keep something in."),

        Memory(id: "m05", year: 2022, date: "17 September 2022", sortKey: "2022-09-17", chapter: "falling",
               title: "100 days", place: "home", people: ["you"], tags: ["milestones"],
               favorite: false,
               body: "I counted, secretly. You counted out loud. We bought a small cake from the bakery on the corner and ate it from the box, with two spoons, on the kitchen floor."),

        Memory(id: "m06", year: 2022, date: "November 2022", sortKey: "2022-11-04", chapter: "falling",
               title: "Caught in the rain", place: "home", people: ["you"], tags: ["ordinary"],
               favorite: true,
               body: "We ducked under an awning and waited. Twenty minutes. Maybe more. You leaned your head on my shoulder and I think that was the first time I felt completely calm."),

        Memory(id: "m07", year: 2022, date: "31 December 2022", sortKey: "2022-12-31", chapter: "falling",
               title: "Our first new year", place: "home", people: ["you"], tags: ["milestones"],
               favorite: false,
               body: "Fireworks too loud to hear each other. So you wrote it on my palm with your finger: next year. I knew what you meant. I closed my hand to keep it."),

        Memory(id: "m08", year: 2023, date: "14 February 2023", sortKey: "2023-02-14", chapter: "falling",
               title: "Sick on Valentine's", place: "home", people: ["you"], tags: ["ordinary", "milestones"],
               favorite: false,
               body: "You had a fever of 38.5. I bought soup and the wrong medicine and we watched the same movie twice. You said it was the best Valentine's yet. I think you meant it."),

        Memory(id: "m09", year: 2023, date: "April 2023", sortKey: "2023-04-22", chapter: "falling",
               title: "Đà Lạt", place: "dalat", people: ["you"], tags: ["travel", "firsts"],
               favorite: true,
               body: "Pines and mist. You wore my jacket because you forgot yours. We rode a borrowed scooter slowly, badly. A dog followed us for a block and you wanted to take it home. I almost said yes."),

        Memory(id: "m10", year: 2023, date: "9 June 2023", sortKey: "2023-06-09", chapter: "building",
               title: "One year", place: "home", people: ["you"], tags: ["anniversary", "milestones"],
               favorite: true,
               body: "Year one. We made a list of everything we'd done — small things, mostly. The list was longer than I expected. You added \"and we're still here,\" at the bottom, and underlined it."),

        Memory(id: "m11", year: 2023, date: "September 2023", sortKey: "2023-09-10", chapter: "building",
               title: "Dinner at your parents'", place: "parents", people: ["you", "yourmom", "yourdad"], tags: ["family", "firsts"],
               favorite: false,
               body: "Your mom kept refilling my bowl. Your dad asked about my work and actually listened to the answers. On the way home you said, \"I think they liked you,\" and I almost cried in the back of the cab."),

        Memory(id: "m12", year: 2023, date: "December 2023", sortKey: "2023-12-08", chapter: "building",
               title: "Two keys", place: "apt", people: ["you"], tags: ["home", "milestones"],
               favorite: false,
               body: "Two keys. One for me. The kitchen still smelled like paint when we ate the first dinner there, sitting on the floor because the table hadn't arrived yet. We were so tired. We were so happy."),

        Memory(id: "m13", year: 2024, date: "April 2024", sortKey: "2024-04-03", chapter: "building",
               title: "The fight I'd rather forget", place: "apt", people: ["you"], tags: ["hard"],
               favorite: false,
               body: "I won't write it all down. Only this: we figured it out. It took three days and a lot of staring at the ceiling. We were not the same after. We were better."),

        Memory(id: "m14", year: 2024, date: "9 June 2024", sortKey: "2024-06-09", chapter: "staying",
               title: "Two years", place: "home", people: ["you"], tags: ["anniversary", "milestones"],
               favorite: false,
               body: "You said \"we're old now.\" I said \"we're just starting.\" Both true. We bought flowers for ourselves. They lasted nine days."),

        Memory(id: "m15", year: 2024, date: "October 2024", sortKey: "2024-10-14", chapter: "staying",
               title: "Hội An, lanterns", place: "hoian", people: ["you"], tags: ["travel"],
               favorite: true,
               body: "Lanterns on the river. You bought one and lit it badly. We watched it drift maybe ten meters and then sink. We laughed until we couldn't."),

        Memory(id: "m16", year: 2025, date: "February 2025", sortKey: "2025-02-09", chapter: "staying",
               title: "The quiet weeks", place: "apt", people: ["you"], tags: ["hard"],
               favorite: false,
               body: "Work was hard. You were tired. I made too much coffee and not enough conversation. You came home one Friday and said \"I missed you\" and we started again. That's the whole entry."),

        Memory(id: "m17", year: 2025, date: "9 June 2025", sortKey: "2025-06-09", chapter: "now",
               title: "Three years", place: "cafe", people: ["you"], tags: ["anniversary", "milestones"],
               favorite: true,
               body: "We didn't do anything special. We went to the same café. We ordered the same coffee. We sat where we sat the first time and didn't have to say much. Three years and we still tell each other things we haven't told anyone."),

        Memory(id: "m18", year: 2025, date: "December 2025", sortKey: "2025-12-20", chapter: "now",
               title: "Winter habits", place: "apt", people: ["you"], tags: ["ordinary"],
               favorite: false,
               body: "Two mugs in the sink every morning. Your slippers by the door. The way the light comes through the kitchen window at 4 PM and lands on the same square of floor. None of this is interesting. All of this is everything."),

        Memory(id: "m19", year: 2026, date: "April 2026", sortKey: "2026-04-11", chapter: "now",
               title: "Almost four", place: "home", people: ["you", "friend"], tags: ["milestones"],
               favorite: false,
               body: "We talked about the future like it was a real place we could go. We didn't decide anything. We didn't need to. Later, my oldest friend asked how it's going. I said: still good. Still surprising. Still good."),

        Memory(id: "m20", year: 2026, date: "Today", sortKey: "2026-05-24", chapter: "now",
               title: "Today", place: "apt", people: ["you"], tags: ["ordinary"],
               favorite: true,
               body: "You're in the next room. I can hear you typing. I'm writing this so I remember — not the big things, the small ones. The sound of you, just now, in the next room."),
    ]

    static let letters: [Letter] = [
        Letter(id: "l01", date: "8 July 2022", occasion: "one month",
               salutation: "My dear you,",
               body: "Thirty days. I keep thinking that's nothing — and also that it's the longest I've felt like myself in a long time.\n\nYou make me slower in the good way. I noticed the trees on my walk this morning. I noticed the light. I noticed that I am happy in a way I had stopped expecting.\n\nI don't have a question. I don't have a point. I just wanted to write it down so that later, when life gets loud, I can come back and remember that it started this quietly.",
               signature: "Yours,"),

        Letter(id: "l02", date: "25 December 2022", occasion: "our first Christmas",
               salutation: "To the warmest room in the house,",
               body: "Six months. The tree is leaning slightly to the left. You set it up. I have been told not to fix it.\n\nYou made me a small thing today that you said wasn't a big deal and obviously it is. I am keeping it forever, in case that wasn't clear.\n\nIf I ever forget to tell you out loud: thank you for being patient with me. Thank you for not minding that I take a long time to say what I mean. Thank you for waiting.",
               signature: "Always,"),

        Letter(id: "l03", date: "9 June 2023", occasion: "year one",
               salutation: "For our first year,",
               body: "I made a list this morning of all the small things — your laugh when you're surprised, the way you read menus out loud, the bad jokes you commit to. The list was longer than I expected.\n\nI thought a year would feel like a milestone. Instead it feels like the beginning of something I'd like to keep doing for as long as I can.\n\nI'm not very good at remembering to say important things on the day they're important. So I'm saying it now, on every day, in writing: I love you. Year one. Many more, please.",
               signature: "All of me,"),

        Letter(id: "l04", date: "6 April 2024", occasion: "after a hard week",
               salutation: "You,",
               body: "I've been trying to write this for two days. I keep starting and stopping.\n\nHere's what I want to say: I am sorry. I am also proud of us. We didn't pretend it didn't happen. We didn't pretend we didn't mean it. We sat in it and we figured it out.\n\nI love you more after than before. That surprises me. I hope it doesn't surprise you.",
               signature: "Yours, even tired,"),

        Letter(id: "l05", date: "12 January 2025", occasion: "a quiet Sunday",
               salutation: "On a quiet morning,",
               body: "Nothing happened today.\n\nYou slept in. I made coffee badly and brought you a cup anyway. You squinted at the light and said good morning in the voice you only use first thing.\n\nI am writing this because there will be days I forget what ordinary feels like, and I want to remember that ordinary, with you, is the thing I want most.",
               signature: "Always your morning,"),

        Letter(id: "l06", date: "9 June 2025", occasion: "year three",
               salutation: "Three years in,",
               body: "We went to the same café. You wore the wrong shoes for the rain and didn't care. We sat for a long time without saying much.\n\nI know what I have. I'm not done being surprised by it.\n\nHere is the truth at three years: most of the work is just showing up, and most of the joy is, too. You show up. I am trying to. Year four is going to be the best one yet, because I am going to mean it more.",
               signature: "Yours, on purpose,"),
    ]

    static func memory(id: String)  -> Memory?  { memories.first  { $0.id == id } }
    static func place(id: String)   -> Place?   { places.first    { $0.id == id } }
    static func person(id: String)  -> Person?  { people.first    { $0.id == id } }
    static func chapter(id: String) -> Chapter? { chapters.first  { $0.id == id } }

    static var favorites: [Memory]     { memories.filter { $0.favorite } }
    static var anniversaries: [Memory] { memories.filter { $0.tags.contains("anniversary") } }

    static func memories(forChapter id: String) -> [Memory] {
        memories.filter { $0.chapter == id }
    }

    static func search(_ query: String) -> [Memory] {
        let q = query.lowercased()
        return memories.filter {
            $0.title.lowercased().contains(q) ||
            $0.body.lowercased().contains(q) ||
            $0.tags.contains { $0.contains(q) } ||
            (place(id: $0.place)?.label.lowercased().contains(q) ?? false) ||
            ($0.favorite && q == "favorite")
        }
    }
}
