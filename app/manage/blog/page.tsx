import type { Metadata } from "next";
import { BlogManager } from "@/components/manage/BlogManager";
import { ManageShell } from "@/components/manage/ManageShell";

export const metadata: Metadata = { title: "Manage blog", robots: { index: false, follow: false } };

export default function ManageBlogPage() {
  return (
    <ManageShell active="/manage/blog">
      <BlogManager />
    </ManageShell>
  );
}
