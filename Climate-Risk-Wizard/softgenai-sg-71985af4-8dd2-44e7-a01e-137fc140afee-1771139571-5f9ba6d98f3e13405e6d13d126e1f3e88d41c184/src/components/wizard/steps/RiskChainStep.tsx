import type { WizardState } from "../WizardFlow";
import type { DashboardViewModel } from "@/contracts/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ArrowRight as ArrowFlat } from "lucide-react";

interface RiskChainStepProps {
  wizardState: WizardState;
  setWizardState: (state: WizardState) => void;
  dashboardData: DashboardViewModel | null;
  onNext: () => void;
  onBack: () => void;
  onRestart?: () => void;
}

export function RiskChainStep({ 
  dashboardData, 
  onNext, 
  onBack 
}: RiskChainStepProps) {
  // ✅ Pure preview slice - no API calls
  const chain = dashboardData?.risk_chain;

  if (!chain) {
    return (
      <div className="text-center py-12 text-slate-400">
        No risk chain data available
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Risk Cascade</h2>
        <p className="text-slate-400">Tracing impact from {chain.hazard} to {chain.system} Systems</p>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/50 hidden md:block"></div>

        <div className="space-y-4">
          {chain.nodes.map((node, index) => (
            <div key={node.id} className="relative md:pl-16 group">
              {/* Node Connector */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500/50 z-10 hidden md:block group-hover:border-blue-400 transition-colors"></div>
              
              <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900/80">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-semibold 
                        ${node.type === 'Risk' ? 'bg-red-900/30 text-red-400' : 
                          node.type === 'Impact' ? 'bg-orange-900/30 text-orange-400' : 
                          'bg-blue-900/30 text-blue-400'}`}>
                        {node.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-lg">{node.label}</h3>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">Severity</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${node.severity > 0.7 ? 'bg-red-500' : node.severity > 0.4 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${node.severity * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono text-slate-300">{(node.severity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-2" title={`Drift: ${node.drift.magnitude} ${node.drift.direction}`}>
                      {node.drift.direction === '↑' && <ArrowUpRight className="w-4 h-4 text-red-400" />}
                      {node.drift.direction === '↓' && <ArrowDownRight className="w-4 h-4 text-green-400" />}
                      {node.drift.direction === '→' && <ArrowFlat className="w-4 h-4 text-yellow-400" />}
                      <span className="text-xs font-medium uppercase text-slate-400">{node.drift.magnitude}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-500">
          View Full Dashboard
        </Button>
      </div>
    </div>
  );
}