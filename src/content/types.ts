export interface StoryBeat {
	readonly year: string
	readonly title: string
	readonly text: string
}

export interface Profile {
	readonly name: string
	readonly title: string
	readonly location: string
	readonly email: string
	readonly shortBio: string
	readonly contactMessage: string
	readonly links: {
		readonly github: string
		readonly site: string
		readonly linkedin?: string
	}
	readonly story: readonly StoryBeat[]
}

export interface Role {
	readonly id: string
	readonly title: string
	readonly org: string
	readonly period: string
	readonly isCurrent: boolean
	readonly summary: string
	readonly bullets: readonly string[]
	readonly stack: readonly string[]
	readonly file: string
}

export type ProjectId = 'candice' | 'football' | 'salah-times' | 'screendle'

export interface Project {
	readonly id: ProjectId
	readonly name: string
	readonly tagline: string
	readonly description: string
	readonly stack: readonly string[]
	readonly platform: 'android' | 'mobile' | 'web'
	readonly links: {
		readonly live?: string
		readonly appStore?: string
		readonly playStore?: string
		readonly github?: string
	}
	readonly image: string
	readonly imageSize: { readonly width: number; readonly height: number }
	readonly alt: string
}

export interface SkillGroup {
	readonly title: string
	readonly spine: string
	readonly items: readonly string[]
}
