/**
 * API Contract Test: /api/wizard/dashboard
 * Validates response structure, types, and ranges
 */

import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/wizard/dashboard";
import type { DashboardViewModel } from "@/contracts/dashboard";

describe("POST /api/wizard/dashboard", () => {
  it("returns valid DashboardViewModel structure", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        location_key: "test-location-123",
        selected_hazards: ["Heat", "Flood"],
        selected_system: "Health",
        precision_level: "approximate"
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data: DashboardViewModel = JSON.parse(res._getData());

    // ✅ Required top-level fields
    expect(data).toHaveProperty("location");
    expect(data).toHaveProperty("baseline");
    expect(data).toHaveProperty("risk_chain");
    expect(data).toHaveProperty("metadata");

    // ✅ Location structure
    expect(data.location).toHaveProperty("location_key");
    expect(data.location.location_key).toBe("test-location-123");
    expect(data.location).toHaveProperty("normalized_address");
    expect(data.location).toHaveProperty("region_profile");
    expect(data.location.region_profile).toHaveProperty("climate_regime");
    expect(data.location.region_profile).toHaveProperty("exposure_flags");
    expect(Array.isArray(data.location.region_profile.exposure_flags)).toBe(true);

    // ✅ Baseline structure
    expect(data.baseline).toHaveProperty("warming_estimate");
    expect(typeof data.baseline.warming_estimate).toBe("number");
    expect(data.baseline.warming_estimate).toBeGreaterThanOrEqual(0);
    expect(data.baseline.warming_estimate).toBeLessThanOrEqual(10);
    expect(data.baseline).toHaveProperty("unit");
    expect(data.baseline.unit).toBe("°C");
    expect(data.baseline).toHaveProperty("confidence");
    expect(["High", "Medium", "Low"]).toContain(data.baseline.confidence.level);

    // ✅ Risk chain structure
    expect(data.risk_chain).toHaveProperty("hazard");
    expect(data.risk_chain).toHaveProperty("system");
    expect(data.risk_chain).toHaveProperty("nodes");
    expect(Array.isArray(data.risk_chain.nodes)).toBe(true);
    expect(data.risk_chain.nodes.length).toBeGreaterThan(0);

    // ✅ Risk chain nodes validation
    data.risk_chain.nodes.forEach((node) => {
      expect(node).toHaveProperty("id");
      expect(node).toHaveProperty("label");
      expect(node).toHaveProperty("type");
      expect(node).toHaveProperty("severity");
      expect(node).toHaveProperty("drift");

      // Severity must be in [0, 1]
      expect(node.severity).toBeGreaterThanOrEqual(0);
      expect(node.severity).toBeLessThanOrEqual(1);

      // Drift direction must be one of the allowed values
      expect(["↑", "↓", "→"]).toContain(node.drift.direction);
      expect(node.drift).toHaveProperty("magnitude");
    });

    // ✅ Spillover structure
    expect(data.risk_chain).toHaveProperty("spillover");
    expect(data.risk_chain.spillover).toHaveProperty("score");
    expect(data.risk_chain.spillover.score).toBeGreaterThanOrEqual(0);
    expect(data.risk_chain.spillover.score).toBeLessThanOrEqual(1);
    expect(data.risk_chain.spillover).toHaveProperty("linked_communities");
    expect(Array.isArray(data.risk_chain.spillover.linked_communities)).toBe(true);
    expect(data.risk_chain.spillover).toHaveProperty("pathway");

    // ✅ Metadata structure
    expect(data.metadata).toHaveProperty("as_of_timestamp");
    expect(data.metadata).toHaveProperty("dataset_versions");
    expect(Array.isArray(data.metadata.dataset_versions)).toBe(true);
    expect(data.metadata.dataset_versions.length).toBeGreaterThan(0);

    // ✅ Dataset versions validation
    data.metadata.dataset_versions.forEach((version) => {
      expect(version).toHaveProperty("source_id");
      expect(version).toHaveProperty("version");
      expect(version).toHaveProperty("as_of");
      expect(typeof version.source_id).toBe("string");
      expect(typeof version.version).toBe("string");
      expect(typeof version.as_of).toBe("string");
    });
  });

  it("returns 400 for missing required fields", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        // Missing location_key
        selected_hazards: ["Heat"],
        selected_system: "Health"
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty("error");
  });

  it("returns 405 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET"
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});