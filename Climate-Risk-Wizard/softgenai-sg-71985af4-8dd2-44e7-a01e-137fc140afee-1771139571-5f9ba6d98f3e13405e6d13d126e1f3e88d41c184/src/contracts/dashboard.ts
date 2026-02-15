/**
 * Dashboard Contract - Single Source of Truth
 * 
 * This contract defines the complete structure of the DashboardViewModel.
 * All code (backend, frontend, tests) MUST import from this file.
 * 
 * Why This Matters:
 * - Zod schema is the runtime validator
 * - TypeScript types are inferred from the schema
 * - No manual sync between types and validation
 * - Backend evolution automatically propagates to frontend
 * 
 * @module contracts/dashboard
 */

import { z } from "zod";

// ============================================================================
// Zod Schemas (Runtime Validation)
// ============================================================================

/**
 * Confidence Schema
 * Represents confidence level and reasoning for estimates
 */
const ConfidenceSchema = z.object({
  level: z.enum(["High", "Medium", "Low"], {
    errorMap: () => ({ message: "Confidence level must be High, Medium, or Low" })
  }),
  score: z.number().min(0).max(1).optional(),
  reason: z.string().min(1, "Confidence reason is required")
});

/**
 * Coordinates Schema
 * Geographic coordinates with validation
 */
const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  lng: z.number().min(-180).max(180, "Longitude must be between -180 and 180")
});

/**
 * Region Profile Schema
 * Climate and geographic characteristics of a location
 */
const RegionProfileSchema = z.object({
  climate_regime: z.string().min(1, "Climate regime is required"),
  exposure_flags: z.array(z.string()),
  urbanicity: z.enum(["urban", "suburban", "rural"]).optional(),
  elevation_band: z.string().optional(),
  vegetation_class: z.string().optional()
});

/**
 * Location Schema
 * Complete location information including normalized address and profile
 */
const LocationSchema = z.object({
  location_key: z.string().min(1, "location_key is required"),
  normalized_address: z.string().min(1, "normalized_address is required"),
  coordinates: CoordinatesSchema.optional(),
  region_profile: RegionProfileSchema
});

/**
 * Baseline Schema
 * Warming baseline estimates and confidence
 */
const BaselineSchema = z.object({
  warming_estimate: z.number()
    .min(0, "Warming estimate must be non-negative")
    .max(10, "Warming estimate must be realistic (≤10°C)"),
  unit: z.literal("°C", {
    errorMap: () => ({ message: "Unit must be °C" })
  }),
  period_comparison: z.string().min(1, "Period comparison is required"),
  confidence: ConfidenceSchema
});

/**
 * Drift Schema
 * Represents trend direction and magnitude
 */
const DriftSchema = z.object({
  direction: z.enum(["↑", "↓", "→"], {
    errorMap: () => ({ message: "Drift direction must be ↑, ↓, or →" })
  }),
  magnitude: z.enum(["Strong", "Moderate", "Weak"], {
    errorMap: () => ({ message: "Drift magnitude must be Strong, Moderate, or Weak" })
  }),
  confidence: z.enum(["High", "Medium", "Low"])
});

/**
 * Risk Node Schema
 * Individual risk factor in the causal chain
 */
const RiskNodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),
  label: z.string().min(1, "Node label is required"),
  type: z.enum(["Risk", "Impact", "Stress", "Response", "Market", "Behavior", "Feedback"], {
    errorMap: () => ({ message: "Node type must be valid enum value" })
  }),
  severity: z.number()
    .min(0, "Severity must be >= 0")
    .max(1, "Severity must be <= 1"),
  description: z.string().min(1, "Node description is required"),
  drivers: z.array(z.string()),
  drift: DriftSchema,
  uncertainty: z.string().min(1, "Uncertainty description is required")
});

/**
 * Spillover Schema
 * Regional risk transmission information
 */
const SpilloverSchema = z.object({
  score: z.number()
    .min(0, "Spillover score must be >= 0")
    .max(1, "Spillover score must be <= 1"),
  linked_communities: z.array(z.string()),
  pathway: z.string().min(1, "Spillover pathway is required")
});

