import { Link } from 'react-router-dom';

type BrandProps = {
  linked?: boolean;
};

export default function Brand({ linked = false }: BrandProps) {
  const logo = <img className="brand-logo" src="/expense-splitter-logo.svg" alt="Expense Splitter" />;
  return linked
    ? <Link className="brand" to="/groups" aria-label="Expense Splitter home">{logo}</Link>
    : <span className="brand">{logo}</span>;
}
