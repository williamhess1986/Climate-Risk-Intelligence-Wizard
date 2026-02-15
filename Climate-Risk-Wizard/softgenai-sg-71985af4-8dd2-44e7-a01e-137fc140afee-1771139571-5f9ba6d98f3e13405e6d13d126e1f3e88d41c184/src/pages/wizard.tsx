import { SEO } from "@/components/SEO";
import { WizardFlow } from "@/components/wizard/WizardFlow";

export default function WizardPage() {
  return (
    <>
      <SEO 
        title="Climate Risk Assessment Wizard"
        description="Step-by-step climate risk assessment for your location"
      />
      <WizardFlow />
    </>
  );
}