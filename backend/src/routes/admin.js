import {
  findRecruiterByEmail,
  findRecruiterById,
  createRecruiterJob,
  updateRecruiterJob,
  deleteRecruiterJob,
  getRecruiterJobs,
  getRecruiterJobById,
  getApplicationsByRecruiter,
  getApplicationsByJob,
  updateApplicationStatusByRecruiter,
  getValidStatuses
} from "../models/data.js";

const ADMIN_TOKEN_PREFIX = "admin-token-";

const sanitizeRecruiter = (recruiter) => {
  const { password, ...rest } = recruiter;
  return rest;
};

const buildToken = (recruiterId) => `${ADMIN_TOKEN_PREFIX}${recruiterId}`;

const extractToken = (request) => {
  const header = request.headers.authorization || "";
  if (!header.toLowerCase().startsWith("bearer")) return null;
  const parts = header.split(" ");
  return parts[1] || null;
};

const requireAdmin = async (request, reply) => {
  const rawToken = extractToken(request);
  if (!rawToken || !rawToken.startsWith(ADMIN_TOKEN_PREFIX)) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const recruiterId = rawToken.slice(ADMIN_TOKEN_PREFIX.length);
  const recruiter = findRecruiterById(recruiterId);
  if (!recruiter) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  request.recruiter = recruiter;
};

const withJobMeta = (job, recruiterId) => {
  const applications = getApplicationsByJob(job.id, recruiterId);
  return {
    ...job,
    applicants: applications.length,
    lastApplicationAt: applications[applications.length - 1]?.createdAt || null
  };
};

export default async function adminRoutes(fastify, options) {
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;
    const recruiter = findRecruiterByEmail(email);

    if (!recruiter || recruiter.password !== password) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    return {
      success: true,
      recruiter: sanitizeRecruiter(recruiter),
      token: buildToken(recruiter.id)
    };
  });

  fastify.get("/me", { preHandler: requireAdmin }, async (request, reply) => {
    return sanitizeRecruiter(request.recruiter);
  });

  fastify.get("/jobs", { preHandler: requireAdmin }, async (request, reply) => {
    const jobs = getRecruiterJobs(request.recruiter.id).map((job) => withJobMeta(job, request.recruiter.id));
    const applications = getApplicationsByRecruiter(request.recruiter.id);

    const stats = {
      total: jobs.length,
      open: jobs.filter((job) => job.status === "Open").length,
      closed: jobs.filter((job) => job.status === "Closed").length,
      applications: applications.length
    };

    return { jobs, stats };
  });

  fastify.post("/jobs", { preHandler: requireAdmin }, async (request, reply) => {
    const requiredFields = ["title", "company", "location", "description", "status"];
    const missing = requiredFields.filter((field) => !request.body[field]);
    if (missing.length > 0) {
      return reply.code(400).send({ error: `Missing fields: ${missing.join(", ")}` });
    }

    const job = createRecruiterJob(request.recruiter.id, request.body);
    reply.code(201);
    return withJobMeta(job, request.recruiter.id);
  });

  fastify.put("/jobs/:id", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params;
    const updated = updateRecruiterJob(id, request.recruiter.id, request.body);
    if (!updated) {
      return reply.code(404).send({ error: "Job not found" });
    }
    return withJobMeta(updated, request.recruiter.id);
  });

  fastify.get("/jobs/:id", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params;
    const job = getRecruiterJobById(id);
    if (!job || job.recruiterId !== request.recruiter.id) {
      return reply.code(404).send({ error: "Job not found" });
    }
    return { job: withJobMeta(job, request.recruiter.id) };
  });

  fastify.delete("/jobs/:id", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params;
    const deleted = deleteRecruiterJob(id, request.recruiter.id);
    if (!deleted) {
      return reply.code(404).send({ error: "Job not found" });
    }
    return { success: true };
  });

  fastify.get("/jobs/:id/applications", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params;
    const job = getRecruiterJobById(id);
    if (!job || job.recruiterId !== request.recruiter.id) {
      return reply.code(404).send({ error: "Job not found" });
    }
    const applications = getApplicationsByJob(id, request.recruiter.id);
    return {
      job: withJobMeta(job, request.recruiter.id),
      applications
    };
  });

  fastify.get("/applications", { preHandler: requireAdmin }, async (request, reply) => {
    const applications = getApplicationsByRecruiter(request.recruiter.id);
    return { applications };
  });

  fastify.put("/applications/:id/status", { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    const validStatuses = getValidStatuses();
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ error: "Invalid status", validStatuses });
    }

    const updated = updateApplicationStatusByRecruiter(id, status, request.recruiter.id);
    if (!updated) {
      return reply.code(404).send({ error: "Application not found" });
    }

    return updated;
  });
}
