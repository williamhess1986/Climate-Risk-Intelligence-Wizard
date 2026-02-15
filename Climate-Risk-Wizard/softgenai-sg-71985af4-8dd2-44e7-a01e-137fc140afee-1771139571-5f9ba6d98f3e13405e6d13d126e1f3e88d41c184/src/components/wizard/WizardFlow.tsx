import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { LocationStep } from "./steps/LocationStep";
import { ClimateHazardStep } from "./steps/ClimateHazardStep";
import { SystemConcernStep } from "./steps/SystemConcernStep";
import { WarmingBaselineStep } from "./steps/WarmingBaselineStep";
import { RiskChainStep } from "./steps/RiskChainStep";
import { DashboardStep } from "./steps/DashboardStep";
import type { LocationResponse } from "@/lib/api/wizard";
import { getUnifiedDashboard } from "@/lib/api/orchestrator";
import type { DashboardViewModel } from "@/contracts/dashboard";

export interface WizardState {
  location_key?: string;
  normalized_location?: LocationResponse;
  selected_hazards: string[];
  selected_system?: string;
  precision_level?: "exact" | "approximate";
}

const STEPS = [
  { id: 1, title: "Location", component: LocationStep },
  { id: 2, title: "Climate Pressure", component: ClimateHazardStep },
  { id: 3, title: "System Concern", component: SystemConcernStep },
  { id: 4, title: "Warming Baseline", component: WarmingBaselineStep },
  { id: 5, title: "Risk Chain", component: RiskChainStep },
  { id: 6, title: "Dashboard", component: DashboardStep },
];

