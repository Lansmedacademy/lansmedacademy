# LANS MED Academy

**Making Medicine Simple.** — the official website for LANS MED Academy, an African-founded global medical education platform by **Lansana Coomber**.

Live site: **https://lansmedacademy.com**

Learn Anatomy, Physiology, Pharmacology, Pathology, Internal Medicine, Surgery, Biochemistry and Clinical Medicine through simple, visual explanations — with a searchable notes library, medical illustration library, an interactive MCQ bank, a YouTube hub, blog, community and membership tiers.

> ℹ️ The previous version of this README contained a Git merge conflict (leftover `<<<<<<<`, `=======`, `>>>>>>>` markers). It has been cleaned up and resolved here.

---

## Content management (no code needed) 🆕

This project now includes a built-in admin dashboard powered by **Decap CMS** + **Netlify Identity**. You can add blog posts, notes, PDFs, images, MCQs, illustrations and courses from a friendly web form — no coding, no database. Saving publishes straight to GitHub, which auto-deploys to the live site.

- Dashboard: **https://lansmedacademy.com/admin/**
- See **ADMIN SETUP** below for the one-time setup and first-use steps.

---

## Tech stack

A fast, fully static website — no build step, no database.

- HTML5 (`index.html`)
- CSS3 with dark/light theming (`style.css`)
- Vanilla JavaScript: theme toggle, nav, animated counters, notes search, MCQ engine, forms (`script.js`)
- `cms-content.js` — displays content created in the admin dashboard
- Decap CMS dashboard (`admin/`) + Netlify Identity & Git Gateway
- Google Fonts: Fraunces + Hanken Grotesk
- Netlify Forms (contact + newsletter), Google Analytics, sitemap & robots — all preserved

---

## Project structure

```
lansmed-academy/
├── index.html              # Main page (Google Analytics + SEO + forms preserved)
├── style.css               # All styles + theming (+ CMS modal styles appended)
├── script.js               # Site interactivity (+ CMS MCQ hook appended)
├── cms-content.js          # Renders /admin content; falls back to demo if empty
├── README.md
├── netlify.toml            # Netlify config (unchanged)
├── robots.txt              # SEO (unchanged)
├── sitemap.xml             # SEO (unchanged)
├── LICENSE
├── admin/                  # The content dashboard
│   ├── index.html          #   loads Decap CMS + Netlify Identity
│   └── config.yml          #   defines every collection & field
├── content/                # Your content, saved as simple JSON files
│   ├── blog.json
│   ├── notes.json
│   ├── mcqs.json
│   ├── illustrations.json
│   └── courses.json
├── uploads/
│   ├── pdfs/               # PDFs uploaded from the admin land here
│   └── images/             # Images uploaded from the admin land here
├── favicon/
│   ├── favicon.svg
│   └── site.webmanifest
├── images/                 # Your own image files (e.g. teaching photo)
└── assets/                 # Future PDFs, illustration packs, brand files
```

How display works: the admin saves your content into `content/*.json`. The website reads those files and shows them using the existing card designs. **Until you add your own content, the built-in demo content stays visible** — nothing breaks.

---

## ADMIN SETUP (one-time)

You only do this once. After that, you just log in and edit.

### 1. Commit & push these files
Add all the new files/folders (`admin/`, `content/`, `uploads/`, `cms-content.js`, and the updated `index.html`, `style.css`, `script.js`, `README.md`) to your repo, commit, and push to GitHub. Netlify will auto-deploy.

### 2. Enable Netlify Identity
In your Netlify site dashboard:
- Go to **Integrations** (or **Site configuration → Identity**) and click **Enable Identity**.
- Under **Identity → Registration**, set it to **Invite only** (so only you can log in).
- (Optional) Under **Identity → Services → Git Gateway**, click **Enable Git Gateway**. This lets the dashboard save to GitHub.

### 3. Invite yourself
- In **Identity**, click **Invite users** and enter your email.
- Check your inbox and click the invite link. It opens your site; set a password.
- You'll be redirected to the dashboard automatically.

### 4. Log in
- Go to **https://lansmedacademy.com/admin/** and log in with that email/password.

> If the dashboard says it can't find the repo/branch: open `admin/config.yml` and make sure `branch:` matches your repo's default branch (`main` or `master`).

---

## How to use it

**Upload your first PDF note**
1. Open `/admin/` → **📚 Medical Notes** → **Add Note**.
2. Fill in Title, Subject, Year/Level, Description.
3. Under **PDF File**, click to upload your PDF (it saves to `uploads/pdfs/`).
4. Click **Save**, then **Publish**. Within ~1 minute it appears in the Medical Notes section with a working Download PDF button.

**Write your first blog post**
1. `/admin/` → **📝 Blog Posts** → **Add Post**.
2. Add Title, Category, Summary, and write the Body (rich text / Markdown). Add a Featured Image if you like.
3. **Save → Publish.** It appears in the Blog section; clicking "Read article" opens the full post.

**Add MCQs** — **❓ MCQ Bank** → add Question, Options, the correct option number (1 = first), and an Explanation. They flow straight into the quiz on the homepage.

**Add illustrations** — **🖼️ Illustration Library** → upload an image + title + system.

**Add a course** — **🎓 Courses & Lessons** → create a course, then add lessons (each with optional video URL + content).

---

## Deploy / edit workflow

Every change you Publish in `/admin/` commits to GitHub and Netlify auto-deploys to https://lansmedacademy.com. You can still edit files directly in GitHub or locally in VS Code for anything structural.

---

## Preserved / not touched

Google Analytics tag, SEO metadata, Open Graph tags, canonical link, structured data, Netlify Forms (contact + newsletter), `sitemap.xml`, `robots.txt`, `netlify.toml`, branding, colours, layout and all working sections — left intact. New functionality was added on top.

---

## Roadmap → Next.js platform

When ready to scale: scaffold into Next.js + TypeScript, add auth + database (e.g. Supabase) for accounts/leaderboards, the YouTube Data API for the video hub, and payments for memberships. The CMS content model here maps cleanly onto that build.

---

© 2026 LANS MED Academy · Founded by Lansana Coomber.
