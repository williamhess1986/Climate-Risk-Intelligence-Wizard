/**
 * Unified Dashboard Orchestrator
 * Fetches complete DashboardViewModel in one call
 * Supports both mock and real API modes
 */

import type { WizardState } from "@/components/wizard/WizardFlow";
import type { DashboardViewModel } from "@/contracts/dashboard";
import { validateDashboard } from "@/contracts/dashboard";
import { getAPIConfig, apiLogger, isMockMode, getEndpointURL } from "@/lib/config/api-config";

// ============================================================================
// Dataset Registry
// ============================================================================

interface DatasetVersions {
  baseline: string;
  reanalysis: string;
  exposure: string;
  connectivity: string;
  observations: string;
  [key: string]: string; // Index signature for hashing
}

class DatasetRegistry {
  private static versions: DatasetVersions = {
    baseline: "CMIP6-v1.2",
    reanalysis: "v5.1",
    exposure: "gap-uw-v2.1",
    connectivity: "commuting-census-2020",
    observations: "noaa-ncei-2024.10"
  };

  static current(): DatasetVersions {
    return { ...this.versions };
  }

  static toArray() {
    return [
      {
        source_id: "IPCC-AR6",
        version: this.versions.baseline,
        as_of: "2023-11-10"
      },
      {
        source_id: "NOAA",
        version: this.versions.reanalysis,
        as_of: "2024-01-15"
      },
      {
        source_id: "ERA5",
        version: this.versions.observations,
        as_of: "2024-02-01"
      }
    ];
  }

  static hash(): string {
    return hashObject(this.versions);
  }
}

// ============================================================================
// Cache Layer
// ============================================================================

interface CacheEntry {
  value: DashboardViewModel;
  expiresAt: number;
}

class CacheLayer {
  private cache: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<DashboardViewModel | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: DashboardViewModel, ttl = 3600000): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cacheLayer = new CacheLayer();

// ============================================================================
// Utility Functions
// ============================================================================

function hashObject(obj: Record<string, unknown>): string {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function generateCacheKey(inputs: WizardState): string {
  const hazardsKey = [...inputs.selected_hazards].sort().join(',');
  const datasetVersionsHash = DatasetRegistry.hash();
  
  return [
    "wizard",
    inputs.location_key,
    inputs.precision_level || "approximate",
    hazardsKey,
    inputs.selected_system,
    datasetVersionsHash
  ].join(":");
}

// ============================================================================
// Domain Services
// ============================================================================

class LocationService {
  static async getRegion(location_key: string): Promise<DashboardViewModel["location"]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      location_key,
      normalized_address: "Manhattan, New York, NY",
      region_profile: {
        climate_regime: "Humid Subtropical",
        exposure_flags: ["Coastal", "Urban Heat Island"]
      }
    };
  }
}

class ClimateService {
  static async getBaseline(inputs: WizardState): Promise<DashboardViewModel["baseline"]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const warming = inputs.precision_level === "exact" ? 1.4 : 1.2;

    return {
      warming_estimate: warming,
      unit: "°C",
      period_comparison: "vs 1850-1900 global baseline",
      confidence: {
        level: inputs.precision_level === "exact" ? "High" : "Medium",
        reason: inputs.precision_level === "exact"
          ? "Anchored to NOAA v5.1 modern reanalysis"
          : "ERA5 reanalysis with bias correction"
      }
    };
  }
}

class RiskService {
  static async getChain(inputs: WizardState): Promise<DashboardViewModel["risk_chain"]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const hazardLabel = inputs.selected_hazards[0] || "Heat";
    const systemLabel = inputs.selected_system || "Health";

    const nodes: DashboardViewModel["risk_chain"]["nodes"] = [
      {
        id: "node_1",
        type: "Risk",
        label: `Extreme ${hazardLabel} Event`,
        severity: 0.85,
        description: "Primary hazard intensification event",
        drivers: ["Climate Change", "Natural Variability"],
        drift: { direction: "↑", magnitude: "Strong", confidence: "High" },
        uncertainty: "Low"
      },
      {
        id: "node_2",
        type: "Impact",
        label: "Infrastructure Stress",
        severity: 0.70,
        description: "Physical degradation of critical assets",
        drivers: ["Extreme Heat", "Aging Infrastructure"],
        drift: { direction: "↑", magnitude: "Moderate", confidence: "Medium" },
        uncertainty: "Medium"
      },
      {
        id: "node_3",
        type: "Stress",
        label: `${systemLabel} System Pressure`,
        severity: 0.72,
        description: "Operational capacity near limits",
        drivers: ["Infrastructure Stress", "Demand Surge"],
        drift: { direction: "→", magnitude: "Weak", confidence: "Medium" },
        uncertainty: "Medium"
      },
      {
        id: "node_4",
        type: "Response",
        label: "Emergency Response Activation",
        severity: 0.58,
        description: "Deployment of contingency resources",
        drivers: ["System Pressure"],
        drift: { direction: "→", magnitude: "Weak", confidence: "Low" },
        uncertainty: "High"
      },
      {
        id: "node_5",
        type: "Market",
        label: "Economic Ripple Effects",
        severity: 0.45,
        description: "Localized financial disruption",
        drivers: ["System Pressure", "Response Costs"],
        drift: { direction: "↑", magnitude: "Moderate", confidence: "Medium" },
        uncertainty: "High"
      },
      {
        id: "node_6",
        type: "Behavior",
        label: "Population Adaptation",
        severity: 0.52,
        description: "Short-term behavioral shifts",
        drivers: ["Perceived Risk"],
        drift: { direction: "→", magnitude: "Weak", confidence: "Low" },
        uncertainty: "Very High"
      },
      {
        id: "node_7",
        type: "Feedback",
        label: "Systemic Feedback Loop",
        severity: 0.38,
        description: "Reinforcing cycle of vulnerability",
        drivers: ["Economic Ripple Effects", "Population Adaptation"],
        drift: { direction: "↑", magnitude: "Strong", confidence: "Low" },
        uncertainty: "High"
      }
    ];

