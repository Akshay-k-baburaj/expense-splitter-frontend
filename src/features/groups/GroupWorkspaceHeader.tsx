import { Link } from 'react-router-dom';
import type { GroupResponse } from '../../types/group';

type GroupWorkspaceHeaderProps = { group: GroupResponse; active: 'expenses' | 'balances' | 'settings' };

export default function GroupWorkspaceHeader({ group, active }: GroupWorkspaceHeaderProps) {
  const basePath = `/groups/${group.id}`;
  return <>
    <section className="group-hero" aria-labelledby="group-title">
      <div className="group-hero-meta"><span>GROUP {group.id.toString().padStart(2, '0')}</span><div className="group-hero-actions"><span className="group-access-pill">{group.viewerIsOwner ? 'You’re the owner' : 'Member'}</span><Link className="group-hero-settings" to={`${basePath}/settings`} aria-label="Open group settings"><span aria-hidden="true">⚙</span> Settings</Link></div></div>
      <h1 id="group-title">{group.groupName}</h1>
      {group.description && <p>{group.description}</p>}
      <span className="group-hero-mark" aria-hidden="true">ES</span>
    </section>
    <nav className="group-workspace-tabs" aria-label="Group pages">
      <Link className={active === 'expenses' ? 'group-workspace-tab active' : 'group-workspace-tab'} to={basePath}>Expenses</Link>
      <Link className={active === 'balances' ? 'group-workspace-tab active' : 'group-workspace-tab'} to={`${basePath}/balances`}>Balances &amp; settlements</Link>
      {active === 'settings' && <span className="group-workspace-tab active" aria-current="page">Settings</span>}
    </nav>
  </>;
}
