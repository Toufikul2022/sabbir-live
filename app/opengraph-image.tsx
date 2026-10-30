import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.brandName} — ${siteConfig.hero.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-640.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          background: "radial-gradient(circle at 15% 10%, #0a3a99 0%, #000 45%), #000",
          color: "#fff",
        }}
      >
        <img src={src} width={760} height={160} alt="" />
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>{siteConfig.hero.headline}</div>
        <div style={{ fontSize: 30, color: "#c8c8cc" }}>Facebook · TikTok · YouTube</div>
      </div>
    ),
    size,
  );
}
