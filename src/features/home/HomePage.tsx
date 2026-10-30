import { Link } from 'react-router-dom';

const features = [
  { number: '01', title: 'Make a shared space', copy: 'Create a group for a trip, a home, or the everyday plans you share. Choose its currency and invite people with a private code.' },
  { number: '02', title: 'Keep every cost clear', copy: 'Record who paid, choose an equal split, or enter each person’s share when costs are different.' },
  { number: '03', title: 'Know where you stand', copy: 'See what each person owes and record payments after they happen, so the group balance stays current.' },
];

export default function HomePage() {
  return <main className="page-content home-page">
    <section className="home-hero">
      <div className="home-hero-copy">
        <p className="eyebrow">Expense Splitter · shared, simply</p>
        <h1 className="home-title">Good plans<br /><em>are shared.</em></h1>
        <p className="intro-copy">A calm, clear place to organize group expenses, keep track of who paid, and settle up without guesswork.</p>
        <div className="home-actions"><Link className="primary-button home-primary-link" to="/groups">Open my groups <span aria-hidden="true">→</span></Link><Link className="home-secondary-link" to="/groups/new">Create a group</Link></div>
      </div>
      <aside className="home-note"><span className="home-note-mark" aria-hidden="true">ES</span><p className="eyebrow">A clearer way to share</p><p>From the first shared bill to the last payment, everyone can see the same simple record.</p><Link to="/groups">Go to the service <span aria-hidden="true">↗</span></Link></aside>
    </section>
    <section className="home-how" aria-labelledby="home-how-title">
      <div className="home-section-heading"><p className="eyebrow">How it works</p><h2 id="home-how-title">Made for the plans<br />you make together.</h2></div>
      <div className="home-feature-list">{features.map((feature) => <article className="home-feature" key={feature.number}><span>{feature.number}</span><h3>{feature.title}</h3><p>{feature.copy}</p></article>)}</div>
    </section>
  </main>;
}
