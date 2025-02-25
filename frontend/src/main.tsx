import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './App.css'
import Login from './components/Login/Login.tsx'
import Signup from './components/Signup/Signup.tsx'
import TwoFADashboard from './components/TwoFA/TwoFADashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    {/* <Signup /> */}
    {/* <Login /> */}
    {/* <p>------------------</p> */}
    <TwoFADashboard />
  </StrictMode>,
)
