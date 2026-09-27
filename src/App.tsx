import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import LateShiftUnavailable from './pages/LateShiftUnavailable'
import QuickRead from './pages/QuickRead'

// A failed chunk download shows a way forward instead of a blank page
const LateShift = lazy(async () =>
	import('./late-shift/LateShift').catch(() => ({
		default: LateShiftUnavailable
	}))
)

/** Each version starts at the top; moving between Late Shift sections keeps its own scroll. */
function ScrollToTop() {
	const version = useLocation().pathname.split('/').find(Boolean) ?? ''
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [version])
	return null
}

export default function App() {
	return (
		<Suspense
			fallback={
				<p className='p-8 font-mono text-ink-blue'>Switching on the lamp…</p>
			}
		>
			<ScrollToTop />
			<Routes>
				<Route path='/' element={<Landing />} />
				<Route path='/quick' element={<QuickRead />} />
				<Route path='/late-shift/*' element={<LateShift />} />
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Suspense>
	)
}
