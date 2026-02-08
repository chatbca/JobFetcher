import { getData, updateData, initDataStore } from "./storage.js";

const STATUS_FLOW = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
  "Hired",
  "In Progress"
];

const JOB_STATUSES = ["Open", "Closed"];

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((skill) => skill.trim()).filter(Boolean);
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const ensureTimeline = (application, status, actor = "system") => {
  if (!application.timeline) {
    application.timeline = [];
  }
  application.timeline.push({
    status,
    actor,
    timestamp: new Date().toISOString()
  });
};

const sanitizeStatus = (status, fallback = "Applied") => {
  if (!status) return fallback;
  return STATUS_FLOW.includes(status) ? status : fallback;
};

const normalizeJobStatus = (status) => (JOB_STATUSES.includes(status) ? status : "Open");

initDataStore();

export const findUserByEmail = (email) => getData().users.find((user) => user.email === email);

export const findUserById = (id) => getData().users.find((user) => user.id === id);

export const updateUserResume = (userId, resume, resumeText) => {
  let updatedUser = null;
  updateData((data) => {
    const user = data.users.find((item) => item.id === userId);
    if (user) {
      user.resume = resume;
      user.resumeText = resumeText;
      user.updatedAt = new Date().toISOString();
      updatedUser = { ...user };
    }
  });
  return updatedUser;
};

export const findRecruiterByEmail = (email) => getData().recruiters.find((recruiter) => recruiter.email === email);

export const findRecruiterById = (id) => getData().recruiters.find((recruiter) => recruiter.id === id);

export const getRecruiterJobs = (recruiterId) => getData().jobs.filter((job) => job.recruiterId === recruiterId);

export const getRecruiterJobById = (jobId) => getData().jobs.find((job) => job.id === jobId);

export const getActiveRecruiterJobs = () => getData().jobs.filter((job) => (job.status || "Open") === "Open");

export const createRecruiterJob = (recruiterId, payload) => {
  let newJob = null;
  updateData((data) => {
    const now = new Date().toISOString();
    newJob = {
      id: createId("job"),
      recruiterId,
      title: payload.title,
      company: payload.company,
      location: payload.location,
      description: payload.description,
      skills: normalizeSkills(payload.skills),
      jobType: payload.jobType || "Full-time",
      workMode: payload.workMode || "Remote",
      experienceLevel: payload.experienceLevel || "Mid",
      applyLink: payload.applyLink || "",
      status: normalizeJobStatus(payload.status),
      createdAt: now,
      updatedAt: now,
      applicants: 0
    };
    data.jobs.push(newJob);
  });
  return newJob;
};

export const updateRecruiterJob = (jobId, recruiterId, updates) => {
  let jobRef = null;
  updateData((data) => {
    const job = data.jobs.find((item) => item.id === jobId && item.recruiterId === recruiterId);
    if (!job) return;
    const fields = [
      "title",
      "company",
      "location",
      "description",
      "jobType",
      "workMode",
      "experienceLevel",
      "applyLink"
    ];
    fields.forEach((field) => {
      if (updates[field] !== undefined) {
        job[field] = updates[field];
      }
    });
    if (updates.skills !== undefined) {
      job.skills = normalizeSkills(updates.skills);
    }
    if (updates.status) {
      job.status = normalizeJobStatus(updates.status);
    }
    job.updatedAt = new Date().toISOString();
    jobRef = { ...job };
  });
  return jobRef;
};

export const deleteRecruiterJob = (jobId, recruiterId) => {
  let deleted = false;
  updateData((data) => {
    const index = data.jobs.findIndex((job) => job.id === jobId && job.recruiterId === recruiterId);
    if (index !== -1) {
      data.jobs.splice(index, 1);
      deleted = true;
    }
  });
  return deleted;
};

const resolveRecruiterForJob = (jobId) => {
  const job = getRecruiterJobById(jobId);
  return job ? job.recruiterId : null;
};

export const addApplication = (application) => {
  let created = null;
  updateData((data) => {
    const now = new Date().toISOString();
    const status = sanitizeStatus(application.status);
    const record = {
      id: createId("app"),
      userId: application.userId,
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      company: application.company,
      status,
      appliedVia: application.appliedVia || "external",
      appliedDate: application.appliedDate || now,
      notes: application.notes || "",
      matchScore: application.matchScore ?? null,
      matchDetails: application.matchDetails || null,
      resumeSummary: application.resumeSummary || "",
      candidateName: application.candidateName || "",
      candidateEmail: application.candidateEmail || "",
      recruiterId: application.recruiterId || resolveRecruiterForJob(application.jobId),
      createdAt: now,
      updatedAt: now,
      timeline: application.timeline || []
    };
    ensureTimeline(record, status, application.actor || "candidate");
    data.applications.push(record);
    if (record.jobId) {
      const job = data.jobs.find((item) => item.id === record.jobId);
      if (job) {
        job.applicants = (job.applicants || 0) + 1;
      }
    }
    created = record;
  });
  return created;
};

export const updateApplicationStatus = (id, status) => {
  let updated = null;
  updateData((data) => {
    const app = data.applications.find((application) => application.id === id);
    if (!app) return;
    const sanitized = sanitizeStatus(status, app.status);
    app.status = sanitized;
    app.updatedAt = new Date().toISOString();
    ensureTimeline(app, sanitized, "candidate");
    updated = { ...app };
  });
  return updated;
};

export const updateApplicationStatusByRecruiter = (id, status, recruiterId) => {
  let updated = null;
  updateData((data) => {
    const app = data.applications.find(
      (application) => application.id === id && application.recruiterId === recruiterId
    );
    if (!app) return;
    const sanitized = sanitizeStatus(status, app.status);
    app.status = sanitized;
    app.updatedAt = new Date().toISOString();
    ensureTimeline(app, sanitized, "recruiter");
    updated = { ...app };
  });
  return updated;
};

export const deleteApplicationById = (id, userId) => {
  let deleted = false;
  updateData((data) => {
    const index = data.applications.findIndex((application) => application.id === id && application.userId === userId);
    if (index !== -1) {
      const [removed] = data.applications.splice(index, 1);
      if (removed && removed.jobId) {
        const job = data.jobs.find((item) => item.id === removed.jobId);
        if (job && job.applicants) {
          job.applicants = Math.max(0, (job.applicants || 0) - 1);
        }
      }
      deleted = true;
    }
  });
  return deleted;
};

export const getUserApplications = (userId) => getData().applications.filter((application) => application.userId === userId);

export const getApplicationsByRecruiter = (recruiterId) =>
  getData().applications.filter((application) => application.recruiterId === recruiterId);

export const getApplicationsByJob = (jobId, recruiterId) =>
  getData().applications.filter(
    (application) => application.jobId === jobId && (!recruiterId || application.recruiterId === recruiterId)
  );

export const getValidStatuses = () => STATUS_FLOW;
