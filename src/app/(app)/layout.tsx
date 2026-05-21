import { AppSidebar } from "@/components/molecules/app-sidebar";
import { TopBar } from "@/components/molecules/top-bar";
import { MainContentWrapper } from "@/components/molecules/main-content-wrapper";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { UserProvider } from "@/components/providers/UserContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthGuard>
        <AppSidebar />
        <TopBar />
        <MainContentWrapper>{children}</MainContentWrapper>
      </AuthGuard>
    </UserProvider>
  );
}
