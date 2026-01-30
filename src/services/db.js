/**
 * CivicPulse Local Storage Database Service
 * Emulates a backend with persistent local storage.
 */

const STORAGE_KEYS = {
  ISSUES: 'cp_issues',
  USERS: 'cp_users',
  STATS: 'cp_stats',
  PERSONNEL: 'cp_personnel'
};

const DEPARTMENTS = [
  'Public Works',
  'Sanitation',
  'Health',
  'Power',
  'Water Supply'
];

const ISSUE_TYPES = [
  'Pothole',
  'Garbage Dump',
  'Street Light Failure',
  'Water Leakage',
  'Illegal Parking',
  'Noise Pollution'
];

// Seed Data
const SEED_ISSUES = [
  {
    id: 'ISS-1001',
    title: 'Deep Pothole on Main St',
    type: 'Pothole',
    priority: 'Critical',
    status: 'assigned',
    department: 'Public Works',
    description: 'A large pothole causing traffic slowdowns near the market entrance.',
    location: 'Main Market Road, Sector 4',
    coordinates: { lat: 40.7128, lng: -74.0060 }, // Mock Coords
    attachments: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 40000000).toISOString(),
    history: [
      { action: 'Reported', by: 'Citizen', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { action: 'Verified', by: 'Officer J.', timestamp: new Date(Date.now() - 86000000).toISOString() },
      { action: 'Assigned', by: 'System', timestamp: new Date(Date.now() - 40000000).toISOString() }
    ]
  },
  {
    id: 'ISS-1002',
    title: 'Garbage not collected',
    type: 'Garbage Dump',
    priority: 'Medium',
    status: 'reported',
    department: 'Sanitation',
    description: 'Garbage truck missed this street for 3 days.',
    location: 'Residential Block B',
    coordinates: { lat: 40.7140, lng: -74.0050 },
    attachments: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    history: [
      { action: 'Reported', by: 'Citizen', timestamp: new Date(Date.now() - 3600000).toISOString() }
    ]
  },
  {
    id: 'ISS-1003',
    title: 'Broken Street Light',
    type: 'Street Light Failure',
    priority: 'Low',
    status: 'resolved',
    department: 'Power',
    description: 'Light pole #45 is flickering.',
    location: 'Park Avenue',
    coordinates: { lat: 40.7135, lng: -74.0075 },
    attachments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { action: 'Reported', by: 'Citizen', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { action: 'Resolved', by: 'Tech Team', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ]
  }
];

const SEED_PERSONNEL = [
  // Tier 1: General Staff
  { id: 'P-001', name: 'John Doe', role: 'Driver', tier: 1, status: 'Available', department: 'Sanitation' },
  { id: 'P-002', name: 'Jane Smith', role: 'General Maintenance', tier: 1, status: 'Available', department: 'Public Works' },
  { id: 'P-003', name: 'Mike Ross', role: 'Cleaner', tier: 1, status: 'Available', department: 'Sanitation' },
  { id: 'P-004', name: 'Rachel Zane', role: 'Field Inspector', tier: 1, status: 'Available', department: 'Health' },
  { id: 'P-005', name: 'Carlos Rodriguez', role: 'Road Crew', tier: 1, status: 'Available', department: 'Public Works' },
  { id: 'P-006', name: 'Lisa Chen', role: 'Pipe Fitter', tier: 1, status: 'Available', department: 'Water Supply' },
  { id: 'P-007', name: 'Omar Little', role: 'Security Guard', tier: 1, status: 'Available', department: 'Power' },

  // Tier 2: Specialists (Supervisor Only)
  { id: 'P-101', name: 'Dr. Gregory House', role: 'Lead Epidemiologist', tier: 2, status: 'Available', department: 'Health' },
  { id: 'P-102', name: 'Tony Stark', role: 'Structural Engineer', tier: 2, status: 'Available', department: 'Public Works' },
  { id: 'P-103', name: 'Walter White', role: 'Chemical Safety Expert', tier: 2, status: 'Available', department: 'Sanitation' },
  { id: 'P-104', name: 'Emmet Brown', role: 'Senior Electrician', tier: 2, status: 'Available', department: 'Power' },
  { id: 'P-105', name: 'Elena Fisher', role: 'Hydraulic Engineer', tier: 2, status: 'Available', department: 'Water Supply' },
  { id: 'P-106', name: 'Bruce Banner', role: 'Radiation Analyst', tier: 2, status: 'Available', department: 'Power' }
];

export const db = {
  initialize: () => {
    // Only seed if empty
    const existing = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (!existing) {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(SEED_ISSUES));
      console.log('Database seeded.');
    } else {
      // Migration: Ensure coordinates exist on old data if missing
      const issues = JSON.parse(existing);
      const migrated = issues.map(i => {
        if (!i.coordinates) {
          // Assign random nearby coords
          return { ...i, coordinates: { lat: 40.7128 + (Math.random() * 0.01 - 0.005), lng: -74.0060 + (Math.random() * 0.01 - 0.005) } };
        }
        return i;
      });
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(migrated));
    }

    // Seed Personnel
    if (!localStorage.getItem(STORAGE_KEYS.PERSONNEL)) {
      localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(SEED_PERSONNEL));
    }
  },

  getAllIssues: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ISSUES);
    return data ? JSON.parse(data) : [];
  },

  getIssueById: (id) => {
    const issues = db.getAllIssues();
    return issues.find(i => i.id === id);
  },

  createIssue: (issueData) => {
    const issues = db.getAllIssues();
    const newIssue = {
      id: `ISS-${1000 + issues.length + 1}`,
      status: 'reported',
      // Priority provided by user or default
      priority: issueData.priority || 'Medium',
      // Attachments & Coords
      attachments: issueData.attachments || [],
      coordinates: issueData.coordinates || null,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        { action: 'Reported', by: 'Citizen', timestamp: new Date().toISOString() }
      ],
      ...issueData
    };

    // Auto-assign logic
    if (!newIssue.department && newIssue.type) {
      if (newIssue.type.includes('Pothole')) newIssue.department = 'Public Works';
      else if (newIssue.type.includes('Garbage')) newIssue.department = 'Sanitation';
      else if (newIssue.type.includes('Light') || newIssue.type.includes('Power')) newIssue.department = 'Power';
      else if (newIssue.type.includes('Water')) newIssue.department = 'Water Supply';
      else newIssue.department = 'Admin';
    }

    issues.unshift(newIssue);
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    return newIssue;
  },

  updateIssue: (id, updates, authorizedUser = 'System') => {
    const issues = db.getAllIssues();
    const index = issues.findIndex(i => i.id === id);
    if (index === -1) return null;

    const issue = issues[index];
    const updatedIssue = {
      ...issue,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.status && updates.status !== issue.status) {
      updatedIssue.history.push({
        action: `Status changed to ${updates.status}`,
        by: authorizedUser,
        timestamp: new Date().toISOString()
      });
    }

    issues[index] = updatedIssue;
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    return updatedIssue;
  },

  getStats: () => {
    const issues = db.getAllIssues();
    return {
      total: issues.length,
      pending: issues.filter(i => ['reported', 'assigned', 'in_progress'].includes(i.status)).length,
      resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
      byDept: issues.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {})
    };
  },

  // Personnel Methods
  getAllPersonnel: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PERSONNEL);
    return data ? JSON.parse(data) : [];
  },

  addPersonnel: (person) => {
    const people = db.getAllPersonnel();
    const newPerson = {
      id: `P-${1000 + people.length}`,
      status: 'Available',
      ...person
    };
    people.push(newPerson);
    localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(people));
    return newPerson;
  },

  updatePersonnel: (id, updates) => {
    const people = db.getAllPersonnel();
    const index = people.findIndex(p => p.id === id);
    if (index === -1) return null;

    people[index] = { ...people[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(people));
    return people[index];
  },

  resetDatabase: () => {
    // Set explicit empty arrays so 'initialize' detects existing (but empty) data and doesn't re-seed
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.USERS); // Users can be reset
    localStorage.removeItem(STORAGE_KEYS.STATS); // Stats will re-compute from empty issues
    localStorage.removeItem(STORAGE_KEYS.PERSONNEL);

    console.log("Database wiped to 0.");
    window.location.reload();
  },



  // Assignment Logic Helpers
  getAvailablePersonnel: (department) => {
    const all = db.getAllPersonnel();
    // Filter by department and status 'Available'
    // Tier 1 is general, Tier 2 is specialist. For auto-assign, we usually prefer Tier 1 unless specified.
    // For now, we'll just grab anyone available in the department.
    return all.filter(p => p.department === department && p.status === 'Available');
  },

  getRandomAvailablePersonnel: (department) => {
    const available = db.getAvailablePersonnel(department);
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  },

  assignIssue: (issueId, personnelId, authorizedUser = 'System') => {
    const person = db.getAllPersonnel().find(p => p.id === personnelId);
    if (!person) return { success: false, message: 'Personnel not found' };

    if (person.status !== 'Available') {
      // Logic to override if needed, but for auto-assign we generally skip.
      // However, if manual assign, we might force.
    }

    // 1. Update Person -> Busy
    db.updatePersonnel(person.id, { status: 'Busy' });

    // 2. Update Issue
    db.updateIssue(issueId, {
      status: 'assigned',
      assignedTo: { id: person.id, name: person.name },
      department: person.department // Ensure dept matches if not already
    }, authorizedUser);

    return { success: true, personnel: person };
  },

  toggleTaskHold: (issueId, authorizedUser = 'System') => {
    const issue = db.getIssueById(issueId);
    if (!issue) return { success: false, message: 'Issue not found' };

    if (issue.status === 'on_hold') {
      // RESUME LOGIC
      return db.resumeTask(issueId, authorizedUser);
    } else {
      // HOLD LOGIC
      return db.holdTask(issueId, authorizedUser);
    }
  },

  holdTask: (issueId, authorizedUser) => {
    const issue = db.getIssueById(issueId);
    const currentAssignee = issue.assignedTo;

    if (currentAssignee) {
      // Free the person
      db.updatePersonnel(currentAssignee.id, { status: 'Available' });
    }

    db.updateIssue(issueId, {
      status: 'on_hold',
      assignedTo: null, // Clear active assignment
      lastAssignedTo: currentAssignee // Remember who had it
    }, authorizedUser);

    return { success: true, status: 'on_hold', message: 'Task put on hold. Personnel freed.' };
  },

  resumeTask: (issueId, authorizedUser) => {
    const issue = db.getIssueById(issueId);
    const lastAssignee = issue.lastAssignedTo;

    let targetPerson = null;

    // 1. Try to re-assign to last person
    if (lastAssignee) {
      const person = db.getAllPersonnel().find(p => p.id === lastAssignee.id);
      if (person && person.status === 'Available') {
        targetPerson = person;
      }
    }

    // 2. If not available, pick random
    if (!targetPerson) {
      targetPerson = db.getRandomAvailablePersonnel(issue.department);
    }

    if (!targetPerson) {
      return { success: false, message: 'No personnel available to resume task.' };
    }

    // 3. Assign
    db.assignIssue(issueId, targetPerson.id, authorizedUser);

    // Update status to in_progress directly if it was resumed (usually implies work continues)
    db.updateIssue(issueId, { status: 'in_progress' }, authorizedUser);

    return { success: true, status: 'in_progress', assignedTo: targetPerson.name };
  },

  CONSTANTS: {
    DEPARTMENTS,
    ISSUE_TYPES
  }
};
