import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SupervisorLayout from '../../layouts/SupervisorLayout';
import SupervisorDashboard from './SupervisorDashboard';
import StaffAssignment from '../Shared/StaffAssignment';

import Escalations from './Escalations';
import Reports from './Reports';
import SupervisorMap from './SupervisorMap';

export default function SupervisorHome() {
    return (
        <Routes>
            <Route element={<SupervisorLayout />}>
                <Route index element={<SupervisorDashboard />} />
                <Route path="escalations" element={<Escalations />} />
                <Route path="reports" element={<Reports />} />
                <Route path="assignments" element={<StaffAssignment viewMode="all" />} />
                <Route path="map" element={<SupervisorMap />} />
            </Route>
        </Routes>
    );
}