export function WizardFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({
    selected_hazards: [],
  });
  const [dashboardData, setDashboardData] = useState<DashboardViewModel | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  // Helper: Generate dashboard request key from wizard inputs
  const generateDashboardKey = (state: WizardState): string => {
    return JSON.stringify({
      location_key: state.location_key,
      hazards: [...state.selected_hazards].sort(), // Sort for consistency
      system: state.selected_system,
      precision: state.precision_level || "approximate"
    });
  };

  // Track the dashboard request key to detect input changes
  const [dashboardRequestKey, setDashboardRequestKey] = useState<string | null>(null);

  // Effect: Invalidate dashboard when inputs change
  useEffect(() => {
    if (!dashboardData) return; // No dashboard to invalidate

    const currentKey = generateDashboardKey(wizardState);
    
    // If inputs changed, invalidate the dashboard
    if (dashboardRequestKey && currentKey !== dashboardRequestKey) {
      console.log("Dashboard inputs changed - invalidating cache");
      
      // ✅ Show user-friendly notification
      toast.warning("Inputs Changed", {
        description: "Please regenerate the dashboard with your new selections.",
        duration: 5000
      });
      
      setDashboardData(null);
      setDashboardRequestKey(null);
      setDashboardError(null);
      
      // If we're past Step 3 (System Concern), go back to Step 3
      if (currentStep > 3) {
        setCurrentStep(3);
      }
    }
  }, [wizardState.location_key, wizardState.selected_hazards, wizardState.selected_system, wizardState.precision_level]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!wizardState.location_key;
      case 2:
        return wizardState.selected_hazards.length > 0;
      case 3:
        return !!wizardState.selected_system;
      case 4:
      case 5:
      case 6:
        // ✅ Guard: Can't proceed through dashboard steps without data
        return !!dashboardData;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    // Special handling: After Step 3 (System), fetch unified dashboard before moving to Step 4
    if (currentStep === 3 && canProceed()) {
      // Generate current request key
      const currentKey = generateDashboardKey(wizardState);
      
      // Only fetch if we don't have data OR the inputs changed
      if (!dashboardData || currentKey !== dashboardRequestKey) {
        setIsLoadingDashboard(true);
        setDashboardError(null);
        
        try {
          const dashboard = await getUnifiedDashboard(wizardState);
          setDashboardData(dashboard);
          setDashboardRequestKey(currentKey); // ✅ Store the key
          setCurrentStep(4); // Move to Warming Baseline
        } catch (error) {
          console.error("Dashboard fetch error:", error);
          
          // ✅ Capture debug context for observability
          const debugContext = {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            inputs: {
              location_key: wizardState.location_key,
              selected_hazards: wizardState.selected_hazards,
              selected_system: wizardState.selected_system,
              precision_level: wizardState.precision_level
            },
            request_key: currentKey
          };
          
          console.error("Dashboard error context:", debugContext);
          
          setDashboardError(
            error instanceof Error 
              ? error.message 
              : "Failed to generate dashboard"
          );
        } finally {
          setIsLoadingDashboard(false);
        }
        return;
      }
      
      // Data is fresh, just navigate
      setCurrentStep(4);
      return;
    }

    // Normal navigation for other steps
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setWizardState({ selected_hazards: [] });
    setDashboardData(null);
    setDashboardError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              Climate Risk Assessment
            </h1>
            <div className="text-sm text-slate-400">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-slate-500">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={step.id === currentStep ? "text-blue-400 font-medium" : ""}
              >
                {step.title}
              </div>
            ))}
          </div>
        </Card>

        {/* Loading State (After Step 3) */}
        {isLoadingDashboard && (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm p-12 mb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Generating Climate Intelligence Dashboard
                </h3>
                <p className="text-slate-400">
                  Analyzing {wizardState.selected_hazards.join(", ")} risks for {wizardState.selected_system} system...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error State */}
        {dashboardError && !isLoadingDashboard && (
          <Card className="bg-red-950/30 border-red-900/50 p-6 mb-8">
            <div className="text-red-300">
              <h3 className="font-semibold mb-2">Dashboard Generation Failed</h3>
              <p className="text-sm mb-4">{dashboardError}</p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleNext()} 
                  className="bg-red-600 hover:bg-red-500"
                >
                  Retry
                </Button>
                <Button
                  onClick={() => {
                    const debugInfo = {
                      error: dashboardError,
                      timestamp: new Date().toISOString(),
                      inputs: {
                        location_key: wizardState.location_key,
                        selected_hazards: wizardState.selected_hazards,
                        selected_system: wizardState.selected_system,
                        precision_level: wizardState.precision_level
                      },
                      request_key: generateDashboardKey(wizardState)
                    };
                    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
                    toast.success("Debug info copied to clipboard");
                  }}
                  variant="outline"
                  className="border-red-800 text-red-300 hover:bg-red-950"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Debug Info
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ✅ Freshness Alert: Dashboard is stale/missing */}
        {!isLoadingDashboard && !dashboardError && currentStep > 3 && !dashboardData && (
          <Card className="bg-yellow-950/30 border-yellow-900/50 p-6 mb-8">
            <div className="text-yellow-300">
              <h3 className="font-semibold mb-2">Dashboard Needs Regeneration</h3>
              <p className="text-sm">
                Your inputs have changed. Please return to Step 3 and regenerate the dashboard.
              </p>
              <Button 
                onClick={() => setCurrentStep(3)} 
                className="mt-4 bg-yellow-600 hover:bg-yellow-500"
              >
                Go to Step 3
              </Button>
            </div>
          </Card>
        )}

        {/* Step Content */}
        {!isLoadingDashboard && !dashboardError && (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm p-8 mb-8">
            <CurrentStepComponent
              wizardState={wizardState}
              setWizardState={setWizardState}
              dashboardData={dashboardData}
              onNext={handleNext}
              onBack={handleBack}
              onRestart={handleRestart}
            />
          </Card>
        )}

        {/* Navigation */}
        {!isLoadingDashboard && !dashboardError && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || currentStep === STEPS.length}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {currentStep === 3 ? "Generate Dashboard" : currentStep === STEPS.length ? "Complete" : "Next"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}