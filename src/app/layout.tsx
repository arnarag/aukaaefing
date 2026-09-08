import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlayerProvider } from "@/components/player-provider";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: { default: "Aukaæfing", template: "%s · Aukaæfing" },
  description: "Fótboltaæfingar fyrir 10–12 ára krakka",
  applicationName: "Aukaæfing",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Aukaæfing" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b8847" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="is"><body><PlayerProvider>{children}</PlayerProvider><ServiceWorkerRegistration /></body></html>;
}
