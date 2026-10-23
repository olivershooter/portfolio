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
	val stack: List<String>,
	val links: Map<LinkKind, String>,
)

val projects = listOf(
	Project(
		id = "football",
		name = "Football Statistics",
		tagline = "Free sports analytics. No sign-ups, no paywalls.",
		stack = listOf("React", "TypeScript", "Vite", "FastAPI", "Python"),
		links = mapOf(LinkKind.Live to "https://football.olivershooter.com"),
	),
	Project(
		id = "salah-times",
		name = "Salah Times",
		tagline = "Prayer times app. Accurate, offline-ready.",
		stack = listOf("React Native", "Expo", "TypeScript"),
		links = mapOf(LinkKind.AppStore to "https://apps.apple.com/gb/app/simple-salah-times/id6760982824"),
	),
	Project(
		id = "screendle",
		name = "Screendle",
		tagline = "Daily movie guessing game. Five clues, five guesses.",
		stack = listOf("React", "TypeScript", "Vite", "Express", "PostgreSQL"),
		links = mapOf(LinkKind.Live to "https://screendle.com"),
	),
	Project(
		id = "candice",
		name = "Candice",
		tagline = "Language translation on Android. Works offline.",
		stack = listOf("Java", "Android", "Google ML Kit", "NoSQL"),
		links = mapOf(LinkKind.GitHub to "https://github.com/olivershooter/candice"),
	),
)
