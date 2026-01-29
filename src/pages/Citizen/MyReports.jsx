import React from 'react';
import { db } from '../../services/db';

const MyReports = () => {
	const issues = db.getAllIssues().filter(i => i.history[0].by === 'Citizen');

	return (
		<div>
			<header className="page-header">
				<h1 className="page-title">My Reports</h1>
				<p className="page-subtitle">Track the status of issues you have submitted.</p>
			</header>

			<div className="flex flex-col gap-4">
				{issues.map(issue => (
					<div key={issue.id} className="bg-white p-6 rounded-lg shadow-md border border-[var(--color-border)] flex justify-between items-start">
						<div>
							<div className="flex items-center gap-4 mb-2">
								<span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{issue.id}</span>
								<h3 className="text-lg font-semibold">{issue.type}</h3>
							</div>
							<p className="text-muted mb-2">{issue.description}</p>
							<div className="text-sm text-gray-500 flex gap-4">
								<span>📍 {issue.location}</span>
								<span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
							</div>
						</div>

						<div className="flex flex-col items-end gap-2">
							<span className="badge" style={{
								backgroundColor: `var(--status-${issue.status.replace('_', '-')})`,
								color: 'white'
							}}>
								{issue.status.replace('_', ' ')}
							</span>
							<span className="text-xs text-muted">Dept: {issue.department}</span>

							{/* View Proof Button */}
							{issue.resolutionProof && (
								<div className="mt-2 text-right">
									<div className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Resolved</div>
									<a href={issue.resolutionProof.url} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg border border-green-200 overflow-hidden shadow-sm hover:ring-2 ring-green-400 transition-all relative group">
										<img src={issue.resolutionProof.url} alt="Proof" className="w-full h-full object-cover" />
									</a>
								</div>
							)}
						</div>
					</div>
				))}

				{issues.length === 0 && (
					<div className="text-center py-12 text-muted">
						You haven't reported any issues yet.
					</div>
				)}
			</div>
		</div>
	);
};

export default MyReports;
