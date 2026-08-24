import Script from "next/script";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingGuard>{children}</OnboardingGuard>
      <Script src="https://gateway.smallcase.com/scdk/2.0.0/scdk.js" strategy="lazyOnload" />
    </>
  );
}
