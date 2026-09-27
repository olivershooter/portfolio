import { useState } from 'react'
import { skills } from '../../content'

export default function SkillsShelf() {
	const [open, setOpen] = useState(0)
	return (
		<div className='shelf'>
			{skills.map((group, index) => {
				const isOpen = open === index
				const panelId = `shelf-panel-${index}`
				const onToggle = () => setOpen(index)
				return (
					<div
						key={group.title}
						className={`shelf-book${isOpen ? ' is-open' : ''}`}
					>
						<button
							type='button'
							className='shelf-spine'
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={onToggle}
						>
							<span aria-hidden='true'>{group.spine}</span>
							<span className='sr-only'>{group.title}</span>
						</button>
						<ul
							id={panelId}
							className='shelf-items'
							aria-label={group.title}
							hidden={!isOpen}
						>
							{group.items.map(item => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				)
			})}
		</div>
	)
}
