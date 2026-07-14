import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UserProvider } from "@/components/providers/UserContext";
import { IntercomProvider } from "@/components/providers/IntercomProvider";
import { CLARITY_PROJECT_ID, GTM_CONTAINER_ID, GSC_VERIFICATION } from "@/lib/constants";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Quantcase - AI-Powered Market Research",
  description: "Quantcase - the AI-powered market research used by industry professionals",
  verification: {
    google: GSC_VERIFICATION,
  },
};

function ThemeScript() {
  const script = `(function(){
    var t=localStorage.getItem('qc-theme')||'purple';
    var m={'dark-purple':'theme-dark-purple'};
    var c=m[t];if(c)document.documentElement.classList.add(c);
    if(t==='dark-purple')document.documentElement.classList.add('dark');
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
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <ThemeScript />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`,
          }}
        />
      </head>
      <body className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`} style={{ fontFamily: "var(--qc-font-sans)", WebkitFontSmoothing: "antialiased" }}>
        <GoogleTagManager gtmId={GTM_CONTAINER_ID} />
        <ThemeProvider>
          <UserProvider>
            {children}
            <IntercomProvider />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
