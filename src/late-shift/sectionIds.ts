export const SECTION_IDS = [
	'about',
	'android',
	'experience',
	'skills',
	'contact',
	'projects/screendle',
	'projects/candice',
	'projects/football'
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export function isSectionId(value: string): value is SectionId {
	return (SECTION_IDS as readonly string[]).includes(value)
}
