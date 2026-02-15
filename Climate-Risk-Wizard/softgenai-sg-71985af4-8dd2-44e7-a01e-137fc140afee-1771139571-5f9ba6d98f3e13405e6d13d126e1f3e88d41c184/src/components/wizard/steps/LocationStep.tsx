import { useState, useEffect } from "react";
import { WizardState } from "../WizardFlow";
import { DashboardViewModel } from "@/contracts/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Search, Loader2, CheckCircle2 } from "lucide-react";
import { wizardAPI, LocationResponse } from "@/lib/api/wizard";

interface LocationStepProps {
  wizardState: WizardState;
  setWizardState: (state: WizardState) => void;
  onNext: () => void;
  onBack?: () => void;
  onRestart?: () => void;
}

export function LocationStep({ wizardState, setWizardState, onNext }: LocationStepProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPreview, setLocationPreview] = useState<LocationResponse | null>(null);

  const handleResolve = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await wizardAPI.resolveLocation({ address: input });
      setLocationPreview(response);
      
      setWizardState({
        ...wizardState,
        location_key: response.location_key,
        normalized_location: response
      });
    } catch (err) {
      console.error(err);
      setError("Could not resolve location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    // Simulation of geolocation
    setInput("Current Location (Lat: 40.7128, Lng: -74.0060)");
    handleResolve();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Where should we focus?</h2>
        <p className="text-slate-400">Enter a location to analyze local climate risks</p>
      </div>

      <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-input">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location-input"
                placeholder="Enter address, city, or zip code"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                className="bg-slate-950 border-slate-800 text-white"
              />
              <Button 
                onClick={handleResolve} 
                disabled={isLoading || !input}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors" onClick={handleUseCurrentLocation}>
              <Navigation className="w-3 h-3" /> Use current location
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded border border-red-900/50">
              {error}
            </div>
          )}

          {locationPreview && (
            <div className="mt-6 p-4 rounded-lg bg-slate-950 border border-slate-800 animate-in zoom-in-95 duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-900/20 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{locationPreview.normalized_address}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {locationPreview.region_profile.climate_regime}
                    </span>
                    {locationPreview.region_profile.exposure_flags.map((flag) => (
                      <span key={flag} className="text-xs px-2 py-1 rounded bg-orange-900/30 text-orange-300 border border-orange-900/50">
                        {flag}
                      </span>
                    ))}
                  </div>
                  
                  {locationPreview.coordinates && (
                     <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                       <MapPin className="w-3 h-3" />
                       <span>{locationPreview.coordinates.lat.toFixed(4)}, {locationPreview.coordinates.lng.toFixed(4)}</span>
                     </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                     <span className="text-xs text-slate-500">Confidence: {locationPreview.confidence.confidence_level}</span>
                     <Button size="sm" onClick={onNext} className="bg-green-600 hover:bg-green-500">
                       Confirm Location
                     </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}