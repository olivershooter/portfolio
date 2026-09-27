import {
	currentRole,
	experience,
	getProject,
	mobileProjects,
	profile,
	projects,
	skills
} from '..'

const PLACEHOLDER = /todo|placeholder|lorem|your real bullets/i

function allStrings(value: unknown): string[] {
	if (typeof value === 'string') return [value]
	if (Array.isArray(value)) return value.flatMap(item => allStrings(item))
	if (value && typeof value === 'object')
		return Object.values(value).flatMap(item => allStrings(item))
	return []
}

describe('content', () => {
	it('positions Oliver as a Software & Android Engineer in Manchester', () => {
		expect(profile.title).toBe('Software & Android Engineer')
		expect(profile.location).toBe('Manchester, UK')
		expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]+$/)
	})

	it('has at least one bullet and a unique editor file for every role', () => {
		for (const role of experience)
			expect(role.bullets.length).toBeGreaterThan(0)
		const files = experience.map(role => role.file)
		expect(new Set(files).size).toBe(files.length)
	})

	it('treats the first role as current and mentions Android there', () => {
		expect(currentRole().isCurrent).toBe(true)
		expect(currentRole().org).toBe('Deloitte')
		expect(currentRole().summary).toMatch(/Kotlin/)
		expect(experience.filter(role => role.isCurrent)).toHaveLength(1)
	})

	it('gives every project a link, alt text, image size and https URLs', () => {
		for (const project of projects) {
			const links = Object.values(project.links)
			expect(links.length).toBeGreaterThan(0)
			for (const link of links) expect(link).toMatch(/^https:\/\//)
			expect(project.alt.length).toBeGreaterThan(20)
			expect(project.imageSize.width).toBeGreaterThan(0)
		}
	})

	it('finds projects by id and lists mobile work', () => {
		expect(getProject('candice').platform).toBe('android')
		expect(() => getProject('nope' as 'candice')).toThrow(/Unknown project/)
		expect(mobileProjects().map(project => project.id)).toEqual([
			'salah-times',
			'candice'
		])
	})

	it('lists Kotlin and Jetpack Compose among the skills', () => {
		const items = skills.flatMap(group => group.items)
		expect(items).toContain('Kotlin')
		expect(items).toContain('Jetpack Compose')
	})

	it('keeps every skill spine inside its accessible name', () => {
		for (const group of skills)
			expect(group.title.toLowerCase()).toContain(group.spine.toLowerCase())
	})

	it('contains no placeholder text anywhere', () => {
		const strings = allStrings({ profile, experience, projects, skills })
		expect(strings.filter(text => PLACEHOLDER.test(text))).toEqual([])
	})

	it('throws when no role is current', async () => {
		vi.resetModules()
		vi.doMock('../experience', () => ({ experience: [] }))
		const content = await import('..')
		expect(() => content.currentRole()).toThrow(/No current role/)
		vi.doUnmock('../experience')
	})
})
