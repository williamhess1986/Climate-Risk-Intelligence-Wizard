import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, TrendingUp, AlertTriangle, Network } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SEO 
        title="Climate Risk Wizard - Transform Location into Climate Intelligence"
        description="Guided wizard that transforms your location and concerns into structured climate risk intelligence with local warming baselines, risk chains, and spillover effects."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-medium backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4" />
                Climate Intelligence Platform
              </div>

              <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight">
                Climate Risk
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mt-2">
                  Intelligence Wizard
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
                Transform your location and concerns into structured climate risk intelligence. 
                Get local warming baselines, risk chains, stability indicators, and spillover effects.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/wizard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 h-14 text-lg shadow-lg shadow-blue-500/20">
                    Start Risk Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800 h-14 px-8 text-lg">
                  View Example
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<MapPin className="w-6 h-6" />}
              title="Location Intelligence"
              description="Precise location resolution with normalized coordinates and regional context"
              gradient="from-blue-500/10 to-cyan-500/10"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Warming Baseline"
              description="Local temperature anomaly relative to 1850-1900 global baseline"
              gradient="from-orange-500/10 to-red-500/10"
            />
            <FeatureCard
              icon={<Network className="w-6 h-6" />}
              title="Risk Chains"
              description="Dynamic hazard cascades showing local impact to market effects"
              gradient="from-purple-500/10 to-pink-500/10"
            />
            <FeatureCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Spillover Analysis"
              description="Linked-community effects through connectivity graphs"
              gradient="from-teal-500/10 to-green-500/10"
            />
          </div>
        </div>

        {/* Process Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              6-Step Intelligence Flow
            </h2>
            <p className="text-slate-400 text-lg">
              Guided process from location to comprehensive risk dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProcessStep
              number="01"
              title="Location"
              description="Enter address, city, or coordinates"
            />
            <ProcessStep
              number="02"
              title="Climate Pressure"
              description="Select relevant hazards"
            />
            <ProcessStep
              number="03"
              title="System Concern"
              description="Choose affected systems"
            />
            <ProcessStep
              number="04"
              title="Warming Baseline"
              description="View local temperature anomaly"
            />
            <ProcessStep
              number="05"
              title="Risk Chain"
              description="Explore cascading impacts"
            />
            <ProcessStep
              number="06"
              title="Dashboard"
              description="Interactive intelligence view"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/20 backdrop-blur-sm p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Assess Climate Risk?
            </h3>
            <p className="text-slate-300 text-lg mb-8">
              Get structured intelligence with confidence levels and provenance tracking
            </p>
            <Link href="/wizard">
              <Button size="lg" className="bg-white text-blue-950 hover:bg-slate-100 font-semibold px-10 h-14 text-lg">
                Begin Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-slate-700/50 backdrop-blur-sm p-6 hover:scale-105 transition-transform duration-300`}>
      <div className="w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center text-blue-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </Card>
  );
}

function ProcessStep({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="text-6xl font-black text-blue-500/20 mb-4">{number}</div>
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}