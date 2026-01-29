import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { AreaChart, LogOut } from 'lucide-react';
import '../styles/PortalLayout.css';

const SupervisorLayout = () => {
    return (
        <div className="portal-layout">
            <nav className="portal-nav" style={{ borderBottomColor: '#8b5cf6' }}> {/* Violet border */}
                <Link to="/" className="portal-brand">
                    <AreaChart size={24} className="text-violet-600" />
                    <span>City Supervisor</span>
                </Link>

                <div className="nav-links">
                    <NavLink to="/supervisor" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Overview
                    </NavLink>
                    <NavLink to="/supervisor/escalations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Escalations
                    </NavLink>
                    <NavLink to="/supervisor/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Reports
                    </NavLink>
                    <NavLink to="/supervisor/assignments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Personnel
                    </NavLink>
                    <NavLink to="/supervisor/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Live Map
                    </NavLink>
                </div>

                <Link to="/" className="btn btn-ghost text-sm">
                    <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                    Logout
                </Link>
            </nav>

            <main className="portal-content">
                <Outlet />
            </main>
        </div>
    );
};

export default SupervisorLayout;
