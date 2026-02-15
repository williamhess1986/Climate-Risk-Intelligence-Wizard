import { useState } from "react";
import type { WizardState } from "../WizardFlow";
import type { DashboardViewModel } from "@/contracts/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Share2, ArrowRight, Activity, TrendingUp, TrendingDown, Minus, Filter, Map, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DashboardStepProps {
  wizardState: WizardState;
  dashboardData: DashboardViewModel | null;
  onRestart: () => void;
  onBack?: () => void;
}

export function DashboardStep({
  wizardState,
  dashboardData,
  onRestart
}: DashboardStepProps) {
  const [filterType, setFilterType] = useState<string>("all");
  
  if (!dashboardData) return null;

  const { location, baseline, risk_chain, metadata } = dashboardData;

  // Filter nodes based on user selection
  const filteredNodes = risk_chain.nodes.filter(node => {
    if (filterType === "all") return true;
    if (filterType === "high_severity") return node.severity >= 0.7;
    return node.type.toLowerCase() === filterType.toLowerCase();
  });

  // Calculate Drift Summary
  const driftSummary = risk_chain.nodes.reduce((acc, node) => {
    const dir = node.drift.direction;
    acc[dir] = (acc[dir] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + 
      encodeURIComponent(JSON.stringify(dashboardData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", 
      `climate_risk_${location.location_key}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success("Dashboard exported successfully");
  };

  const handleReproduce = () => {
    // ✅ Create reproducible assessment blob
    const reproduceBlob = {
      wizard_inputs: {
        location_key: wizardState.location_key,
        selected_hazards: wizardState.selected_hazards,
        selected_system: wizardState.selected_system,
        precision_level: wizardState.precision_level || "approximate"
      },
      dashboard_request_key: JSON.stringify({
        location_key: wizardState.location_key,
        hazards: [...wizardState.selected_hazards].sort(),
        system: wizardState.selected_system,
        precision: wizardState.precision_level || "approximate"
      }),
      dataset_versions: metadata.dataset_versions,
      as_of_timestamp: metadata.as_of_timestamp,
      instructions: "Use this blob to reproduce the exact assessment. Paste wizard_inputs into the wizard and verify the dashboard_request_key matches."
    };

    const jsonString = JSON.stringify(reproduceBlob, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      toast.success("Reproduce Assessment Copied!", {
        description: "Assessment configuration copied to clipboard. Paste to reproduce this exact analysis.",
        duration: 4000
      });
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const getDriftIcon = (direction: string) => {
    switch (direction) {
      case "↑": return <TrendingUp className="w-3 h-3 text-red-400" />;
      case "↓": return <TrendingDown className="w-3 h-3 text-green-400" />;
      default: return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 0.8) return "bg-red-500";
    if (score >= 0.6) return "bg-orange-500";
    if (score >= 0.4) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Climate Intelligence Dashboard</h2>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>{location.normalized_address}</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            <span>{location.region_profile.climate_regime}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Risk Chain & Severity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Severity Analysis */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                System Stress & Severity
              </h3>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] bg-slate-950 border-slate-700">
                  <SelectValue placeholder="Filter view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Factors</SelectItem>
                  <SelectItem value="high_severity">High Severity (&ge; 0.7)</SelectItem>
                  <SelectItem value="risk">Direct Risks</SelectItem>
                  <SelectItem value="impact">System Impacts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-5">
              {filteredNodes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No factors match the selected filter.
                </div>
              ) : (
                filteredNodes.map((node) => (
                  <div key={node.id} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700 px-1 py-0 h-5">
                          {node.type}
                        </Badge>
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                          {node.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{(node.severity * 100).toFixed(0)}%</span>
                        {getDriftIcon(node.drift.direction)}
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getSeverityColor(node.severity)} transition-all duration-1000 ease-out`}
                        style={{ width: `${node.severity * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Spillover Analysis */}
          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
             <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
               <Map className="w-4 h-4 text-indigo-400" />
               Regional Spillover
             </h3>
             <div className="flex flex-col sm:flex-row gap-6 items-start">
               <div className="flex-1">
                 <p className="text-sm text-slate-400 mb-3">
                   Risks in this location are strongly linked to these communities:
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {risk_chain.spillover.linked_communities.map(comm => (
                     <Badge key={comm} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700">
                       {comm}
                     </Badge>
                   ))}
                 </div>
               </div>
               <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 min-w-[200px]">
                 <div className="text-xs text-slate-500 mb-1">Transmission Pathway</div>
                 <div className="text-sm font-medium text-white">{risk_chain.spillover.pathway}</div>
                 <div className="mt-2 h-1 w-full bg-slate-800 rounded-full">
                   <div 
                     className="h-full bg-indigo-500 rounded-full" 
                     style={{ width: `${risk_chain.spillover.score * 100}%` }} 
                   />
                 </div>
                 <div className="text-right text-[10px] text-indigo-400 mt-1">
                   Connectivity Score: {risk_chain.spillover.score.toFixed(2)}
                 </div>
               </div>
             </div>
          </Card>
        </div>

        {/* Sidebar Column: Summary & Metadata */}
        <div className="space-y-6">
          {/* Drift Summary */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Trend Summary</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{driftSummary['↑'] || 0}</div>
                <div className="text-[10px] text-slate-500">Increasing</div>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <Minus className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{driftSummary['→'] || 0}</div>
                <div className="text-[10px] text-slate-500">Stable</div>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{driftSummary['↓'] || 0}</div>
                <div className="text-[10px] text-slate-500">Decreasing</div>
              </div>
            </div>
          </Card>

          {/* Baseline Context */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Baseline Context</h3>
            <div className="text-center py-4 border-b border-slate-800 mb-4">
              <div className="text-4xl font-bold text-white mb-1">
                +{baseline.warming_estimate}{baseline.unit}
              </div>
              <div className="text-xs text-slate-500">
                {baseline.period_comparison}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Confidence</span>
                <span className="text-green-400 font-medium">{baseline.confidence.level}</span>
              </div>
              <p className="text-xs text-slate-500 italic">
                {baseline.confidence.reason}
              </p>
            </div>
          </Card>

          {/* Metadata & Provenance */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Data Provenance</h3>
            
            <ScrollArea className="h-48 pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Models & Datasets</div>
                  {metadata.dataset_versions.map((ds) => (
                    <div key={ds.source_id} className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500">{ds.source_id}</span>
                      <span className="font-mono text-slate-400">{ds.version}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-1">Methodology Note</div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {metadata.provenance}
                  </p>
                </div>

                <div className="text-[10px] text-slate-600 pt-2">
                  Generated: {new Date(metadata.as_of_timestamp).toLocaleDateString()}
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReproduce}
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              <Copy className="w-4 h-4 mr-2" />
              Reproduce Assessment
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button
              onClick={onRestart}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              New Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}