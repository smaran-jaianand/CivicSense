# CivicSense

CivicSense is a smart civic issue reporting and management platform designed to streamline communication between citizens, city supervisors, and field staff. It enables efficient tracking, assignment, and resolution of civic issues like potholes, sanitation problems, and street light failures.

## Key Features

### 🏙️ Citizen Reporting

- Report issues with location, type, and description.
- Track the status of reported issues in real-time.

### 📊 Supervisor Dashboard

- Overview of total, pending, and resolved issues.
- Interactive map view for tracking issues across the city.
- Manage personnel and assignments.

### 👷 Field Staff & Personnel Management

- **Dynamic Personnel Assignment:** Supervisors can assign tasks to available personnel in real-time.
- **Task Hold/Resume:**
  - Tasks can be put "On Hold", freeing up the assigned personnel for other duties.
  - When resumed, the system attempts to re-assign the original staff member; if unavailable, a new available staff member is automatically assigned.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** CSS (with GSAP for animations)
- **Icons:** Lucide React
- **Maps:** Leaflet / React Leaflet
- **State Management:** Local Storage (emulating backend)

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Development Server**

   ```bash
   npm run dev
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```
