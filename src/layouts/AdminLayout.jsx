import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '../styles/PortalLayout.css';

gsap.registerPlugin(useGSAP);

const AdminLayout = () => {
	const containerRef = React.useRef(null);
	useGSAP(() => {
		const tl = gsap.timeline();
		tl.fromTo('.portal-nav',
			{ y: -20, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
		)
			.fromTo('.portal-content',
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
				'-=0.3'
			);
	}, { scope: containerRef });

	return (
		<div className="portal-layout" ref={containerRef}>
			<nav className="portal-nav" style={{ borderBottomColor: 'var(--status-danger)' }}>
				<Link to="/" className="portal-brand">
					<Settings size={24} className="text-slate-600" />
					<span>System Admin</span>
				</Link>
				<div className="nav-links">
					<NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>System Config</NavLink>
				</div>
				<Link to="/" className="btn btn-ghost text-sm"><LogOut size={16} /> Logout</Link>
			</nav>
			<main className="portal-content"><Outlet /></main>
		</div>
	);
};
export default AdminLayout;
