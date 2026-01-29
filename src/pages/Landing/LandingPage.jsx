import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ClipboardList, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import '../../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo-area">
                    <div className="logo-icon">
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h1>CivicPulse</h1>
                </div>
                <p className="subtitle">Operational Management System for Modern Civic Administration</p>
            </header>

            <main className="portal-grid">
                <Link to="/citizen" className="portal-card citizen">
                    <div className="icon-wrapper">
                        <MapPin size={40} />
                    </div>
                    <h2>Citizen Portal</h2>
                    <p>Report issues, track progress, and give feedback.</p>
                    <span className="btn-text">Enter Portal &rarr;</span>
                </Link>

                <Link to="/staff" className="portal-card staff">
                    <div className="icon-wrapper">
                        <ClipboardList size={40} />
                    </div>
                    <h2>City Staff</h2>
                    <p>View assigned tasks, update status, and resolve issues.</p>
                    <span className="btn-text">Log In &rarr;</span>
                </Link>

                <Link to="/supervisor" className="portal-card supervisor">
                    <div className="icon-wrapper">
                        <BarChart3 size={40} />
                    </div>
                    <h2>City Supervisor</h2>
                    <p>Monitor department performance and approve escalations.</p>
                    <span className="btn-text">Dashboard &rarr;</span>
                </Link>

                <Link to="/admin" className="portal-card admin">
                    <div className="icon-wrapper">
                        <Settings size={40} />
                    </div>
                    <h2>Administrator</h2>
                    <p>Configure system settings, categories, and user roles.</p>
                    <span className="btn-text">Configure &rarr;</span>
                </Link>
            </main>

            <footer className="landing-footer">
                <p>&copy; 2026 CivicPulse System. Development Build.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
