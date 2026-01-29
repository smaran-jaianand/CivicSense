import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Home } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const ReportSuccess = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// 1. Persist Ref ID: Retrieve from state or generate a stable one for this session if missing
	const [refId] = React.useState(() => {
		return location.state?.refId || Math.floor(Math.random() * 900000) + 100000;
	});

	const containerRef = React.useRef(null);
	// circleRef and checkRef are no longer needed for the new animation

	useGSAP(() => {
		const tl = gsap.timeline();

		// Initial State
		tl.set(containerRef.current, { opacity: 0 })
			.set('.success-card', { scale: 0.5, opacity: 0 })
			.set('.icon-circle-bg', { scale: 0, opacity: 0 })
			// Prepare Draw Animation: length of checkmark is approx 30
			.set('.icon-check-path', { strokeDasharray: 30, strokeDashoffset: 30 })

			// 1. Fade In Overlay
			.to(containerRef.current, { opacity: 1, duration: 0.3 })

			// 2. Card Elastic Stamp
			.to('.success-card', {
				scale: 1,
				opacity: 1,
				duration: 0.8,
				ease: 'elastic.out(1, 0.6)'
			})

			// 3. Green Circle Scale Up
			.to('.icon-circle-bg', {
				scale: 1,
				opacity: 1,
				duration: 0.5,
				ease: 'back.out(1.7)'
			}, '-=0.4')

			// 4. Checkmark Draw (Stroke Animation)
			.to('.icon-check-path', {
				strokeDashoffset: 0,
				duration: 0.4,
				ease: 'power2.out'
			}, '-=0.1')

			// 5. Content Slide Up
			.fromTo('.success-card-content',
				{ y: 15, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.2'
			);

	}, { scope: containerRef });

	return (
		<div ref={containerRef} className="min-h-screen bg-gray-50/50 backdrop-blur-sm flex flex-col items-center justify-center p-4">

			{/* Card - Width standardized to 400px based on user preference */}
			<div
				className="success-card bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center border relative overflow-hidden"
				style={{ width: '100%', maxWidth: '400px', flex: 'none' }} // Constrain to 400px
			>
				{/* Decorative Top Gradient */}
				<div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-50 to-transparent opacity-60 pointer-events-none" />

				{/* Animation Container - Balanced Medium Size & Robust Centering */}
				<div
					className="w-full flex justify-center mb-8 relative z-10" // Increased mb from 5 to 8
				>
					<div
						className="relative flex items-center justify-center"
						style={{ width: '80px', height: '80px', flex: 'none' }} // Force 80x80
					>
						{/* 1. Background Circle - Force Light Green & Circle */}
						<div
							className="icon-circle-bg absolute inset-0 flex items-center justify-center shadow-md"
							style={{
								width: '80px',
								height: '80px',
								backgroundColor: '#dcfce7', // bg-green-100 hex
								borderRadius: '9999px', // Force Circle
								border: '4px solid white'
							}}
						>
						</div>

						{/* 2. Checkmark SVG - Force Green */}
						<svg
							className="icon-check relative z-10"
							fill="none"
							viewBox="0 0 24 24"
							stroke="#16a34a" // text-green-600 hex
							strokeWidth="3"
							width="40"
							height="40"
							style={{ width: '40px', height: '40px' }}
						>
							<path
								className="icon-check-path" // Target for animation
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				</div>
				{/* Content */}
				<div className="success-card-content relative z-11 flex flex-col gap-8 text-center">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">Report Sent!</h1>
						<p className="text-gray-500 text-sm leading-relaxed">
							Your issue has been successfully logged.
						</p>
					</div>
					<br />
					{/* Ref ID Box - Slimmer Profile */}
					<div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-300">
						<div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">REFERENCE ID</div>
						<div className="text-xl font-mono font-bold tracking-wider text-gray-800">
							#{refId || '------'}
						</div>
					</div>
					<br />
					<div className="flex flex-col gap-3">
						<Link to="/citizen" className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm rounded-xl shadow-lg shadow-green-500/20">
							<Home size={18} />
							Done
						</Link>
						<button className="btn btn-ghost w-full text-xs text-muted hover:bg-transparent" onClick={() => alert("Screenshot saved!")}>
							Save Receipt
						</button>
					</div>
				</div>
			</div>

			<p className="mt-6 text-gray-400 text-[10px] opacity-70">CivicPulse &copy; 2026</p>
		</div>
	);
};

export default ReportSuccess;
