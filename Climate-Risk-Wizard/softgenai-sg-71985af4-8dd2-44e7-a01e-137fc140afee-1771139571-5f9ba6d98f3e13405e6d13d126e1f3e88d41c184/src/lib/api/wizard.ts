/**
 * Climate Risk Wizard API Client
 * Aligned with Actual Backend Response Format
 */

// ============================================================================
// Request Schemas (OpenAPI-aligned)
// ============================================================================

export interface LocationResolveByAddress {
  address: string;
}

export interface LocationResolveByCoords {
  lat: number;
  lng: number;
}

export type LocationResolveRequest = LocationResolveByAddress | LocationResolveByCoords;

export interface DashboardRequest {
  location_key: string;
  hazards: string[];
  system: string;
  precision_level?: "exact" | "approximate";
}

// ============================================================================
// Response Schemas - Actual Backend Format
// ============================================================================

// Location (embedded in dashboard response)
export interface LocationData {
  location_key: string;
  normalized_address: string;
  region_profile: {
    climate_regime: string;
    exposure_flags: string[];
    urbanicity?: string;
    elevation_band?: string;
    vegetation_class?: string;
  };
}

// Location Response (standalone endpoint)
export interface LocationResponse extends LocationData {
  as_of_timestamp: string;
  dataset_versions: string[];
  provenance: ProvenanceItem[];
  confidence: Confidence;
  coordinates?: { lat: number; lng: number }; // Added for UI mapping
}

// Legacy schemas for location endpoint (OpenAPI compliance)
export interface Confidence {
  confidence_level: "High" | "Medium" | "Low";
  confidence_score?: number;
  confidence_reason: string;
}

export interface ProvenanceItem {
  source_id: string;
  dataset_version: string;
  as_of: string;
  notes?: string;
}

// Baseline Data (embedded in dashboard)
export interface BaselineData {
  warming_estimate: number;
  unit: string;
  period_comparison: string;
  confidence: {
    level: "High" | "Medium" | "Low";
    reason: string;
  };
}

// Risk Chain Node
export interface RiskChainNode {
  id: string;
  type: string;
  label: string;
  severity: number;
  drift: {
    direction: "↑" | "↓" | "→";
    magnitude: string;
  };
}

// Spillover (embedded in risk_chain)
export interface SpilloverData {
  score: number;
  linked_communities: string[];
  pathway: string;
}

// Risk Chain Data (embedded in dashboard)
export interface RiskChainData {
  hazard: string;
  system: string;
  nodes: RiskChainNode[];
  spillover: SpilloverData;
}

// Dataset Version (simplified)
export interface DatasetVersion {
  source_id: string;
  version: string;
  as_of: string;
}

// Metadata
export interface ResponseMetadata {
  as_of_timestamp: string;
  dataset_versions: DatasetVersion[];
  provenance: string;
}

// Complete Dashboard Response (unified)
export interface DashboardResponse {
  location: LocationData;
  baseline: BaselineData;
  risk_chain: RiskChainData;
  metadata: ResponseMetadata;
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// API Client
// ============================================================================

class WizardAPIClient {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  /**
   * Resolve location to stable key and region profile
   */
  async resolveLocation(request: LocationResolveRequest): Promise<LocationResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const address = 'address' in request ? request.address : `${request.lat}, ${request.lng}`;
    
    return {
      location_key: "geo_9921_nyc",
      normalized_address: address,
      coordinates: { lat: 40.7128, lng: -74.0060 }, // Mock coordinates
      region_profile: {
        climate_regime: "Humid Subtropical",
        exposure_flags: ["Coastal", "Urban Heat Island"],
        urbanicity: "Urban"
      },
      as_of_timestamp: new Date().toISOString(),
      dataset_versions: ["v1.0"],
      provenance: [],
      confidence: {
        confidence_level: "High",
        confidence_score: 0.95,
        confidence_reason: "Exact address match with high-resolution geocoding"
      }
    };
  }

  /**
   * Get Baseline Data (Step 4)
   */
  async getBaseline(request: { location_key: string }): Promise<BaselineData> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      warming_estimate: 1.2,
      unit: "°C",
      period_comparison: "vs 1850-1900 global baseline",
      confidence: {
        level: "High",
        reason: "Anchored to NOAA v5.1 modern reanalysis"
      }
    };
  }

  /**
   * Get Risk Chain Data (Step 5)
   */
  async getRiskChain(request: { location_key: string; hazards: string[]; system: string }): Promise<RiskChainData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      hazard: request.hazards[0] || "Heat",
      system: request.system,
      nodes: [
        {
          id: "node_1",
          type: "Risk",
          label: "Extreme Heat Event",
          severity: 0.85,
          drift: { direction: "↑", magnitude: "high" }
        },
        {
          id: "node_2",
          type: "Impact",
          label: "Infrastructure Stress",
          severity: 0.70,
          drift: { direction: "↑", magnitude: "medium" }
        }
      ],
      spillover: {
        score: 0.45,
        linked_communities: ["Brooklyn", "Jersey City"],
        pathway: "Commuting/Labor"
      }
    };
  }

  /**
   * Generate complete climate intelligence dashboard
   */
  async getDashboard(request: DashboardRequest): Promise<DashboardResponse> {
    const response = await fetch(`${this.baseURL}/wizard/dashboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw error;
    }

    return response.json();
  }
}

export const wizardAPI = new WizardAPIClient();