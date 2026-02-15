/**
 * API Route: POST /api/wizard/dashboard
 * Generates complete climate intelligence dashboard
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUnifiedDashboard } from '@/lib/api/orchestrator';
import { DashboardRequest, ErrorResponse } from '@/lib/api/wizard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Only POST allowed' });
  }

  try {
    const dashboardRequest = req.body;
    
    // Validate request
    if (!dashboardRequest.location_key || !dashboardRequest.selected_hazards?.length) {
      return res.status(400).json({ 
        error: 'invalid_request', 
        message: 'Missing required fields: location_key, selected_hazards' 
      });
    }

    // Map API request to internal WizardState
    const wizardState: any = {
      location_key: dashboardRequest.location_key,
      selected_hazards: dashboardRequest.selected_hazards,
      selected_system: dashboardRequest.selected_system,
      precision_level: dashboardRequest.precision_level || "approximate"
    };

    // Call Orchestrator
    const result = await getUnifiedDashboard(wizardState);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Wizard API Error:', error);
    
    // Return structured error
    const errorResponse: ErrorResponse = {
      error: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    
    return res.status(500).json(errorResponse);
  }
}