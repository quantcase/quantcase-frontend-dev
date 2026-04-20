import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/molecules/app-sidebar";
import { TopBar } from "@/components/molecules/top-bar";
import { MainContentWrapper } from "@/components/molecules/main-content-wrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Quantcase - AI-Powered Market Research",
  description: "Quantcase - the AI-powered market research used by industry professionals",
};

function ThemeScript() {
  const script = `(function(){
    var t=localStorage.getItem('qc-theme')||'light-modern';
    var m={'dark-modern':'theme-dark-modern','light-enterprise':'theme-light-enterprise','dark-enterprise':'theme-dark-enterprise'};
    var c=m[t];if(c)document.documentElement.classList.add(c);
    if(t==='dark-modern'||t==='dark-enterprise')document.documentElement.classList.add('dark');
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body className={ibmPlexSans.variable}>
        <ThemeProvider>
          <AppSidebar />
          <TopBar />
          <MainContentWrapper>{children}</MainContentWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
