/**
 * Staging API Integration Test
 * Validates real backend responses against Zod schema
 * 
 * Run with: NEXT_PUBLIC_API_MODE=real NEXT_PUBLIC_API_BASE_URL=https://staging.api.example.com npm test
 */

import { getUnifiedDashboard } from "@/lib/api/orchestrator";
import { WizardState } from "@/components/wizard/WizardFlow";
import { validateDashboard } from "@/contracts/dashboard";
import { getAPIConfig } from "@/lib/config/api-config";

describe("Staging API Integration Tests", () => {
  // Skip these tests in mock mode
  const config = getAPIConfig();
  const shouldRun = config.mode === "real";

  const runIf = shouldRun ? it : it.skip;

  runIf("fetches valid dashboard from staging endpoint", async () => {
    const testInput: WizardState = {
      location_key: "test-manhattan-ny-10001",
      selected_hazards: ["Heat", "Flood"],
      selected_system: "Health",
      precision_level: "approximate"
    };

    const dashboard = await getUnifiedDashboard(testInput);

    // ✅ Validate response with Zod schema
    const validation = validateDashboard(dashboard);
    expect(validation.success).toBe(true);
    expect(validation.errors).toBeUndefined();

    // ✅ Assert required top-level fields
    expect(dashboard).toHaveProperty("location");
    expect(dashboard).toHaveProperty("baseline");
    expect(dashboard).toHaveProperty("risk_chain");
    expect(dashboard).toHaveProperty("metadata");

    // ✅ Location invariants
    expect(dashboard.location.location_key).toBe(testInput.location_key);
    expect(typeof dashboard.location.normalized_address).toBe("string");
    expect(dashboard.location.normalized_address.length).toBeGreaterThan(0);

    // ✅ Baseline invariants
    expect(dashboard.baseline.warming_estimate).toBeGreaterThanOrEqual(0);
    expect(dashboard.baseline.warming_estimate).toBeLessThanOrEqual(10); // Realistic range
    expect(dashboard.baseline.unit).toBe("°C");
    expect(["High", "Medium", "Low"]).toContain(dashboard.baseline.confidence.level);

    // ✅ Risk chain invariants
    expect(dashboard.risk_chain.hazard).toBe(testInput.selected_hazards[0]);
    expect(dashboard.risk_chain.system).toBe(testInput.selected_system);
    expect(Array.isArray(dashboard.risk_chain.nodes)).toBe(true);
    expect(dashboard.risk_chain.nodes.length).toBeGreaterThan(0);

    // ✅ Node invariants
    dashboard.risk_chain.nodes.forEach((node, idx) => {
      // Severity must be in [0, 1]
      expect(node.severity).toBeGreaterThanOrEqual(0);
      expect(node.severity).toBeLessThanOrEqual(1);

      // Drift direction must be enum
      expect(["↑", "↓", "→"]).toContain(node.drift.direction);
      expect(["Strong", "Moderate", "Weak"]).toContain(node.drift.magnitude);

      // Required fields
      expect(typeof node.id).toBe("string");
      expect(typeof node.label).toBe("string");
      expect(node.label.length).toBeGreaterThan(0);
    });

    // ✅ Spillover invariants
    expect(dashboard.risk_chain.spillover.score).toBeGreaterThanOrEqual(0);
    expect(dashboard.risk_chain.spillover.score).toBeLessThanOrEqual(1);
    expect(Array.isArray(dashboard.risk_chain.spillover.linked_communities)).toBe(true);
    expect(typeof dashboard.risk_chain.spillover.pathway).toBe("string");

    // ✅ Metadata invariants
    expect(typeof dashboard.metadata.as_of_timestamp).toBe("string");
    expect(new Date(dashboard.metadata.as_of_timestamp).toString()).not.toBe("Invalid Date");
    
    expect(Array.isArray(dashboard.metadata.dataset_versions)).toBe(true);
    expect(dashboard.metadata.dataset_versions.length).toBeGreaterThan(0);

    dashboard.metadata.dataset_versions.forEach((version) => {
      expect(typeof version.source_id).toBe("string");
      expect(typeof version.version).toBe("string");
      expect(typeof version.as_of).toBe("string");
      expect(version.source_id.length).toBeGreaterThan(0);
      expect(version.version.length).toBeGreaterThan(0);
    });

    // ✅ Log successful integration test
    console.log("✅ Staging API validation passed");
    console.log("Dataset versions:", dashboard.metadata.dataset_versions);
    console.log("Node count:", dashboard.risk_chain.nodes.length);
    console.log("Cache key:", JSON.stringify({
      location: testInput.location_key,
      hazards: testInput.selected_hazards,
      system: testInput.selected_system
    }));
  }, 30000); // 30 second timeout for network requests

  runIf("handles API errors gracefully", async () => {
    const invalidInput: WizardState = {
      location_key: "invalid-location-that-should-not-exist-12345",
      selected_hazards: ["Heat"],
      selected_system: "Health",
      precision_level: "exact"
    };

    // Should either return valid data or throw a clear error
    try {
      const dashboard = await getUnifiedDashboard(invalidInput);
      
      // If it returns data, validate it
      const validation = validateDashboard(dashboard);
      expect(validation.success).toBe(true);
    } catch (error) {
      // If it throws, error should be clear
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message.length).toBeGreaterThan(0);
      console.log("Expected error:", (error as Error).message);
    }
  }, 30000);
});

/**
 * Run instructions:
 * 
 * Mock mode (default):
 * npm test -- src/__tests__/integration/staging-api.test.ts
 * 
 * Staging mode:
 * NEXT_PUBLIC_API_MODE=real NEXT_PUBLIC_API_BASE_URL=https://staging.api.example.com npm test -- src/__tests__/integration/staging-api.test.ts
 * 
 * Production mode:
 * NEXT_PUBLIC_API_MODE=real NEXT_PUBLIC_API_BASE_URL=https://api.climatewizard.ai/v1 npm test -- src/__tests__/integration/staging-api.test.ts
 */