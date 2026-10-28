import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "yearly" }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/facebook", priority: 0.9, changeFrequency: "daily" },
    { path: "/tiktok", priority: 0.8, changeFrequency: "daily" },
    { path: "/youtube", priority: 0.8, changeFrequency: "daily" },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  ];
  return pages.map((p) => ({ url: `${siteUrl}${p.path}`, changeFrequency: p.changeFrequency, priority: p.priority }));
}
