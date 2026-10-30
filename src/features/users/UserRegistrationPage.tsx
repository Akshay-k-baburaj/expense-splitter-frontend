import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCurrentUser, getUserErrorMessage } from "./userService";
import { userSchema, type UserFormValues } from "./userSchema";
import type { UserResponse } from "../../types/user";

type UserRegistrationPageProps = {
  onCreated: (user: UserResponse) => void;
  onSignOut: () => void;
  email?: string;
};

export default function UserRegistrationPage({ onCreated, onSignOut, email }: UserRegistrationPageProps) {
  const [apiError, setApiError] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { username: "" },
  });

  async function onSubmit(values: UserFormValues) {
    setApiError("");
    setVerificationRequired(false);
    try {
      onCreated(await createCurrentUser(values));
    } catch (error: unknown) {
      setApiError(getUserErrorMessage(error));
      setVerificationRequired(isForbidden(error));
    }
  }

  return (
    <main className="page-content registration-page">
      <div className="page-intro">
        <p className="eyebrow">Verified sign-in</p>
        <h1>Make this space<br /><em>yours.</em></h1>
        <p className="intro-copy">Choose a username to finish setting up your Expense Splitter profile. Your verified email is managed by Auth0.</p>
      </div>
      <section className="registration-card" aria-labelledby="profile-title">
        <h2 id="profile-title">Your profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" maxLength={50} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? "username-error" : undefined} {...register("username")} />
            {errors.username && <p id="username-error" className="field-error">{errors.username.message}</p>}
          </div>
          {verificationRequired ? (
            <div className="verification-notice" role="alert">
              <p className="eyebrow">One more step</p>
              <h3>Verify your email</h3>
              <p>Auth0 sent a verification link{email ? <> to <strong>{email}</strong></> : " to your email address"}. Check your inbox and spam folder, then click the link.</p>
              <p>After verifying, sign out here and sign back in. That refreshes your sign-in so you can finish creating your profile.</p>
              <button className="secondary-button" type="button" onClick={onSignOut}>Sign out</button>
            </div>
          ) : apiError && <p className="form-error" role="alert">{apiError}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Setting up…" : "Finish setup"}</button>
        </form>
      </section>
    </main>
  );
}

function isForbidden(error: unknown): boolean {
  return typeof error === "object" && error !== null && "response" in error
    && typeof error.response === "object" && error.response !== null
    && "status" in error.response && error.response.status === 403;
}
