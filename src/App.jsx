import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import CitizenHome from './pages/Citizen/CitizenHome';
import StaffHome from './pages/Staff/StaffHome';
import SupervisorHome from './pages/Supervisor/SupervisorHome';
import AdminHome from './pages/Admin/AdminHome';
import { db } from './services/db';

function App() {
  useEffect(() => {
    // Initialize Local Storage DB
    db.initialize();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Citizen Portal Routes */}
        <Route path="/citizen/*" element={<CitizenHome />} />

        {/* Staff Portal Routes */}
        <Route path="/staff/*" element={<StaffHome />} />

        {/* Supervisor Portal Routes */}
        <Route path="/supervisor/*" element={<SupervisorHome />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/*" element={<AdminHome />} />
      </Routes>
    </Router>
  );
}

export default App;
