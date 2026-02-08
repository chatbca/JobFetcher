import {
  addApplication,
  updateApplicationStatus,
  getUserApplications,
  deleteApplicationById,
  getValidStatuses,
  findUserById
} from "../models/data.js";

const HARD_CODED_USER_ID = "1";

const summarizeResume = (resumeText) => {
  if (!resumeText) return "Resume not uploaded yet";
  const clean = resumeText.replace(/\s+/g, " ").trim();
  return clean.length > 280 ? `${clean.slice(0, 277)}...` : clean;
};

export default async function applicationRoutes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    const applications = getUserApplications(HARD_CODED_USER_ID);

    return {
      applications,
      total: applications.length
    };
  });

  fastify.post("/", async (request, reply) => {
    const {
      jobId,
      jobTitle,
      company,
      status,
      appliedVia,
      notes,
      appliedDate,
      matchScore,
      matchDetails,
      resumeSummary,
      candidateName
    } = request.body;

    if (!jobId || !jobTitle || !company) {
      return reply.code(400).send({ error: "jobId, jobTitle, and company are required" });
    }

    const validStatuses = getValidStatuses();
    const normalizedStatus = validStatuses.includes(status) ? status : "Applied";
    const user = findUserById(HARD_CODED_USER_ID);

    const application = addApplication({
      userId: HARD_CODED_USER_ID,
      jobId,
      jobTitle,
      company,
      status: normalizedStatus,
      appliedVia: appliedVia || "external",
      appliedDate: appliedDate || new Date().toISOString(),
      notes,
      matchScore,
      matchDetails,
      resumeSummary: resumeSummary || summarizeResume(user?.resumeText || ""),
      candidateName: candidateName || user?.name || user?.email,
      candidateEmail: user?.email || "candidate@example.com"
    });

    return application;
  });

  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    const validStatuses = getValidStatuses();
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({
        error: "Invalid status",
        validStatuses
      });
    }

    const application = updateApplicationStatus(id, status);

    if (!application) {
      return reply.code(404).send({ error: "Application not found" });
    }

    return application;
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params;
    const deleted = deleteApplicationById(id, HARD_CODED_USER_ID);

    if (!deleted) {
      return reply.code(404).send({ error: "Application not found" });
    }

    return { success: true, message: "Application deleted" };
  });

  fastify.get("/stats", async (request, reply) => {
    const applications = getUserApplications(HARD_CODED_USER_ID);

    const stats = {
      total: applications.length,
      applied: applications.filter((a) => a.status === "Applied").length,
      interview: applications.filter((a) => a.status === "Interview").length,
      offer: applications.filter((a) => a.status === "Offer").length,
      rejected: applications.filter((a) => a.status === "Rejected").length
    };

    return stats;
  });
}
