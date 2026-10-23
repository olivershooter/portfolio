package portfolio.content

data class StoryBeat(val year: String, val title: String, val text: String)

data class Profile(
	val name: String,
	val title: String,
	val location: String,
	val email: String,
	val shortBio: String,
	val contactMessage: String,
	val github: String,
	val linkedin: String?,
	val story: List<StoryBeat>,
) {
	val city: String get() = location.substringBefore(',')
}

val profile = Profile(
	name = "Oliver Shooter",
	title = "Software & Android Engineer",
	location = "Manchester, UK",
	email = "contact@olivershooter.com",
	shortBio = "I build native Android apps in Kotlin and Jetpack Compose at Deloitte. " +
		"Before that I built full-stack systems for Government, and before that I worked in film.",
	contactMessage = "Got a role, a project or just want to talk Android? Drop me a line.",
	github = "https://github.com/olivershooter",
	linkedin = "https://www.linkedin.com/in/olivershooter",
	story = listOf(
		StoryBeat("2014", "Film sets", "Started in media production. Learned to tell stories and think visually."),
		StoryBeat("2020", "The pivot", "MSc Computer Science at the University of Birmingham."),
		StoryBeat("2022", "Government", "Joined Government as a junior engineer and started shipping."),
		StoryBeat("2023", "Owning systems", "Promoted to Software Engineer. Owned full-stack systems and ran a team."),
		StoryBeat(
			"Now",
			"Deloitte · Android",
			"Consulting at Deloitte, now building native Android apps in Kotlin and Jetpack Compose.",
		),
	),
)
