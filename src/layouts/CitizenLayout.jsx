import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import '../styles/PortalLayout.css';

const CitizenLayout = () => {
	return (
		<div className="portal-layout">
			<nav className="portal-nav">
				<Link to="/" className="portal-brand">
					<ShieldCheck size={24} />
					<span>CivicPulse Connect</span>
				</Link>

				<div className="nav-links">
					<NavLink to="/citizen" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						Dashboard
					</NavLink>
					<NavLink to="/citizen/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						Report Complaint
					</NavLink>
					<NavLink to="/citizen/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						My History
					</NavLink>
					<NavLink to="/citizen/forum" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						Community Forum
					</NavLink>
				</div>

				<Link to="/" className="btn btn-ghost text-sm">
					<LogOut size={16} style={{ marginRight: '0.5rem' }} />
					Exit
				</Link>
			</nav>

			<main className="portal-content">
				<Outlet />
			</main>
		</div>
	);
};

export default CitizenLayout;
