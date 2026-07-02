import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import './styles/app.css'

function App() {
  return <RouterProvider router={router} />
}

export default App
