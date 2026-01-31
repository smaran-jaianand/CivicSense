import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { db } from '../../services/db';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const AdminDashboard = () => {
	const containerRef = React.useRef(null);
	useGSAP(() => {
		gsap.fromTo(containerRef.current.children,
			{ y: 20, opacity: 0 },
			{ y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
		);
	}, { scope: containerRef });

	return (
		<div ref={containerRef}>
			<h1 className="page-title">System Configuration</h1>
			<div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
				<h3 className="font-bold mb-4">Issue Categories</h3>
				<div className="flex gap-4 flex-wrap">
					{db.CONSTANTS.ISSUE_TYPES.map(t => (
						<span key={t} style={{ padding: '5px' }} className="px-4 py-2 bg-gray-100 rounded-full text-sm">{t}</span>
					))}
					<button className="px-4 py-2 border border-dashed border-gray-400 text-gray-500 rounded-full text-sm hover:bg-gray-50">+ Add New</button>
				</div>
			</div>
			<br />
			<div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
				<h3 className="font-bold mb-4">System Status</h3>
				<div className="text-sm font-mono text-green-600 mb-2">● All Systems Operational</div>
				<div className="text-xs text-muted">Database: LocalStorage Adapter v1.0</div>
			</div>
			<br />
			<div className="mt-8">
				<h3 className="text-red-600 font-bold mb-3 uppercase text-sm tracking-wider">Danger Zone</h3>
				<br />
				<div className="bg-black-50 p-6 rounded-lg border border-red-200 flex justify-between items-center">
					<div>
						<h4 className="font-bold text-black-900">Reset System Data</h4>
						<p className="text-sm text-black-700 mt-1">This will permanently delete all issues, user modifications, and history. The generic seed data will be restored on reload.</p>
					</div>
					<button
						onClick={() => {
							if (window.confirm("ARE YOU SURE? This will wipe all data and reset the application.")) {
								db.resetDatabase();
							}
						}}
						className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 shadow-sm transition-colors"
					>
						Clear All Data
					</button>
				</div>
			</div>
		</div>
	);
};

export default function AdminHome() {
	return (
		<Routes>
			<Route element={<AdminLayout />}>
				<Route index element={<AdminDashboard />} />
			</Route>
		</Routes>
	);
}
