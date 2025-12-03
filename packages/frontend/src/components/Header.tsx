import { Link, useLocation } from 'react-router-dom';

export function Header(): JSX.Element {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <img src="/chronicle.svg" alt="Chronicle" />
          Chronicle
        </Link>
        <nav className="nav">
          <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/projects" className={isActive('/projects') ? 'active' : ''}>
            Projects
          </Link>
          <Link to="/timeline" className={isActive('/timeline') ? 'active' : ''}>
            Timeline
          </Link>
        </nav>
      </div>
    </header>
  );
}
