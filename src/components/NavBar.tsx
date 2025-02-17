import Divider from 'components/Divider'
import ThemeToggle from 'components/ThemeToggle'
import { ThemeContext } from 'context/ThemeContext'
import { useContext } from 'react'

const Navbar = () => {
	const { theme } = useContext(ThemeContext)

	return (
		<nav
			className={`w-full  pb-4 pl-8 pr-8 pt-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
		>
			<div className='flex justify-between'>
				{/* <div className='ml-28 mt-2 flex'>
					<div className='flex '>
						<Link
							to='/'
							className={`mr-4 font-bold  ${theme === 'light' ? 'hover:text-gray-600' : 'hover:text-gray-400'}`}
						>
							HOME
						</Link>
						<Link
							to='/contact'
							className={`ml-4 font-bold  ${theme === 'light' ? 'hover:text-gray-600' : 'hover:text-gray-400'}`}
						>
							CONTACT
						</Link>
					</div>
				</div> */}
				<div className='mr-8 mt-2'>
					<ThemeToggle />
				</div>
			</div>
			<div className='mt-1 flex justify-center'>
				<Divider />
			</div>
		</nav>
	)
}
export default Navbar
