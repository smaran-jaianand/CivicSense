import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ClipboardList, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '../../styles/LandingPage.css';

gsap.registerPlugin(useGSAP);


const LandingPage = () => {
	const containerRef = React.useRef(null);
	const { contextSafe } = useGSAP({ scope: containerRef });

	useGSAP(() => {
		const tl = gsap.timeline();

		// Header Animation - Set initial state explicitly
		tl.fromTo('.landing-header',
			{ y: -50, opacity: 0 },
			{ y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
		)
			.fromTo('.logo-icon',
				{ scale: 0, rotation: -180 },
				{ scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' },
				'-=0.5'
			)
			// Cards Stagger - Ensure opacity is cleared or set to 1
			// Cards Stagger
			.fromTo('.flip-card-container',
				{ y: 100, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
				'-=0.3'
			);
	}, { scope: containerRef });



	return (
		<div className="landing-container" ref={containerRef}>
			<header className="landing-header">
				<div className="logo-area">
					<div className="logo-icon">
						<ShieldCheck size={32} color="white" />
					</div>
					<h1>SymbiConnect</h1>
				</div>
				<p className="subtitle">Operational Management System for Modern Civic Administration</p>
			</header>

			<main className="portal-grid">
				{/* Citizen Card */}
				<div className="flip-card-container">
					<div className="flip-card-inner">
						{/* Front Side - Matches original design */}
						<div className="portal-card-face portal-card-front citizen">
							<div className="icon-wrapper">
								<MapPin size={40} />
							</div>
							<h2>Citizen Portal</h2>
							<p>Report issues, track progress, and give feedback.</p>
							<span className="btn-text">Hover for Options &rarr;</span>
						</div>
						{/* Back Side - Navigation Links */}
						<div className="portal-card-face portal-card-back">
							<h3>Citizen Actions</h3>
							<div className="link-stack">
								<Link to="/citizen" className="flip-link">🏠 Home</Link>
								<Link to="/citizen/report" className="flip-link">📢 Report Issue</Link>
								<Link to="/citizen/my-reports" className="flip-link">📄 My Reports</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Staff Card */}
				<div className="flip-card-container">
					<div className="flip-card-inner">
						<div className="portal-card-face portal-card-front staff">
							<div className="icon-wrapper">
								<ClipboardList size={40} />
							</div>
							<h2>City Staff</h2>
							<p>View assigned tasks, update status, and resolve issues.</p>
							<span className="btn-text">Hover for Options &rarr;</span>
						</div>
						<div className="portal-card-face portal-card-back">
							<h3>Staff Access</h3>
							<div className="link-stack">
								<Link to="/staff" className="flip-link">📊 Dashboard</Link>
								<Link to="/staff/map" className="flip-link">🗺️ Field Map</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Supervisor Card */}
				<div className="flip-card-container">
					<div className="flip-card-inner">
						<div className="portal-card-face portal-card-front supervisor">
							<div className="icon-wrapper">
								<BarChart3 size={40} />
							</div>
							<h2>City Supervisor</h2>
							<p>Monitor department performance and approve escalations.</p>
							<span className="btn-text">Hover for Options &rarr;</span>
						</div>
						<div className="portal-card-face portal-card-back">
							<h3>Oversight</h3>
							<div className="link-stack">
								<Link to="/supervisor" className="flip-link">📈 Overview</Link>
								<Link to="/supervisor/map" className="flip-link">📍 Heatmap</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Admin Card */}
				<div className="flip-card-container">
					<div className="flip-card-inner">
						<div className="portal-card-face portal-card-front admin">
							<div className="icon-wrapper">
								<Settings size={40} />
							</div>
							<h2>Administrator</h2>
							<p>Configure system settings, categories, and user roles.</p>
							<span className="btn-text">Hover for Options &rarr;</span>
						</div>
						<div className="portal-card-face portal-card-back">
							<h3>Administration</h3>
							<div className="link-stack">
								<Link to="/admin" className="flip-link">⚙️ Settings</Link>
							</div>
						</div>
					</div>
				</div>
			</main>

			<footer className="landing-footer">
				<p>&copy; 2026 SymbiConnect System. Development Build.</p>
			</footer>
		</div>
	);
};

export default LandingPage;
