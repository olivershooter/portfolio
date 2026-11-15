package portfolio.content

data class SkillGroup(val title: String, val items: List<String>)

val skills = listOf(
	SkillGroup("Android", listOf("Kotlin", "Jetpack Compose", "Android SDK", "Google ML Kit", "React Native")),
	SkillGroup("Languages", listOf("TypeScript", "JavaScript", "Python", "Java", "HTML/CSS")),
	SkillGroup("Frontend", listOf("React", "Redux", "TanStack", "Vite", "Tailwind CSS")),
	SkillGroup("Backend", listOf("Spring Boot", "FastAPI", "Django", "REST APIs", "MongoDB", "LDAP")),
	SkillGroup("Cloud & DevOps", listOf("Kubernetes", "Helm", "Docker", "OpenShift / OKD", "AWS", "CI/CD")),
	SkillGroup("Observability", listOf("Grafana", "Loki", "Mimir", "Tempo")),
)
