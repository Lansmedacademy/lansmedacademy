<<<<<<< HEAD
# LANS MED Academy

**Making Medicine Simple.** — the official website for LANS MED Academy, an African-founded global medical education platform by **Lansana Coomber**.

Live site: **https://lansmedacademy.com**

Learn Anatomy, Physiology, Pharmacology, Pathology, Internal Medicine, Surgery, Biochemistry and Clinical Medicine through simple, visual explanations — with a searchable notes library, medical illustration library, an interactive MCQ bank, a YouTube hub, blog, community and membership tiers.

---

## Tech stack (current)

This is a fast, fully self-contained **static website** — no build step, no dependencies, works anywhere.

- HTML5 (`index.html`)
- CSS3 with custom properties / dark + light theming (`style.css`)
- Vanilla JavaScript — theme toggle, mobile nav, animated counters, notes search/filter, illustration library, interactive MCQ engine, forms (`script.js`)
- Google Fonts: Fraunces (display) + Hanken Grotesk (body)
- Netlify Forms for the contact and newsletter forms

> Roadmap: this static site is the design + interaction blueprint for the planned **Next.js + React + TypeScript** production platform (user accounts, persistent MCQ analytics, blog CMS, payments). See *Roadmap* below.

---

## Project structure

```
lansmed-academy/
├── index.html            # Main page (all sections)
├── style.css             # All styles + theming
├── script.js             # All interactivity (theme, nav, MCQ engine, forms…)
├── README.md             # This file
├── netlify.toml          # Netlify deploy config (publish dir + headers)
├── robots.txt            # SEO: crawler rules
├── sitemap.xml           # SEO: sitemap
├── .gitignore            # Files Git should ignore
├── favicon/
│   ├── favicon.svg        # ECG-pulse brand icon
│   └── site.webmanifest   # PWA / install metadata
├── images/
│   ├── README.txt         # How to add your teaching photo
│   └── portrait-placeholder.svg
└── assets/
    └── README.txt         # For PDFs, illustration packs, brand files, fonts
```

---

## Run it locally (Visual Studio Code)

1. Open the `lansmed-academy` folder in **VS Code** (`File → Open Folder`).
2. Easiest: install the **Live Server** extension, then right-click `index.html` → **Open with Live Server**. It opens in your browser and auto-refreshes when you save.
3. No Live Server? Just double-click `index.html` to open it in any browser.

---

## Deploy

### Option A — GitHub + Netlify (recommended, auto-publishing)

1. Create a free account at **github.com**.
2. In your existing Netlify site: **Project configuration → Build & deploy → Continuous deployment → Repository → "Push to new repository."** Authorize GitHub and follow the prompts. Netlify creates the repo, pushes these files, and switches your site to continuous deployment.
3. If asked for build settings: **build command = empty**, **publish directory = `.`** (this is a plain static site).
4. From now on, every change you commit to GitHub auto-deploys to https://lansmedacademy.com.

### Option B — Manual drag-and-drop

In your Netlify site → **Deploys** tab → drag the project folder onto the deploy dropzone.

---

## How to edit common things

**Your teaching photo** — see `images/README.txt` (drop in `images/lansana-teaching.jpg` and swap the `.portrait` block in `index.html`).

**Social media + email links** — open `index.html`, search for `class="soc"`, and replace each `href="#"` with your real URL (Facebook, Instagram, YouTube, TikTok, LinkedIn, WhatsApp) and `hello@lansmed.com` with your real email.

**Text content** (headlines, bio, timeline) — edit directly in `index.html`.

**Notes, videos, blog posts, MCQ questions** — these are data lists near the top of `script.js`:
- `notes` — the Medical Notes cards
- `systems` — the Illustration Library tiles
- `vids` — the YouTube hub cards
- `posts` — the Blog cards
- `banks` — the MCQ questions, answers and explanations

Copy the pattern of an existing entry to add your own. Keep the commas and brackets intact.

**Brand colours** — edit the `:root` variables at the top of `style.css` (`--navy`, `--teal`, `--coral`, …).

---

## Forms

The contact and newsletter forms use **Netlify Forms** — submissions appear in your Netlify dashboard under the **Forms** tab once deployed (no setup needed). Turn on email alerts in *Forms → Form notifications*.

To use **Formspree** instead: add `action="https://formspree.io/f/YOUR_ID"` to each `<form>` in `index.html` and remove the `fetch('/', …)` lines in `script.js`.

> Note: forms only capture data on the live (deployed) site, not when opening the file locally.

---

## SEO

`index.html` includes meta description, keywords, Open Graph tags and JSON-LD structured data. `robots.txt` and `sitemap.xml` are included and reference `lansmedacademy.com`. Update the sitemap when you add real pages.

---

## Roadmap → Next.js platform

When ready to scale into the full ecosystem:
1. Scaffold these sections into Next.js + TypeScript components.
2. Add auth + database (e.g. Supabase) for user accounts, saved progress and leaderboards.
3. Wire the YouTube Data API for the live video hub.
4. Add a CMS (e.g. Sanity/Contentful) for the blog.
5. Add payments (e.g. Stripe / a Russia-supported processor) for membership tiers.

---

© 2026 LANS MED Academy · Founded by Lansana Coomber.
=======
## Hi there 👋

<!--
**Lansmedacademy/lansmedacademy** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
>>>>>>> 35d5e6fca5e5f9f4d179a3b1ab86ed96460749c3
