import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingResearchDesk from "@/components/landing/LandingResearchDesk";
import LandingModFramework from "@/components/landing/LandingModFramework";
import LandingPoweredByAi from "@/components/landing/LandingPoweredByAi";
import LandingLiveExample from "@/components/landing/LandingLiveExample";
import LandingPortfolio from "@/components/landing/LandingPortfolio";
import LandingFinalCta from "@/components/landing/LandingFinalCta";
import LandingFooter from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="landing-root relative" style={{ background: "#F5F0E6", color: "#0E1A2B" }}>
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingResearchDesk />
        <LandingModFramework />
        <LandingPoweredByAi />
        <LandingLiveExample />
        <LandingPortfolio />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
