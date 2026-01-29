import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLayout from '../../layouts/StaffLayout';
import StaffDashboard from './StaffDashboard';
import StaffMap from './StaffMap';
import StaffAssignment from '../Shared/StaffAssignment';
import TaskDetail from './TaskDetail';

import CompletedTasks from './CompletedTasks';

export default function StaffHome() {
    return (
        <Routes>
            <Route element={<StaffLayout />}>
                <Route index element={<StaffDashboard />} />
                <Route path="map" element={<StaffMap />} />
                <Route path="assignments" element={<StaffAssignment viewMode="general" />} />
                <Route path="task/:id" element={<TaskDetail />} />
                <Route path="completed" element={<CompletedTasks />} />
            </Route>
        </Routes>
    );
}
