# ReflexRush — Reaction Speed Challenge

ReflexRush is a high-performance, responsive browser-based reaction time test designed with a dark gaming aesthetic. It measures human reaction speed with microsecond precision using the browser's `performance.now()` API, computes advanced statistics (average, median, fastest, slowest, false starts, and session improvement), visualizes progression trends, and features built-in viral sharing with URL-encoded friend challenges and downloadable social scorecard graphics.

---

## 1. Project Overview & Features

- **Microsecond Precision Engine**: Zero dependency vanilla JavaScript utilizing `performance.now()`.
- **Game Modes**:
  - **Classic**: 5 rounds with randomized delay (1.5s – 5.0s).
  - **Sprint**: 10 rapid rounds with compact summaries.
  - **Zen**: Clean, distraction-free reaction testing.
  - **Practice**: Continuous unlimited testing with rolling real-time feedback.
- **Accurate False-Start Guard**: Early clicks or keypresses during the waiting state trigger a "Too early!" alarm, do not contaminate valid averages, and allow retrying the round.
- **Zero-Dependency Web Audio API Synthesizer**: Clean real-time synthesized audio tones (start cue, green flash ding, false-start buzz, and victory arpeggios) with persistent mute control.
- **Personal Dashboard & Analytics**:
  - LocalStorage persistence (resilient against corruption or restricted storage).
  - All-time fastest reaction & best 5-round average.
  - Interactive SVG reaction speed progression trend chart.
  - Recent session history log.
  - Reset statistics with double-confirmation modal.
- **Viral Sharing & Friend Challenges**:
  - Native Web Share API integration with automatic clipboard fallback.
  - Dynamic URL parameter challenge system (`?challenge=235&by=Alex`) featuring side-by-side head-to-head score comparisons.
  - Built-in HTML5 Canvas generator rendering high-resolution (1200x630) social scorecards for Twitter/X, Instagram, WhatsApp, Reddit, and Discord.
- **Sustainable Monetization Architecture**:
  - Responsive reserved advertisement slots (728x90 / 300x250 / 320x100) placed strictly outside the active gaming panel.
  - Fully compliant with ad network policies.
- **Accessibility & Mobile UX**:
  - Mobile touch-optimized with `touch-action: manipulation` to eliminate the 300ms mobile tap delay.
  - Full keyboard accessibility (`Spacebar` and `Enter` to react, with scroll lock prevention).
  - ARIA live announcements for screen readers and `@media (prefers-reduced-motion)` support.

---

## 2. Project Folder Structure

```text
reflexrush/
├── favicon.svg          # Vector brand icon (lightning + precision target)
├── index.html           # Semantic HTML5 layout, meta tags, and accessibility markup
├── style.css            # Dark gaming theme (#080B16), glassmorphism, glowing micro-interactions
├── script.js            # Vanilla JS reaction engine, audio synth, canvas card generator & stats
├── robots.txt           # Search crawler directive file
├── sitemap.xml          # Search engine XML index file
└── README.md            # Comprehensive documentation, deployment, and testing checklist
```

---

## 3. How to Run Locally

Because ReflexRush is built with standard frontend technologies (HTML5, CSS3, vanilla ES6 JavaScript), you can run it locally with zero build step.

### Method A: Python (Built-in)
If you have Python installed:
```bash
# Navigate to the project directory
cd C:\Users\GYANDEEP\.gemini\antigravity\scratch\reflexrush

# For Python 3
python -m http.server 3000
```
Open your browser and navigate to `http://localhost:3000`.

### Method B: Node.js `npx serve`
If you have Node.js installed:
```bash
npx serve .
```
Navigate to the local port displayed in your terminal (typically `http://localhost:3000` or `http://localhost:5000`).

### Method C: Direct Browser Opening
Simply double-click `index.html` or open it directly in Chrome, Firefox, Safari, or Edge. All features (gameplay, local storage, Web Audio API, and canvas rendering) will function directly.

---

## 4. Deployment Instructions (Static Hosting)

ReflexRush is 100% static and can be deployed in seconds to any leading platform for free.

### A. Deploy to Vercel
1. Install the Vercel CLI (optional) or push this folder to a GitHub repository:
   ```bash
   npx vercel
   ```
2. Follow the on-screen prompts (accept default settings with root directory as `.`).
3. Your game is immediately live with an automatic SSL certificate.

### B. Deploy to Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Drag and drop the `reflexrush` folder into the Netlify "Sites" dashboard, OR connect via GitHub.
3. Build command: Leave blank.
4. Publish directory: `.`
5. Click **Deploy Site**.