    return {
      hazard: hazardLabel,
      system: systemLabel,
      nodes,
      spillover: {
        score: 0.62,
        linked_communities: ["Adjacent Metro Area", "Upstream Region", "Connected Zone"],
        pathway: "Commuting/Labor"
      }
    };
  }
}

// ============================================================================
// Unified Dashboard Orchestrator
// ============================================================================

export async function getUnifiedDashboard(inputs: WizardState): Promise<DashboardViewModel> {
  const config = getAPIConfig();
  
  // Validate inputs
  if (!inputs.location_key || !inputs.selected_hazards.length || !inputs.selected_system) {
    const error = "Missing required inputs: location_key, selected_hazards, selected_system";
    apiLogger.error(error, { inputs });
    throw new Error(error);
  }

  // Generate cache/request key
  const cacheKey = generateCacheKey(inputs);
  apiLogger.info("Dashboard request", { 
    cacheKey, 
    inputs: {
      location_key: inputs.location_key,
      selected_hazards: inputs.selected_hazards,
      selected_system: inputs.selected_system,
      precision_level: inputs.precision_level
    },
    mode: config.mode 
  });

  // Check cache
  const cached = await cacheLayer.get(cacheKey);
  if (cached) {
    apiLogger.info("✅ Cache hit:", cacheKey);
    return cached;
  }

  apiLogger.info("🔄 Cache miss, fetching data:", cacheKey);

  let dashboard: DashboardViewModel;

  // ✅ MODE-BASED ORCHESTRATION
  if (isMockMode()) {
    // Use local mock services
    apiLogger.verbose("Using MOCK services");
    
    const [region, baseline, riskChain] = await Promise.all([
      LocationService.getRegion(inputs.location_key),
      ClimateService.getBaseline(inputs),
      RiskService.getChain(inputs)
    ]);

    dashboard = {
      location: region,
      baseline,
      risk_chain: riskChain,
      metadata: {
        as_of_timestamp: new Date().toISOString(),
        dataset_versions: DatasetRegistry.toArray(),
        provenance: "Combined regional anomaly modeling with local connectivity graph service."
      }
    };
  } else {
    // ✅ REAL MODE: HTTP API call
    apiLogger.info("Fetching dashboard from real API", { cacheKey, inputs });
    
    try {
      const response = await fetch(getEndpointURL("/wizard/dashboard"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": cacheKey // ✅ Request correlation
        },
        body: JSON.stringify(inputs),
        signal: AbortSignal.timeout(config.timeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        apiLogger.error("API request failed", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          cacheKey
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      dashboard = await response.json();
      apiLogger.info("✅ Real API response received", {
        cacheKey,
        as_of: dashboard.metadata?.as_of_timestamp
      });
    } catch (error) {
      apiLogger.error("API call failed", {
        error: error instanceof Error ? error.message : String(error),
        cacheKey,
        inputs
      });
      throw error;
    }
  }

  // ✅ RUNTIME VALIDATION with observability
  const validation = validateDashboard(dashboard);
  
  if (!validation.success) {
    apiLogger.error("Dashboard validation failed", {
      errors: validation.errors,
      cacheKey,
      inputs,
      dataset_versions: dashboard.metadata?.dataset_versions
    });
    
    throw new Error(
      `Invalid dashboard structure: ${validation.errors?.join(", ")}`
    );
  }

  // ✅ Log successful validation
  apiLogger.info("✅ Dashboard validated successfully", {
    cacheKey,
    as_of_timestamp: dashboard.metadata.as_of_timestamp,
    dataset_versions: dashboard.metadata.dataset_versions.map(v => ({
      source: v.source_id,
      version: v.version
    })),
    node_count: dashboard.risk_chain.nodes.length
  });

  // Cache for 1 hour
  await cacheLayer.set(cacheKey, dashboard);

  return dashboard;
}

// ============================================================================
// Exports
// ============================================================================

export {
  DatasetRegistry,
  CacheLayer,
  LocationService,
  ClimateService,
  RiskService,
  cacheLayer,
  generateCacheKey
};