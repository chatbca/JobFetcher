// In-memory data storage
export const users = [
  {
    id: '1',
    email: 'test@gmail.com',
    password: 'test@123',
    resume: null,
    resumeText: '',
    createdAt: new Date()
  }
];

export const applications = [];

export const filters = new Map();

// Helper functions
export const findUserByEmail = (email) => {
  return users.find(u => u.email === email);
};

export const findUserById = (id) => {
  return users.find(u => u.id === id);
};

export const updateUserResume = (userId, resume, resumeText) => {
  const user = findUserById(userId);
  if (user) {
    user.resume = resume;
    user.resumeText = resumeText;
    user.updatedAt = new Date();
  }
  return user;
};

export const addApplication = (application) => {
  applications.push({
    ...application,
    id: Date.now().toString(),
    createdAt: new Date()
  });
  return applications[applications.length - 1];
};

export const updateApplicationStatus = (id, status) => {
  const app = applications.find(a => a.id === id);
  if (app) {
    app.status = status;
    app.updatedAt = new Date();
    if (!app.timeline) app.timeline = [];
    app.timeline.push({
      status,
      timestamp: new Date()
    });
  }
  return app;
};

export const getUserApplications = (userId) => {
  return applications.filter(a => a.userId === userId);
};
