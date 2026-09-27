import type { ReactElement } from 'react'
import { getProject } from '../../content'
import type { SectionId } from '../sectionIds'
import AboutFilm from './AboutFilm'
import AndroidScreen from './AndroidScreen'
import ContactPostcard from './ContactPostcard'
import ExperienceEditor from './ExperienceEditor'
import ProjectZine from './ProjectZine'
import SkillsShelf from './SkillsShelf'

export interface SectionEntry {
	readonly title: string
	readonly kicker: string
	readonly skin: 'editor' | 'film' | 'phone' | 'postcard' | 'shelf' | 'zine'
	readonly render: () => ReactElement
}

export const SECTIONS: Readonly<Record<SectionId, SectionEntry>> = {
	about: {
		title: 'About me',
		kicker: '01 / From film to code',
		skin: 'film',
		render: () => <AboutFilm />
	},
	android: {
		title: 'Android',
		kicker: '02 / Kotlin · Jetpack Compose',
		skin: 'phone',
		render: () => <AndroidScreen />
	},
	experience: {
		title: 'Experience',
		kicker: '03 / Where I’ve worked',
		skin: 'editor',
		render: () => <ExperienceEditor />
	},
	skills: {
		title: 'Skills',
		kicker: '04 / The toolbox',
		skin: 'shelf',
		render: () => <SkillsShelf />
	},
	contact: {
		title: 'Contact',
		kicker: '05 / Say hello',
		skin: 'postcard',
		render: () => <ContactPostcard />
	},
	'projects/football': {
		title: getProject('football').name,
		kicker: 'Project P1 · Web',
		skin: 'zine',
		render: () => <ProjectZine projectId='football' />
	},
	'projects/screendle': {
		title: getProject('screendle').name,
		kicker: 'Project P2 · Web',
		skin: 'zine',
		render: () => <ProjectZine projectId='screendle' />
	},
	'projects/candice': {
		title: getProject('candice').name,
		kicker: 'Project P3 · Android',
		skin: 'zine',
		render: () => <ProjectZine projectId='candice' />
	}
}
