import type { ReactNode } from "react";
import { Auth0Provider } from "@auth0/auth0-react";

type Auth0RootProps = { children: ReactNode };

export default function Auth0Root({ children }: Auth0RootProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId || !audience) {
    return (
      <main className="page-content auth-config-page">
        <section className="content-panel">
          <p className="eyebrow">Secure sign-in setup</p>
          <h1 className="compact-title">Auth0 configuration needed</h1>
          <p className="intro-copy">Set VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, and VITE_AUTH0_AUDIENCE in the frontend environment, then restart the app.</p>
        </section>
      </main>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="memory"
      useRefreshTokens
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
        scope: "openid profile email",
      }}
    >
      {children}
    </Auth0Provider>
  );
}
