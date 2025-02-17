import Navbar from 'components/NavBar'
import { BrowserRouter } from 'react-router-dom'
import Root from 'routes/Root'

export default function App() {
	return (
		<BrowserRouter>
			<Navbar />
			<Root />
		</BrowserRouter>
	)
}