### C. Deploy to GitHub Pages
1. Push the code to a GitHub repository (e.g. `yourname/reflexrush`).
2. Go to **Settings** > **Pages**.
3. Under "Branch", select `main` and root folder `/ (root)`.
4. Click **Save**. The game will be published at `https://<username>.github.io/<repo>/`.

### D. Deploy to Cloudflare Pages
1. Connect your GitHub repository to Cloudflare Pages.
2. Select Framework Preset: **None**.
3. Root Directory: `/`.
4. Click **Save and Deploy**.

---

## 5. Adding a Custom Domain

To point a custom domain (e.g., `reflexrush.app` or `yourdomain.com`):

1. **In your DNS Provider (Namecheap, Cloudflare, Google Domains/Squarespace, GoDaddy)**:
   - For an Apex domain (`yourdomain.com`):
     - Add an **A Record**: Host `@`, Value pointing to your host's IP (e.g., Vercel `76.76.21.21`).
   - For a Subdomain (`play.yourdomain.com` or `www.yourdomain.com`):
     - Add a **CNAME Record**: Host `www`, Value pointing to `cname.vercel-dns.com` or your provider's alias.
2. **In your Hosting Provider (Vercel/Netlify/Cloudflare)**:
   - Go to **Domain Management** / **Custom Domains**.
   - Enter your domain name and verify DNS propagation.
   - SSL certificates are automatically provisioned via Let's Encrypt within 5–15 minutes.

---

## 6. Integrating an Approved Ad Network (Google AdSense)

The application has 3 reserved ad containers with proper disclosure tags:
- `ad-container-hero` (Below the hero section)
- `ad-container-results` (Below the game card/results screen)
- `ad-container-footer` (Between the informational section and the footer)

### Integration Steps:

1. **Apply for Google AdSense**:
   - Ensure your site is deployed to your custom domain with real traffic, privacy policy, and terms of use.
   - Sign up at [google.com/adsense](https://www.google.com/adsense/).
2. **Add the AdSense Script**:
   - Open `index.html` and place your AdSense publisher script tag inside the `<head>`:
     ```html
     <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
     ```
3. **Replace Ad Placeholders with Live Ad Units**:
   - Replace the `.ad-content-placeholder` elements with your standard responsive ad units:
     ```html
     <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
     <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
     </script>
     ```
4. **Ad Placement Safety Rules**:
   - Never place an advertisement inside the active `#reaction-panel`.
   - Never display ads during active countdowns.
   - Keep the ad container dimensions constrained to avoid Cumulative Layout Shift (CLS).

---

## 7. Quality Assurance & Test Checklist

| Category | Test Case | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| **Reaction Engine** | Click "Start Test" | Panel transitions to tension waiting state with randomized timer (1.5s–5.0s). | Pass |
| **False-Start Guard** | Click during waiting state | Displays "Too early!" alarm, cancels round, increments false-start counter, allows round retry without penalizing average. | Pass |
| **Green Signal** | Wait for signal | Screen transitions to bright green (`#22C55E`), plays audio chime, records start time with `performance.now()`. | Pass |
| **Input Channels** | Mouse, Touch, Space, Enter | All input channels trigger reaction cleanly without ghost clicks or scrolling. | Pass |
| **Anti-Double Tap** | Rapid double clicks | Debounce lock ensures only one reaction timestamp is recorded per round. | Pass |
| **Session Completion** | Complete 5 rounds | Results screen opens with Average, Fastest, Slowest, Median, False Starts, and Rating. | Pass |
| **Friend Challenge** | Load `?challenge=240&by=Sam` | Banner displays "Sam scored 240 ms". Upon finishing, shows Head-to-Head win/loss comparison. | Pass |
| **Canvas Scorecard** | Click "Save Image Card" | Downloads a 1200x630 PNG card with player's stats, badge, and challenge branding. | Pass |
| **Sharing** | Click "Share Score" / "Copy Link" | Web Share API opens on mobile; clipboard fallback copies challenge message with toast notification. | Pass |
| **Storage Persistence** | Refresh the page | Personal Best and session history persist in LocalStorage. | Pass |
| **Audio Synthesizer** | Toggle Sound button | Mutes/unmutes Web Audio oscillator cues; preference persists across sessions. | Pass |
| **Tab Switching** | Switch tabs while waiting | Clears pending timer to prevent unfair false starts upon returning. | Pass |
| **Reset Statistics** | Confirm Reset modal | Clears local records and resets dashboard to clean state. | Pass |
