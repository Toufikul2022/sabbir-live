# Sabbir LIVE: creator website

The official website for **Sabbir Ahmed (Sabbir LIVE)**. It brings Facebook, TikTok and YouTube videos together in one place. Facebook comes first, and vertical Reel-style video is the main format.

| Page | Path | What it shows |
| --- | --- | --- |
| Home | `/` | Hero with featured Facebook video, then Facebook → TikTok → YouTube sections, About, Follow |
| Facebook | `/facebook` | Facebook Reels grid (portrait), other Facebook videos (16:9), optional live Page feed |
| TikTok | `/tiktok` | TikTok grid and the official TikTok creator feed (loads on click) |
| YouTube | `/youtube` | Shorts grid (portrait) and regular videos grid (16:9) |
| Contact | `/contact` | Contact form (Full Name, Email, Subject, Message) and social links |
| Privacy | `/privacy` | Privacy policy describing what the site actually does |
| Manage | `/manage` | Password-protected page to add, feature and remove TikTok videos from a phone |
| Admin | `/admin` | Full content manager (all platforms, site text) |

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Sveltia CMS (Git-based, free) · Resend or SMTP for email.
There is no database or login system on the website itself. All content is stored as two JSON files in the repository.

---

## 1. Run it locally

Requires **Node.js 20.9+** (22 LTS recommended).

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Open http://localhost:3000.

Other commands:

| Command | Purpose |
| --- | --- |
| `npm run build` then `npm start` | Production build and server |
| `npm run check:content` | Validates `content/videos.json` and `content/site.json` and explains any problem |
| `npm test` | Unit tests for URL parsing and form validation |
| `npm run typecheck` | TypeScript check |

## 2. Deploy (recommended: Vercel, free Hobby plan)

1. Push this folder to a GitHub repository.
2. On https://vercel.com, choose **Add New → Project**, import the repository and keep the default settings.
3. Under **Settings → Environment Variables**, add at least:
   - `NEXT_PUBLIC_SITE_URL`: your final address, for example `https://sabbirlive.com`
   - The contact-form variables (see §5)
4. Deploy, then add your own domain under **Settings → Domains**.

Any Node.js host that runs `npm run build && npm start` also works (Netlify, Render, Railway, a VPS). A static-only host will **not** work, because the contact form needs the `/api/contact` server route.

Pages are static and refresh automatically **once an hour**. This picks up new YouTube uploads, refreshed TikTok thumbnails and Facebook API results. Changing the content files triggers a redeploy, so those changes appear within a minute or two.

## 3. Managing videos

Every video is one entry in **`content/videos.json`**. Only the URL is required:

```json
{
  "videos": [
    { "url": "https://www.facebook.com/reel/1234567890123456", "title": "My new Reel", "thumbnail": "/uploads/my-reel.jpg", "featured": true },
    { "url": "https://www.tiktok.com/@sabbirlive.official/video/7301234567890123456" },
    { "url": "https://www.youtube.com/shorts/AbCdEfGhIjK" }
  ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `url` | ✅ | Facebook, TikTok or YouTube link. **The platform is detected automatically.** |
| `title` | – | Filled in automatically for YouTube and TikTok. **Add it for Facebook.** |
| `caption` | – | Short description shown in the player |
| `thumbnail` | – | Automatic for YouTube and TikTok. **Recommended for Facebook** (9:16 image for Reels). Upload to `public/uploads/` or use the admin. Without one, a branded poster is shown. |
| `publishedAt` | – | `YYYY-MM-DD`. Newest videos are shown first. |
| `featured` | – | Shown first. The first featured **Facebook** video becomes the homepage hero. |
| `priority` | – | Display order: higher numbers appear earlier (default 0) |
| `format` | – | `auto` (default), `vertical` or `landscape`. Reels, Shorts and TikToks are vertical automatically. |
| `hidden` | – | `true` removes the video from the site without deleting the entry |

**Accepted links**

- Facebook: `facebook.com/reel/…`, `facebook.com/watch/?v=…`, `facebook.com/<page>/videos/…`
- TikTok: `tiktok.com/@user/video/…`
- YouTube: `youtube.com/watch?v=…`, `youtube.com/shorts/…`, `youtu.be/…`

Share links (`fb.watch/…`, `facebook.com/share/r/…`, `vm.tiktok.com/…`) are resolved automatically where the platform allows it. If one can't be resolved, its card opens the video on the platform instead of playing it on the site. For reliable results, open the link in a browser and copy the full address. `npm run check:content` warns about this.

**Deleted, private or region-locked videos:** YouTube and TikTok videos that the platform reports as deleted or private are hidden automatically. Every player also has a "Watch on …" link as a fallback.

### Adding TikTok videos from a phone (`/manage`), the easiest way

Made for the owner: no coding and no GitHub account needed.

1. Open **`https://sabbir-live.vercel.app/manage`** and log in with the password.
2. In the TikTok app, open the video and tap **Share → Copy link**.
3. Back on the page, tap **Paste**, then **Add video**.