/**
 * Risk Chain Schema
 * Complete causal chain from hazard to impacts
 */
const RiskChainSchema = z.object({
  hazard: z.string().min(1, "Hazard is required"),
  system: z.string().min(1, "System is required"),
  nodes: z.array(RiskNodeSchema).min(1, "Risk chain must have at least one node"),
  spillover: SpilloverSchema
});

/**
 * Dataset Version Schema
 * Tracks data sources and versions for reproducibility
 */
const DatasetVersionSchema = z.object({
  source_id: z.string().min(1, "Source ID is required"),
  version: z.string().min(1, "Version is required"),
  as_of: z.string().min(1, "as_of timestamp is required")
});

/**
 * Metadata Schema
 * Provenance and dataset information
 */
const MetadataSchema = z.object({
  as_of_timestamp: z.string().min(1, "as_of_timestamp is required"),
  dataset_versions: z.array(DatasetVersionSchema).min(1, "At least one dataset version is required"),
  provenance: z.string().min(1, "Provenance description is required")
});

/**
 * Complete Dashboard View Model Schema
 * 
 * This is the authoritative contract for the entire dashboard.
 * All API responses MUST validate against this schema.
 */
export const DashboardViewModelSchema = z.object({
  location: LocationSchema,
  baseline: BaselineSchema,
  risk_chain: RiskChainSchema,
  metadata: MetadataSchema
});

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

/**
 * Inferred TypeScript type for dashboard validation
 * This is the ONLY type definition - no manual sync needed
 */
export type DashboardViewModel = z.infer<typeof DashboardViewModelSchema>;

/**
 * Component types (exported for convenience)
 */
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type RegionProfile = z.infer<typeof RegionProfileSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Baseline = z.infer<typeof BaselineSchema>;
export type Drift = z.infer<typeof DriftSchema>;
export type RiskNode = z.infer<typeof RiskNodeSchema>;
export type Spillover = z.infer<typeof SpilloverSchema>;
export type RiskChain = z.infer<typeof RiskChainSchema>;
export type DatasetVersion = z.infer<typeof DatasetVersionSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate a dashboard object against the contract
 * 
 * @param data - Unknown data to validate
 * @returns Validation result with typed data or errors
 * 
 * @example
 * ```typescript
 * const result = validateDashboard(apiResponse);
 * if (result.success) {
 *   // result.data is fully typed DashboardViewModel
 *   console.log(result.data.location.location_key);
 * } else {
 *   // result.errors contains detailed validation errors
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateDashboard(data: unknown): {
  success: boolean;
  data?: DashboardViewModel;
  errors?: string[];
} {
  try {
    const validated = DashboardViewModelSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      // Log detailed errors in development only
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Dashboard validation failed:");
        console.error(JSON.stringify(error.errors, null, 2));
      }
      
      return { success: false, errors };
    }
    
    return { success: false, errors: ["Unknown validation error"] };
  }
}

/**
 * Safe parse helper (doesn't throw)
 * Returns null if validation fails
 */
export function safeParseDashboard(data: unknown): DashboardViewModel | null {
  const result = validateDashboard(data);
  return result.success ? result.data! : null;
}

/**
 * Strict parse helper (throws on validation failure)
 * Use when you want to fail fast
 */
export function parseDashboard(data: unknown): DashboardViewModel {
  const result = validateDashboard(data);
  if (!result.success) {
    throw new Error(`Dashboard validation failed: ${result.errors?.join(", ")}`);
  }
  return result.data!;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if data is a valid DashboardViewModel
 */
export function isDashboardViewModel(data: unknown): data is DashboardViewModel {
  return validateDashboard(data).success;
}

/**
 * Assert that data is a valid DashboardViewModel (throws if not)
 */
export function assertDashboardViewModel(data: unknown): asserts data is DashboardViewModel {
  if (!isDashboardViewModel(data)) {
    throw new Error("Data is not a valid DashboardViewModel");
  }
}