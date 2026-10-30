import { Link } from 'react-router-dom';

type SiteFooterProps = { username?: string };

export default function SiteFooter({ username }: SiteFooterProps) {
  return <footer className="site-footer">
    <div className="site-footer-main">
      <Link className="site-footer-brand" to="/" aria-label="Expense Splitter home">
        <img src="/expense-splitter-logo.svg" alt="" />
        <span><strong>Expense Splitter</strong><small>A clearer way to share the everyday.</small></span>
      </Link>
      {username && <nav className="site-footer-nav" aria-label="Footer navigation">
        <Link to="/">Home</Link><Link to="/groups">Groups</Link><Link to="/account">Account</Link>
      </nav>}
    </div>
    <div className="site-footer-bottom"><span>Shared clearly · settled fairly</span>{username && <span>Signed in as {username}</span>}</div>
  </footer>;
}
