plugins {
	kotlin("multiplatform") version "2.4.21"
	kotlin("plugin.compose") version "2.4.21"
}

repositories {
	mavenCentral()
	google()
}

kotlin {
	js {
		browser {
			commonWebpackConfig { outputFileName = "portfolio.js" }
			testTask { useKarma { useChromeHeadless() } }
		}
		binaries.executable()
	}

	sourceSets {
		jsMain.dependencies {
			implementation("org.jetbrains.compose.runtime:runtime:1.12.1")
			implementation("org.jetbrains.compose.html:html-core:1.12.1")
		}
		jsTest.dependencies {
			implementation(kotlin("test"))
			implementation("org.jetbrains.compose.html:html-test-utils:1.12.1")
		}
	}
}

// Caddy serves dist/, the same folder the old Vite build wrote to
tasks.register<Sync>("dist") {
	from(tasks.named("jsBrowserDistribution"))
	into(layout.projectDirectory.dir("dist"))
}
