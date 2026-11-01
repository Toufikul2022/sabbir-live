import "server-only";
import type { VideoEntry } from "../videos";

// Content edited from /manage lives in the GitHub repository. Saving a change
// commits the file, and the host (Vercel) redeploys the site automatically.

function api(path: string) {
  const repo = process.env.GITHUB_REPO || "Toufikul2022/sabbir-live";
  return `https://api.github.com/repos/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
}

const branch = () => process.env.GITHUB_BRANCH || "main";

function headers() {
  return {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };
}

/** Reads a text file; null if it doesn't exist. */
export async function readFile(path: string): Promise<{ text: string; sha: string } | null> {
  const res = await fetch(`${api(path)}?ref=${encodeURIComponent(branch())}`, { headers: headers(), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (HTTP ${res.status}). Check GITHUB_TOKEN and GITHUB_REPO.`);
  const body = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(body.content, "base64").toString("utf8"), sha: body.sha };
}

/** Lists the files in a folder; empty if the folder doesn't exist yet. */
export async function listFolder(path: string): Promise<{ name: string; path: string; sha: string }[]> {
  const res = await fetch(`${api(path)}?ref=${encodeURIComponent(branch())}`, { headers: headers(), cache: "no-store" });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub read failed (HTTP ${res.status}).`);
  return ((await res.json()) as { name: string; path: string; sha: string; type: string }[]).filter((f) => f.type === "file");
}

/** Creates or replaces a file. Pass the sha you read to replace; omit it to create. */
export async function writeFile(path: string, content: string | Buffer, message: string, sha?: string) {
  const res = await fetch(api(path), {
    method: "PUT",
    headers: { ...headers(), "content-type": "application/json" },
    body: JSON.stringify({ message, content: Buffer.from(content).toString("base64"), sha, branch: branch() }),
  });
  if (res.status === 409 || res.status === 422) throw new Error("This was changed somewhere else at the same time. Please reload and try again.");
  if (!res.ok) throw new Error(`GitHub save failed (HTTP ${res.status}). Check that GITHUB_TOKEN can write to the repository.`);
}

export async function deleteFile(path: string, sha: string, message: string) {
  const res = await fetch(api(path), {
    method: "DELETE",
    headers: { ...headers(), "content-type": "application/json" },
    body: JSON.stringify({ message, sha, branch: branch() }),
  });
  if (!res.ok) throw new Error(`GitHub delete failed (HTTP ${res.status}).`);
}

const VIDEOS = "content/videos.json";

export async function readVideos(): Promise<{ videos: VideoEntry[]; sha: string }> {
  const file = await readFile(VIDEOS);
  if (!file) throw new Error(`${VIDEOS} not found in the repository.`);
  return { videos: (JSON.parse(file.text) as { videos?: VideoEntry[] }).videos ?? [], sha: file.sha };
}

export async function writeVideos(videos: VideoEntry[], sha: string, message: string) {
  await writeFile(VIDEOS, `${JSON.stringify({ videos }, null, 2)}\n`, message, sha);
}
