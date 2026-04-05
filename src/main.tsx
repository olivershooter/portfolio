import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App'

gsap.registerPlugin(ScrollTrigger)

const rootElement = document.querySelector('#root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
	<StrictMode>
		<App />
	</StrictMode>
)
