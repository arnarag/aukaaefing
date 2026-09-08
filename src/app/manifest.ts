import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aukaæfing", short_name: "Aukaæfing", description: "Fótboltaæfingar fyrir 10–12 ára krakka",
    start_url: "/", display: "standalone", background_color: "#eefbf3", theme_color: "#0b8847", lang: "is",
    icons: [{ src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
  };
}
