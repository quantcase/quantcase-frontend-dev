import { Suspense } from "react";
import { SignInHeroPanel } from "@/components/signin/SignInHeroPanel";
import { RegisterForm } from "@/components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#F5F5F5" }}>
      <div className="lg:w-[52%] xl:w-[55%] flex-shrink-0 h-full">
        <SignInHeroPanel />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
