import Script from "next/script";
import { AppSidebar } from "@/components/molecules/app-sidebar";
import { TopBar } from "@/components/molecules/top-bar";
import { MainContentWrapper } from "@/components/molecules/main-content-wrapper";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { UserProvider } from "@/components/providers/UserContext";
import { PaywallProvider } from "@/components/providers/PaywallProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthGuard>
        <AppSidebar />
        <TopBar />
        <PaywallProvider>
          <MainContentWrapper>{children}</MainContentWrapper>
        </PaywallProvider>
      </AuthGuard>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script src="https://gateway.smallcase.com/scdk/2.0.0/scdk.js" strategy="lazyOnload" />
    </UserProvider>
  );
}