The video appears on the website in about a minute. The title and upload date are filled in automatically. The same page lists every TikTok on the site, with **Show first** and **Remove** buttons (removing only hides it from the website, not from TikTok).

**One-time setup (done by whoever manages Vercel):**

1. Create a GitHub **fine-grained personal access token**: GitHub → Settings → Developer settings → Fine-grained tokens → *Generate new token*. Under repository access, choose **Only select repositories → `sabbir-live`**; under permissions, set **Contents → Read and write**. Copy the token.
2. In Vercel → **Settings → Environment Variables**, add:
   - `MANAGE_PASSWORD`: a strong password to give the owner
   - `GITHUB_TOKEN`: the token from step 1
3. Redeploy (Deployments → ⋯ → Redeploy).

How it works: each change is saved as a commit to `content/videos.json`, which triggers Vercel to redeploy. Login is protected by the password, with a secure cookie that lasts 30 days and a limit on repeated wrong guesses. Changing `MANAGE_PASSWORD` logs everyone out.

### Using the admin panel (no code editing)

`/admin` runs [Sveltia CMS](https://sveltiacms.app). It edits the same JSON files and saves each change as a commit to GitHub, which triggers a redeploy.

One-time setup:

1. In `public/admin/config.yml`, set `backend.repo` to your repository (`username/repo-name`).
2. Create a GitHub **fine-grained personal access token** with *Contents: Read and write* on that repository only.
3. Open `https://your-site/admin`, choose **Sign in with token**, and paste the token.

Then go to **Videos → All videos → Add Video**, paste the link, optionally add a title or thumbnail, and press **Save**.
To edit locally without a token, run `npm run dev`, open http://localhost:3000/admin in Chrome or Edge, and choose **Work with Local Repository**.

### Updating social links, the bio and the hero text

Edit `content/site.json`, or use **Site settings** in the admin:

- `social.facebook.url`, `social.tiktok.url`, `social.youtube.url`: used by every Follow button.
- `social.facebook.pageUrl` (optional): the full Page address, such as `https://www.facebook.com/YourPageName`. When set, the Facebook page shows the official "latest posts" Page Plugin.
- `social.youtube.channelId` (optional, starts with `UC`): when set, the latest 15 uploads appear on the site automatically (see §4).
- `about.paragraphs`, `hero.*`, `contact.email`, `contact.intro`.

## 4. Automatic sync: what each platform allows

| Platform | Status | Requirements |
| --- | --- | --- |
| **YouTube** | ✅ Built in | Set the channel ID only. Uses YouTube's public RSS feed (latest 15 uploads, Shorts detected). No API key, quota or cost. To find the ID, open YouTube Studio → **Settings → Channel → Advanced settings** (or youtube.com/account_advanced). |
| **Facebook** | ✅ Built in (optional) | Requires a Meta developer app and a **long-lived Page access token** with `pages_read_engagement` and `pages_show_list` (the person generating it must be an admin of the Page). Set `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN`. The site then reads `/{page}/video_reels` and `/{page}/videos` from the Graph API every hour, including thumbnails and captions. Free. Page tokens made from a long-lived user token don't expire, but they stop working if the admin's password or permissions change, so recheck them occasionally. |
| **TikTok** | ⚠️ Manual URLs | TikTok's Display API needs an approved developer app, a privacy policy and terms URL, app review, and an OAuth login by the creator. Access tokens expire every 24 hours and refresh tokens yearly. That's a lot of upkeep for a personal site, so TikTok uses pasted URLs (titles and thumbnails still fill in automatically). The `/tiktok` page also includes TikTok's official **creator feed embed**, which always shows the latest posts. |

Manual entries always take priority: adding a synced video to `videos.json` lets you feature it, retitle it or hide it.

## 5. Contact form setup (required before launch)

The form validates input in the browser and on the server, uses a honeypot, a minimum fill time and a per-IP rate limit, and supports optional Cloudflare Turnstile. **Until email delivery is configured, it tells visitors that it isn't connected yet and points them to Facebook. It never pretends a message was sent.**

Choose one option:

**A. Resend** (free tier: 3,000 emails per month)
1. Create an account at https://resend.com and verify your domain.
2. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (your inbox) and `CONTACT_FROM_EMAIL` (for example `website@yourdomain.com`).

**B. SMTP** (Gmail app password, Zoho, Outlook, your web host)
Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL`, and optionally `CONTACT_FROM_EMAIL` and `SMTP_SECURE=true` for port 465.

**Optional spam protection:** create a free Cloudflare Turnstile widget and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

Replies go straight to the sender, because their address is set as *Reply-To*.

## 6. How it works (for developers)

```
content/            videos.json + site.json: all editable content
lib/video-url.ts    URL → platform, ID, orientation, official embed URL (pure, unit-tested)
lib/videos.ts       loads entries, resolves share links, oEmbed enrichment, merges syncs, sorting
lib/sync/           youtube.ts (RSS) · facebook.ts (Graph API)
components/         Header, Footer, VideoCard/VideoRow/LandscapeCard, PlayerProvider (shared <dialog>), ...
app/                pages, /api/contact, sitemap, robots, manifest, OG image
public/admin/       Sveltia CMS
scripts/            check-content.mjs
```

- **Embeds:** official players only (Facebook `plugins/video.php`, TikTok `player/v1`, YouTube `youtube-nocookie.com/embed`). Nothing is scraped.
- **Performance:** no third-party script or iframe loads until a visitor presses play. There is one shared player dialog, thumbnails are optimised with `next/image` (AVIF/WebP, responsive sizes, lazy-loaded), cards use fixed aspect ratios (no layout shift), and fonts are self-hosted.
- **SEO:** unique titles and descriptions, canonical URLs, Open Graph and Twitter cards with a generated share image, `sitemap.xml`, `robots.txt`, `Person` and `WebSite` JSON-LD, and `VideoObject` lists for videos that have a title, thumbnail and date.
- **Accessibility:** skip link, keyboard-operable menu and player (Esc closes, focus returns), visible focus rings, labelled form fields with linked error messages, WCAG AA colour contrast, and support for `prefers-reduced-motion`.

## 7. Remaining setup checklist

- [ ] **Add real videos**: no video URLs were supplied, so the site launches with friendly empty states and Follow buttons.
- [ ] **Configure the contact form**: Resend or SMTP (§5).
- [ ] **Set `NEXT_PUBLIC_SITE_URL`** to the final domain.
- [ ] **Set `MANAGE_PASSWORD` and `GITHUB_TOKEN`** in Vercel so the owner can add TikToks at `/manage`.
- [ ] *Optional:* YouTube channel ID for automatic YouTube updates.
- [ ] *Optional:* full Facebook Page address (`social.facebook.pageUrl`) for the live Page feed. The supplied link `facebook.com/share/19HjXcQMge/` is a share link: it works for Follow buttons, but Facebook's Page Plugin needs the Page's real address.
- [ ] *Optional:* Facebook Page token for automatic Facebook updates (§4).
- [ ] *Optional:* public contact email (`contact.email`).
- [ ] Review the About text and Privacy Policy wording.
