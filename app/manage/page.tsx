import type { Metadata } from "next";
import { ManageShell } from "@/components/manage/ManageShell";
import { TikTokManager } from "@/components/manage/TikTokManager";

export const metadata: Metadata = { title: "Manage videos", robots: { index: false, follow: false } };

export default function ManagePage() {
  return (
    <ManageShell active="/manage">
      <h1 className="display mt-8 text-title">
        Add <span className="text-tiktok">TikTok</span> videos
      </h1>
      <TikTokManager />
    </ManageShell>
  );
}
