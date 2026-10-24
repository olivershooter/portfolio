plugins {
	kotlin("multiplatform") version "2.4.21"
	kotlin("plugin.compose") version "2.4.21"
}

// The pipeline creates a GitHub release named v<version> after deploying a new one (see CLAUDE.md)
version = "1.0.0"

repositories {
	mavenCentral()
	google()
}

kotlin {
	js {
		browser {
			commonWebpackConfig { outputFileName = "portfolio.js" }
			// No sandbox: CI runs the tests as root inside Docker, where Chrome refuses to start sandboxed
			testTask { useKarma { useChromeHeadlessNoSandbox() } }
		}
		binaries.executable()
	}

	sourceSets {
		jsMain.dependencies {
			implementation("org.jetbrains.compose.runtime:runtime:1.12.2")
			implementation("org.jetbrains.compose.html:html-core:1.12.2")
			implementation(npm("web-vitals", "6.2.3"))
		}
		jsTest.dependencies {
			implementation(kotlin("test"))
			implementation("org.jetbrains.compose.html:html-test-utils:1.12.2")
		}
	}
}
