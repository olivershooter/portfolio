import {
	createContext,
	PropsWithChildren,
	useCallback,
	useMemo,
	useState
} from 'react'

interface ThemeContextProperties {
	theme: 'dark' | 'light'
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProperties>({
	theme: 'light',
	toggleTheme: () => {}
})

const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [theme, setTheme] = useState<'dark' | 'light'>('light')

	const toggleTheme = useCallback(() => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)
		// Explicitly add/remove the dark-mode class based on the new theme
		document.body.classList.toggle('dark-mode', newTheme === 'dark')
	}, [theme])

	const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { ThemeContext, ThemeProvider }
