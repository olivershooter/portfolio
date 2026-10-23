package portfolio.content

enum class LinkKind(val label: String) {
	Live("Live site"),
	AppStore("Get it on the App Store"),
	PlayStore("Get it on Google Play"),
	GitHub("Source on GitHub"),
}

data class Project(
	val id: String,
	val name: String,
	val tagline: String,
	val description: String,
	val stack: List<String>,
	val links: Map<LinkKind, String>,
)

val projects = listOf(
	Project(
		id = "football",
		name = "Football Statistics",
		tagline = "Free sports analytics. No sign-ups, no paywalls.",
		description = "Match results, live stats, timelines, and highlights for football. React/TypeScript frontend, " +
			"Python/FastAPI backend pulling from third-party APIs. Completely free to use.",
		stack = listOf("React", "TypeScript", "Vite", "FastAPI", "Python"),
		links = mapOf(LinkKind.Live to "https://football.olivershooter.com"),
	),
	Project(
		id = "salah-times",
		name = "Salah Times",
		tagline = "Prayer times app. Accurate, offline-ready.",
		description = "React Native app for prayer times. Sky backgrounds change from dawn to night. Picks the right " +
			"calculation source for your country (JAKIM, Kemenag, Al-Adhan) automatically. Push notifications, " +
			"countdowns, works offline.",
		stack = listOf("React Native", "Expo", "TypeScript"),
		links = mapOf(LinkKind.AppStore to "https://apps.apple.com/gb/app/simple-salah-times/id6760982824"),
	),
	Project(
		id = "screendle",
		name = "Screendle",
		tagline = "Daily movie guessing game. Five clues, five guesses.",
		description = "Wordle but for films. You get clues one at a time (synopsis, release date, runtime, box office, " +
			"actors) and five guesses to name the movie. Answers validated server-side, new games generated weekly, " +
			"holiday themes for fun.",
		stack = listOf("React", "TypeScript", "Vite", "Express", "PostgreSQL"),
		links = mapOf(LinkKind.Live to "https://screendle.com"),
	),
	Project(
		id = "candice",
		name = "Candice",
		tagline = "Language translation on Android. Works offline.",
		description = "Android app for translating text, speech, and images using Google ML Kit. Has translation history, " +
			"a flashcard game, and downloadable language models so it works without internet. Local NoSQL storage.",
		stack = listOf("Java", "Android", "Google ML Kit", "NoSQL"),
		links = mapOf(LinkKind.GitHub to "https://github.com/olivershooter/candice"),
	),
)
