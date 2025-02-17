import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

const Home = lazy(async () => import('pages/Home'))
const Contact = lazy(async () => import('pages/Contact'))

export default function Root() {
	return (
		<Suspense>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/contact' element={<Contact />} />
			</Routes>
		</Suspense>
	)
}
