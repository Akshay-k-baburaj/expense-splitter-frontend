import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { getCurrentUser, getUserErrorMessage } from './features/users/userService'
import UserRegistrationPage from './features/users/UserRegistrationPage'
import Brand from './components/Brand'
import SiteFooter from './components/SiteFooter'
import { setAccessTokenProvider } from './services/api'
import type { UserResponse } from './types/user'
import './App.css'

type ProfileState =
  | { subject: string; status: 'loading' }
  | { subject: string; status: 'missing' }
  | { subject: string; status: 'ready'; profile: UserResponse }
  | { subject: string; status: 'error'; message: string }

export type AuthenticatedOutletContext = {
  profile: UserResponse
  onProfileUpdated: (profile: UserResponse) => void
}

function App() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0()
  const [profileState, setProfileState] = useState<ProfileState>({ subject: '', status: 'loading' })
  const [retry, setRetry] = useState(0)
  const subject = user?.sub ?? ''
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE
  const currentProfileState = profileState.subject === subject ? profileState : { subject, status: 'loading' as const }

  useEffect(() => {
    if (!isAuthenticated || !audience) {
      setAccessTokenProvider(null)
      return
    }
    setAccessTokenProvider(async () => {
      const token = await getAccessTokenSilently({ authorizationParams: { audience } })
      if (!token) throw new Error('Auth0 did not return an API access token.')
      return token
    })
    return () => setAccessTokenProvider(null)
  }, [audience, getAccessTokenSilently, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !subject) return
    let active = true
    getCurrentUser()
      .then((profile) => { if (active) setProfileState({ subject, status: 'ready', profile }) })
      .catch((error: unknown) => {
        if (!active) return
        if (isAxiosNotFound(error)) setProfileState({ subject, status: 'missing' })
        else setProfileState({ subject, status: 'error', message: getUserErrorMessage(error) })
      })
    return () => { active = false }
  }, [isAuthenticated, retry, subject])

  function signOut() {
    setAccessTokenProvider(null)
    void logout({ logoutParams: { returnTo: window.location.origin } })
  }

  function onProfileUpdated(profile: UserResponse) {
    setProfileState({ subject, status: 'ready', profile })
  }

  if (isLoading) {
    return <div className="app-shell"><header className="site-header"><Brand /></header><main className="page-content"><p className="loading-state" role="status">Checking your sign-in…</p></main><SiteFooter /></div>
  }

  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <header className="site-header"><Brand /></header>
        <main className="page-content auth-landing">
          <div className="page-intro"><p className="eyebrow">A more considered way to share</p><h1>Good plans<br /><em>are shared.</em></h1><p className="intro-copy">Keep the costs of everyday life clear, fair, and easy to settle with the people around you.</p><div className="auth-values" aria-label="Expense Splitter benefits"><span>Shared groups</span><span>Clear contributions</span><span>Less awkward settling up</span></div></div>
          <section className="content-panel auth-panel" aria-label="Sign in">
            <p className="eyebrow">Your shared space</p>
            <h2>Welcome back.</h2>
            <p className="auth-panel-copy">Sign in to pick up where your group left off.</p>
            <button className="primary-button" type="button" onClick={() => void loginWithRedirect()}>Sign in</button>
            <button className="secondary-button auth-signup" type="button" onClick={() => void loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}>Create an account <span aria-hidden="true">↗</span></button>
            <p className="auth-security-note"><span aria-hidden="true">●</span> Secure sign-in powered by Auth0</p>
          </section>
          <section className="guest-service-overview" aria-labelledby="guest-service-title">
            <div><p className="eyebrow">One shared picture</p><h2 id="guest-service-title">Spend together.<br />See it clearly.</h2><p>Expense Splitter keeps the group, the bills, and the balance in one place.</p></div>
            <ul><li><strong>Groups</strong><span>Start a shared space and invite people with a code.</span></li><li><strong>Expenses</strong><span>Split costs equally or enter each person’s amount.</span></li><li><strong>Balances</strong><span>See who owes what and record payments already made.</span></li></ul>
            <button type="button" className="guest-service-link" onClick={() => void loginWithRedirect()}>Sign in to open the service <span aria-hidden="true">→</span></button>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (currentProfileState.status === 'loading') {
    return <div className="app-shell"><header className="site-header"><Brand /></header><main className="page-content"><p className="loading-state" role="status">Loading your profile…</p></main><SiteFooter /></div>
  }

  if (currentProfileState.status === 'missing') {
    return (
      <div className="app-shell">
        <header className="site-header"><Brand /><button className="text-button signout-button" type="button" onClick={signOut}>Sign out</button></header>
        <UserRegistrationPage onCreated={onProfileUpdated} onSignOut={signOut} email={user?.email} />
        <SiteFooter />
      </div>
    )
  }

  if (currentProfileState.status === 'error') {
    return (
      <div className="app-shell"><header className="site-header"><Brand linked /><button className="text-button signout-button" type="button" onClick={signOut}>Sign out</button></header><main className="page-content"><section className="content-panel"><p className="eyebrow">Profile check</p><h1 className="compact-title">We couldn’t load your account.</h1><p className="form-error" role="alert">{currentProfileState.message}</p><button className="secondary-button retry-button" type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></section></main><SiteFooter /></div>
    )
  }

  const profile = currentProfileState.profile
  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand linked />
        <nav aria-label="Main navigation" className="main-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/groups" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Groups</NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Account</NavLink>
          <button className="nav-link signout-link" type="button" onClick={signOut}>Sign out</button>
        </nav>
      </header>
      <Outlet context={{ profile, onProfileUpdated } satisfies AuthenticatedOutletContext} />
      <SiteFooter username={profile.username} />
    </div>
  )
}

function isAxiosNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('response' in error)) return false
  const response = error.response
  return typeof response === 'object' && response !== null && 'status' in response && response.status === 404
}

export default App
