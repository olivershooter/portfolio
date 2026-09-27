import { experience } from './experience'
import { projects } from './projects'
import type { Project, ProjectId, Role } from './types'

export { experience } from './experience'
export { profile } from './profile'
export { projects } from './projects'
export { skills } from './skills'
export type {
	Profile,
	Project,
	ProjectId,
	Role,
	SkillGroup,
	StoryBeat
} from './types'

export function currentRole(): Role {
	const role = experience.find(item => item.isCurrent)
	if (!role) throw new Error('No current role in content/experience.ts')
	return role
}

export function getProject(id: ProjectId): Project {
	const project = projects.find(item => item.id === id)
	if (!project) throw new Error(`Unknown project: ${id}`)
	return project
}

export function mobileProjects(): readonly Project[] {
	return projects.filter(project => project.platform !== 'web')
}
