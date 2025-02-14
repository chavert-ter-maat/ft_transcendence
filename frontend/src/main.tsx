import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './components/Login/Login.tsx'
// import Signup from './components/Signup/Signup.tsx'
// import TwoFAMain from './components/TwoFA/TwoFAMain.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* <Signup /> */}
    <Login />
    {/* <p>------------------</p> */}
    {/* <TwoFAMain /> */}
  </StrictMode>,
)
