import { useState } from "react";
import { WizardState } from "../WizardFlow";
import { DashboardViewModel } from "@/contracts/dashboard";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudRain, Sun, Wind, Droplets, ThermometerSun } from "lucide-react";

interface ClimateHazardStepProps {
  wizardState: WizardState;
  setWizardState: (state: WizardState) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ClimateHazardStep({ wizardState, setWizardState, onNext, onBack }: ClimateHazardStepProps) {
  const hazards = [
    { id: "Heat", label: "Extreme Heat", icon: ThermometerSun, color: "from-orange-500/20 to-red-500/20" },
    { id: "Flood", label: "Urban Flooding", icon: CloudRain, color: "from-blue-500/20 to-cyan-500/20" },
    { id: "Drought", label: "Drought", icon: Sun, color: "from-yellow-500/20 to-orange-500/20" },
    { id: "Storm", label: "Severe Storms", icon: Wind, color: "from-slate-500/20 to-gray-500/20" },
    { id: "SeaLevel", label: "Sea Level Rise", icon: Droplets, color: "from-indigo-500/20 to-blue-500/20" },
  ];

  const toggleHazard = (hazardId: string) => {
    const isSelected = wizardState.selected_hazards.includes(hazardId);
    const newHazards = isSelected
      ? wizardState.selected_hazards.filter((h) => h !== hazardId)
      : [...wizardState.selected_hazards, hazardId];

    setWizardState({
      ...wizardState,
      selected_hazards: newHazards,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Climate Pressure</h2>
        <p className="text-slate-400">
          Select the climate hazards you want to assess for your location
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {hazards.map((hazard) => {
          const Icon = hazard.icon;
          const isSelected = wizardState.selected_hazards.includes(hazard.id);

          return (
            <Card
              key={hazard.id}
              className={`cursor-pointer transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${hazard.color} border-transparent shadow-lg scale-105`
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
              }`}
              onClick={() => toggleHazard(hazard.id)}
            >
              <div className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleHazard(hazard.id)}
                  className={isSelected ? "border-white" : "border-slate-600"}
                />
                <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <Label
                  className={`flex-1 cursor-pointer font-medium ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {hazard.label}
                </Label>
              </div>
            </Card>
          );
        })}
      </div>

      {wizardState.selected_hazards.length > 0 && (
        <div className="text-sm text-slate-400">
          {wizardState.selected_hazards.length} hazard{wizardState.selected_hazards.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}