import { useState } from "react";
import { WizardState } from "../WizardFlow";
import { DashboardViewModel } from "@/contracts/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Beef, Zap, Heart, Building2, DollarSign, Briefcase, ArrowRight, RefreshCw, Eye } from "lucide-react";

interface SystemConcernStepProps {
  wizardState: WizardState;
  setWizardState: (state: WizardState) => void;
  dashboardData?: DashboardViewModel | null;
  onNext: () => void;
  onBack: () => void;
  onRestart?: () => void;
}

const SYSTEMS = [
  { id: "housing", label: "Housing", icon: Home, color: "from-blue-500 to-cyan-500", description: "Residential infrastructure & real estate" },
  { id: "food", label: "Food Systems", icon: Beef, color: "from-green-500 to-emerald-500", description: "Agriculture, supply chains, & food security" },
  { id: "power", label: "Energy & Power", icon: Zap, color: "from-yellow-500 to-orange-500", description: "Electricity grids & energy infrastructure" },
  { id: "health", label: "Healthcare", icon: Heart, color: "from-red-500 to-pink-500", description: "Public health systems & medical services" },
  { id: "services", label: "Public Services", icon: Building2, color: "from-purple-500 to-violet-500", description: "Municipal services & infrastructure" },
  { id: "finance", label: "Financial Systems", icon: DollarSign, color: "from-emerald-500 to-teal-500", description: "Banking, insurance, & markets" },
  { id: "jobs", label: "Employment", icon: Briefcase, color: "from-indigo-500 to-blue-500", description: "Labor markets & economic stability" },
];

export function SystemConcernStep({ wizardState, setWizardState, onNext, dashboardData }: SystemConcernStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System of Concern</h2>
        <p className="text-slate-400">
          Choose the primary system you want to analyze for climate risk impacts
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SYSTEMS.map((system) => {
          const Icon = system.icon;
          const isSelected = wizardState.selected_system === system.id;

          return (
            <Card
              key={system.id}
              className={`cursor-pointer transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${system.color} border-transparent shadow-lg scale-105`
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
              }`}
              onClick={() => setWizardState({ ...wizardState, selected_system: system.id })}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-white/20" : "bg-slate-700/50"
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <h3 className={`font-semibold text-lg ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {system.label}
                  </h3>
                </div>
                <p className={`text-sm ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                  {system.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ✅ Explicit "Generate/Regenerate Dashboard" CTA */}
      {wizardState.selected_system && (
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <p>Ready to analyze climate risks for the <span className="text-white font-medium">{SYSTEMS.find(s => s.id === wizardState.selected_system)?.label}</span> system?</p>
            </div>
            <Button
              onClick={onNext}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {dashboardData ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Dashboard
                </>
              ) : (
                <>
                  Generate Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}