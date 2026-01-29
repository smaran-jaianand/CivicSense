import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { HardHat, LogOut } from 'lucide-react';
import '../styles/PortalLayout.css';

const StaffLayout = () => {
    return (
        <div className="portal-layout">
            <nav className="portal-nav" style={{ borderBottomColor: '#f59e0b' }}> {/* Amber border for staff */}
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
