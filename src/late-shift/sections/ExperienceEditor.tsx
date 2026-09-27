import { useRef, useState, type KeyboardEvent } from 'react'
import { experience, profile, type Role } from '../../content'

type EditorFile =
	| {
			readonly kind: 'note'
			readonly file: string
			readonly title: string
			readonly text: string
	  }
	| { readonly kind: 'role'; readonly file: string; readonly role: Role }

const [filmBeat, mscBeat] = profile.story

const FILES: readonly EditorFile[] = [
	...experience.map(role => ({ kind: 'role' as const, file: role.file, role })),
	{
		kind: 'note',
		file: 'msc_birmingham.md',
		title: mscBeat.title,
		text: mscBeat.text
	},
	{
		kind: 'note',
		file: 'film_2014.mov',
		title: filmBeat.title,
		text: filmBeat.text
	}
]

const KEY_STEP: Readonly<Record<string, number>> = {
	ArrowDown: 1,
	ArrowRight: 1,
	ArrowUp: -1,
	ArrowLeft: -1
}

function FileBody({ entry }: { readonly entry: EditorFile }) {
	if (entry.kind === 'note') {
		return (
			<>
				<h2>{entry.title}</h2>
				<p>{entry.text}</p>
			</>
		)
	}
	const { role } = entry
	return (
		<>
			<p className='editor-when'>{`${role.period} · ${role.org}`}</p>
			<h2>{role.title}</h2>
			<p className='editor-code' aria-hidden='true'>
				<b>fun</b> <em>work</em>() = listOf(
			</p>
			<ul className='editor-bullets'>
				{role.bullets.map(bullet => (
					<li key={bullet}>{bullet}</li>
				))}
			</ul>
			<p className='editor-code' aria-hidden='true'>
				)
			</p>
			<ul className='skin-chips' aria-label='Tech stack'>
				{role.stack.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</>
	)
}

export default function ExperienceEditor() {
	const [selected, setSelected] = useState(0)
	const tabReferences = useRef<(HTMLButtonElement | null)[]>([])
	const onSelect = (index: number) => {
		const next = (index + FILES.length) % FILES.length
		setSelected(next)
		tabReferences.current[next]?.focus()
	}
	const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === 'Home') onSelect(0)
		else if (event.key === 'End') onSelect(FILES.length - 1)
		else if (event.key in KEY_STEP) onSelect(selected + KEY_STEP[event.key])
		else return
		event.preventDefault()
	}
	const entry = FILES[selected]
	return (
		<div className='editor'>
			<div
				className='editor-explorer'
				role='tablist'
				aria-label='Explorer'
				aria-orientation='vertical'
			>
				{FILES.map((file, index) => {
					const onClick = () => onSelect(index)
					return (
						<button
							key={file.file}
							ref={element => {
								tabReferences.current[index] = element
							}}
							type='button'
							role='tab'
							id={`editor-tab-${index}`}
							aria-selected={index === selected}
							aria-controls='editor-panel'
							tabIndex={index === selected ? 0 : -1}
							className='editor-tab'
							onClick={onClick}
							onKeyDown={onTabKeyDown}
						>
							{file.file}
						</button>
					)
				})}
			</div>
			<div
				className='editor-pane'
				role='tabpanel'
				id='editor-panel'
				aria-labelledby={`editor-tab-${selected}`}
				tabIndex={0}
			>
				<FileBody entry={entry} />
			</div>
		</div>
	)
}
