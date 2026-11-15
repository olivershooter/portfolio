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
	/** The career before software, shown last in the experience list. */
	val before: StoryBeat,
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
	contactMessage = "Email is the quickest way to reach me.",
	github = "https://github.com/olivershooter",
	linkedin = "https://www.linkedin.com/in/olivershooter",
	before = StoryBeat(
		year = "2014 to 2020",
		title = "Film sets",
		text = "Worked in media production, then retrained with an MSc in Computer Science " +
			"at the University of Birmingham.",
	),
)
