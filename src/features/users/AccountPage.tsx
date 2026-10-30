import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import type { AuthenticatedOutletContext } from '../../App'
import { userSchema, type UserFormValues } from './userSchema'
import { deactivateCurrentUser, getUserErrorMessage, updateCurrentUser } from './userService'

export default function AccountPage() {
  const { profile, onProfileUpdated } = useOutletContext<AuthenticatedOutletContext>()
  const { logout } = useAuth0()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [deactivationError, setDeactivationError] = useState('')
  const [notice, setNotice] = useState('')
  const [deactivating, setDeactivating] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema), defaultValues: { username: profile.username },
  })

  async function save(values: UserFormValues) {
    setError(''); setNotice('')
    try { onProfileUpdated(await updateCurrentUser(values)); setNotice('Your username was updated.') }
    catch (requestError: unknown) { setError(getUserErrorMessage(requestError)) }
  }

  async function deactivate() {
    if (!window.confirm('Deactivate your account? You will lose access to groups, while existing expense history is retained.')) return
    setDeactivationError('')
    setDeactivating(true)
    try {
      await deactivateCurrentUser()
      await logout({ logoutParams: { returnTo: window.location.origin } })
      navigate('/')
    } catch (requestError: unknown) { setDeactivationError(getUserErrorMessage(requestError)); setDeactivating(false) }
  }

  return <main className="page-content account-page">
    <div className="account-page-heading"><div><p className="eyebrow">Personal settings</p><h1 className="compact-title">Your account<span className="title-period">.</span></h1><p className="intro-copy">The details attached to your Expense Splitter profile.</p></div><span className="account-heading-mark" aria-hidden="true">ES</span></div>
    <section className="account-profile-card" aria-labelledby="account-title">
      <div className="account-avatar" aria-hidden="true">{profile.username.slice(0, 2).toUpperCase()}</div>
      <div className="account-profile-copy"><p className="eyebrow">Profile</p><h2 id="account-title">{profile.username}</h2><p>{profile.email}</p></div>
      <span className="verified-status"><span aria-hidden="true">✓</span> Verified email</span>
    </section>
    <div className="account-settings-grid">
      <section className="content-panel account-edit-panel" aria-labelledby="username-title">
        <p className="eyebrow">Public identity</p><h2 id="username-title">Username</h2>
        <p className="account-section-copy">This is the name people see in your shared groups.</p>
        <form className="group-form" onSubmit={handleSubmit(save)} noValidate>
          <div className="form-field"><label htmlFor="account-username">Your username</label><input id="account-username" maxLength={50} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'account-username-error' : undefined} {...register('username')} />{errors.username && <p id="account-username-error" className="field-error">{errors.username.message}</p>}</div>
          {notice && <p className="form-success" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save username'}</button>
        </form>
      </section>
      <section className="account-security-card" aria-labelledby="email-title">
        <p className="eyebrow">Sign-in details</p><h2 id="email-title">Email address</h2>
        <p className="account-email-value">{profile.email}</p>
        <p className="account-section-copy">Your email is verified and managed securely by Auth0. To change it, update it through your sign-in provider.</p>
        <div className="account-id-row"><span>Profile ID</span><strong>{profile.id}</strong></div>
      </section>
    </div>
    <section className="account-danger-zone" aria-labelledby="deactivate-title">
      <div><p className="eyebrow">Account access</p><h2 id="deactivate-title">Deactivate account</h2><p>Deactivation ends access to this profile. Historical group records are retained.</p></div>
      <button className="danger-button" type="button" disabled={deactivating} onClick={() => void deactivate()}>{deactivating ? 'Deactivating…' : 'Deactivate account'}</button>
      {deactivationError && <p className="form-error" role="alert">{deactivationError}</p>}
    </section>
  </main>
}
