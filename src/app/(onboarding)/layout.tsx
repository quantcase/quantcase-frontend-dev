import { OnboardingGuard } from "@/components/providers/OnboardingGuard";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
