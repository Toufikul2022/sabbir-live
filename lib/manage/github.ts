import "server-only";
import type { VideoEntry } from "../videos";

// Videos are stored in content/videos.json in the GitHub repository. Saving a
// change commits the file, and the host (Vercel) redeploys the site automatically.
const FILE = "content/videos.json";

function repoUrl() {
  const repo = process.env.GITHUB_REPO || "Toufikul2022/sabbir-live";
  const branch = process.env.GITHUB_BRANCH || "main";
  return { url: `https://api.github.com/repos/${repo}/contents/${FILE}`, branch };
}

function headers() {
  return {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };
}

export async function readVideos(): Promise<{ videos: VideoEntry[]; sha: string }> {
  const { url, branch } = repoUrl();
  const res = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub read failed (HTTP ${res.status}). Check GITHUB_TOKEN and GITHUB_REPO.`);
  const body = (await res.json()) as { content: string; sha: string };
  const json = JSON.parse(Buffer.from(body.content, "base64").toString("utf8")) as { videos?: VideoEntry[] };
  return { videos: json.videos ?? [], sha: body.sha };
}

export async function writeVideos(videos: VideoEntry[], sha: string, message: string) {
  const { url, branch } = repoUrl();
  const content = Buffer.from(`${JSON.stringify({ videos }, null, 2)}\n`).toString("base64");
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers(), "content-type": "application/json" },
    body: JSON.stringify({ message, content, sha, branch }),
  });
  if (res.status === 409) throw new Error("Someone else saved at the same time. Please try again.");
  if (!res.ok) throw new Error(`GitHub save failed (HTTP ${res.status}). Check that GITHUB_TOKEN can write to the repository.`);
}
