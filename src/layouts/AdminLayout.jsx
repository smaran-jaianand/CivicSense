import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import '../styles/PortalLayout.css';

const AdminLayout = () => {
    return (
        <div className="portal-layout">
            <nav className="portal-nav" style={{ borderBottomColor: '#475569' }}>
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
