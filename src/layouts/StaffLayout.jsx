import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { HardHat, LogOut } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '../styles/PortalLayout.css';

gsap.registerPlugin(useGSAP);

const StaffLayout = () => {
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
			<nav className="portal-nav" style={{ borderBottomColor: 'var(--status-assigned)' }}> {/* Amber border for staff */}
				<Link to="/" className="portal-brand">
					<HardHat size={24} className="text-amber-600" />
					<span>CityOps Staff</span>
				</Link>

				<div className="nav-links">
					<NavLink to="/staff" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						Task Board
					</NavLink>
					<NavLink to="/staff/completed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						Completed
					</NavLink>
					<NavLink to="/staff/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
						Personnel
					</NavLink>
				</div>

				<Link to="/" className="btn btn-ghost text-sm">
					<LogOut size={16} style={{ marginRight: '0.5rem' }} />
					Exit Station
				</Link>
			</nav>

			<main className="portal-content">
				<Outlet />
			</main>
		</div>
	);
};

export default StaffLayout;
