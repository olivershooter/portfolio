import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import QuickRead from './pages/QuickRead'

const LateShift = lazy(async () => import('./late-shift/LateShift'))

export default function App() {
	return (
		<Suspense
			fallback={
				<p className='p-8 font-mono text-ink-blue'>Switching on the lamp…</p>
			}
		>
			<Routes>
				<Route path='/' element={<Landing />} />
				<Route path='/quick' element={<QuickRead />} />
				<Route path='/late-shift/*' element={<LateShift />} />
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Suspense>
	)
}
