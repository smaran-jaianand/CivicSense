# SymbiConnect 🏙️

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

**SymbiConnect** is a comprehensive civic issue reporting and management platform designed to bridge the gap between citizens and city administration. It facilitates real-time reporting of issues like potholes, garbage dumps, and street light failures, ensuring efficient assignment to field staff and transparent tracking for citizens.

---

## 🌟 Key Features

### 🧑‍🤝‍🧑 For Citizens

- **Easy Reporting**: Intuitive interface to report issues with location (map integration), type, and photos.
- **Track Status**: detailed history and real-time status updates (Reported → Assigned → In Progress → Resolved).

### 👮 For Supervisors

- **Command Center**: A dashboard and map view showing all city issues with color-coded severity markers.
- **Personnel Management**: View real-time status of all field staff (Available/Busy).
- **Smart Assignment**:
  - **Dynamic Allocation**: Instantly assign tasks to available personnel within the specific department.
  - **Task & Personnel Lifecycle**: Handle task interruptions with "Hold" and "Resume" flows, automatically freeing up and re-assigning staff as needed.

### 👷 For Field Staff

- **Task Management**: clearly view assigned tasks with priority levels and standard operating procedures.
- **Status Updates**: Update task progress directly from the field.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 (via Vite)
- **Styling**: Standard CSS with Variables, GSAP for smooth animations.
- **Maps**: Leaflet & React-Leaflet for interactive map components.
- **Icons**: Lucide React & Phosphor Icons.
- **Data Persistence**: LocalStorage-based mock backend service (`src/services/db.js`) simulating a real database with seeding and relationships.

---

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components (Modals, Cards, Buttons)
├── layouts/          # Role-based layouts (Staff, Supervisor, Citizen)
├── pages/            # Application views
│   ├── Admin/        # System configuration
│   ├── Citizen/      # Reporting flow & history
│   ├── Staff/        # Task details & dashboard
│   ├── Supervisor/   # Analytics & Map command center
│   └── Landing/      # Public landing page
├── services/         # Database emulation logic (db.js)
└── styles/           # Global themes and animation styles
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/smaran-jaianand/SymbiConnect.git
   cd SymbiConnect
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open the app**
   Visit `http://localhost:5173` (or the port shown in your terminal).

---

## 📖 Usage Guide

### 1. Initial Setup

The application will automatically seed the LocalStorage "database" with sample issues and personnel upon the first load. You can click "Reset DB" in the Admin or Supervisor view if you need to restart with fresh data.

### 2. Personnel Assignment Workflow

1. Log in as a **Supervisor**.
2. Navigate to the **Map** or **Reports** view.
3. Select an "Unassigned" issue.
4. Click **Assign**: The system filters for "Available" staff in the relevant department.
5. Confirm assignment.

### 3. Hold & Resume

- If a task cannot be completed immediately, a Supervisor can put it **On Hold**. This frees up the assigned staff member (`Status: Available`).
- When ready, clicking **Resume** attempts to re-assign the original staff member. If they are busy, a new available staff member is selected automatically.

---

## 📄 License

Distributed under the MIT License.
