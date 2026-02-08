import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";

import applicationRoutes from "../src/routes/applications.js";
import { initDataStore, saveData } from "../src/models/storage.js";

const snapshot = JSON.parse(JSON.stringify(initDataStore()));

const resetDataStore = () => {
  saveData(JSON.parse(JSON.stringify(snapshot)));
};

test("applications CRUD flow", async (t) => {
  resetDataStore();

  const fastify = Fastify();
  await fastify.register(applicationRoutes, { prefix: "/api/applications" });
  await fastify.ready();

  t.after(async () => {
    await fastify.close();
    resetDataStore();
  });

  const listResponse = await fastify.inject({ method: "GET", url: "/api/applications" });
  assert.equal(listResponse.statusCode, 200);
  const initialBody = listResponse.json();
  assert.ok(Array.isArray(initialBody.applications));

  const initialCount = initialBody.applications.length;

  const createPayload = {
    jobId: "job-seed-3",
    jobTitle: "Data Product Analyst",
    company: "Udupi FinInsights",
    status: "Applied",
    notes: "Test run"
  };

  const createResponse = await fastify.inject({
    method: "POST",
    url: "/api/applications",
    payload: createPayload
  });
  assert.equal(createResponse.statusCode, 200);
  const created = createResponse.json();
  assert.ok(created.id);
  assert.equal(created.status, "Applied");
  assert.ok(Array.isArray(created.timeline));
  assert.equal(created.timeline.at(-1).status, "Applied");

  const listAfterCreate = await fastify.inject({ method: "GET", url: "/api/applications" });
  const afterCreateBody = listAfterCreate.json();
  assert.equal(afterCreateBody.applications.length, initialCount + 1);

  const updateResponse = await fastify.inject({
    method: "PATCH",
    url: `/api/applications/${created.id}`,
    payload: { status: "Interview" }
  });
  assert.equal(updateResponse.statusCode, 200);
  const updated = updateResponse.json();
  assert.equal(updated.status, "Interview");
  assert.equal(updated.timeline.at(-1).status, "Interview");

  const deleteResponse = await fastify.inject({ method: "DELETE", url: `/api/applications/${created.id}` });
  assert.equal(deleteResponse.statusCode, 200);
  assert.ok(deleteResponse.json().success);

  const finalList = await fastify.inject({ method: "GET", url: "/api/applications" });
  assert.equal(finalList.json().applications.length, initialCount);

  const statsResponse = await fastify.inject({ method: "GET", url: "/api/applications/stats" });
  assert.equal(statsResponse.statusCode, 200);
  const stats = statsResponse.json();
  const totalFromStats = Object.entries(stats)
    .filter(([key]) => key !== "total")
    .reduce((sum, [, value]) => sum + value, 0);
  assert.equal(stats.total, totalFromStats);
});
