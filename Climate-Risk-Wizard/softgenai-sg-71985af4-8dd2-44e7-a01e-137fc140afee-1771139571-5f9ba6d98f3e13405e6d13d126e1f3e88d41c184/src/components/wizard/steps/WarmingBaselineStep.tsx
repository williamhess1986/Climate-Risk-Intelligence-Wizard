import type { WizardState } from "../WizardFlow";
import type { DashboardViewModel } from "@/contracts/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThermometerSun, AlertTriangle, Info } from "lucide-react";

interface WarmingBaselineStepProps {
  wizardState: WizardState;
  setWizardState: (state: WizardState) => void;
  dashboardData: DashboardViewModel | null;
  onNext: () => void;
  onBack: () => void;
  onRestart?: () => void;
}

export function WarmingBaselineStep({ 
  dashboardData, 
  onNext, 
  onBack 
}: WarmingBaselineStepProps) {
  // ✅ Pure preview slice - no API calls
  const data = dashboardData?.baseline;

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-400">
        No baseline data available
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Local Warming Baseline</h2>
        <p className="text-slate-400">Current temperature anomaly vs. pre-industrial levels</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-8 bg-gradient-to-br from-orange-950/50 to-slate-900 border-orange-900/30 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-orange-500/10 rounded-full mb-4 ring-1 ring-orange-500/30">
            <ThermometerSun className="w-12 h-12 text-orange-500" />
          </div>
          <div className="text-6xl font-bold text-white mb-2 tracking-tighter">
            +{data.warming_estimate}{data.unit}
          </div>
          <div className="text-sm text-orange-300 font-medium bg-orange-950/50 px-3 py-1 rounded-full border border-orange-900/50">
            {data.period_comparison}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Impact Context
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              At this level of warming, extreme heat events occur 
              <span className="text-white font-semibold"> 2.8x more frequently</span> than 
              in the historical baseline. This accelerates infrastructure degradation and health risks.
            </p>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Confidence Level
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-900/50">
                {data.confidence.level}
              </span>
            </div>
            <p className="text-xs text-slate-500 italic">
              "{data.confidence.reason}"
            </p>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-500">
          View Risk Chain
        </Button>
      </div>
    </div>
  );
}