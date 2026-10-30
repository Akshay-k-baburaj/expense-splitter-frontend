import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './app/router'
import Auth0Root from './auth/Auth0Root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Root>
      <AppRouter />
    </Auth0Root>
  </StrictMode>,
)
