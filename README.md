# THE JITESH CHRONICLE — Bespoke Editorial Portfolio
### In the Signature Aesthetic of Niccolò Miranda (`niccolomiranda.com`)

An award-winning editorial newspaper and tactile print portfolio engineered for **Jitesh Kumar Reddy**, First-Year Computer Science and Engineering undergraduate at **Jain (Deemed-to-be) University, Bengaluru**, and Outreach Leader at **FORGE (Jain Launchpad)**.

---

## ✦ Key Design Features (Niccolò Miranda Homage)

1. **Tactile Vintage Newsprint & Editorial Broadsheet Design**:
   - Master newspaper masthead with vintage woodcut ornaments, volume and edition stamps (`VOL. MMXXVI`, `FOLIO N° 01`).
   - Authentic paper grain overlay using procedural SVG noise filters.
   - Distressed rubber stamps, wax seals, punched tickets, and CMYK print calibration markers.
   - Dropped initial capital letters, multi-column editorial rules, and archival ledger boxes.

2. **Dual Editorial Themes (Day & Night Editions)**:
   - **Classic Newsprint Edition** (Default): Aged parchment paper (`#F8F5EE`), deep newsprint ink (`#151413`), and stamp vermilion (`#D12F24`).
   - **Charcoal Gazette Edition**: Deep graphite background (`#121213`), warm cream typography (`#EFECE4`), and gilded gold accents (`#E2B258`).
   - Seamlessly toggleable with persistent `localStorage` memory.

3. **Procedural Web Audio API Sound Synthesizer**:
   - Zero external MP3 or audio file dependencies (no broken audio links, zero network lag).
   - Generates authentic physical sound effects dynamically in code:
     - Mechanical typewriter keystroke clicks.
     - Physical paper rustle on scrolling.
     - Heavy rubber stamp / wax seal "thump" on interaction.
   - User toggle with animated audio frequency equalizer bars in the masthead.

4. **Interactive Kinetic Elements**:
   - **Custom Magnetic Cursor**: Follows mouse with smooth lag, expands to contextual lens ("READ", "INSPECT", "OPEN", "DRAG") with automatic touch-screen suppression.
   - **Draggable Vintage Badges / Stickers**: Interactive badges (*Aarohan '26*, *FORGE Leader*, *SIH Agri-Tech*, *Verified Builder*) that users can click, drag, and toss around the hero portrait area with boundary protection.
   - **Infinite Marquee Ticker**: Breaking news ticker strip across the front page.
   - **Interactive Case Study Modal Drawer**: Clicking *INSPECT DISPATCH* on any project opens a comprehensive architectural dossier with problem statements, specs, technical stack, and verified outcomes.
   - **Live Telemetry Bar**: Real-time ticking Bengaluru IST clock (UTC+5:30), weather status, and live broadcasting pulse indicator.

5. **Printable Archival Dossier [CV / Resume]**:
   - Dedicated *DOSSIER [CV]* modal and full `@media print` stylesheet.
   - Clicking *Print Official Dossier* opens a clean, museum-grade 2-page print dossier formatted for PDF export.

---

## ✦ Complete Profile Information Included

All content from your `Jitesh_Kumar_Reddy_Portfolio_Profile.docx` has been faithfully integrated with 100% evidence-based accuracy:

- **01. Profile & Editorial Manifesto**: First-year B.Tech CSE at Jain University; builder focused on the intersection of software, AI, privacy, and tangible real-world systems.
- **02. Selected Dispatches & Case Studies**:
  - **FestOS** (Festival Operations Control Portal — Aarohan 2026, IIM Indore): Coordinating 2,836 delegates, 38 university contingents, 31 competitions, 9 venues, 1,450 beds, and 15 vendors managed by 48 organizers over 3 shifts.
  - **Smart Farming Assistant** (AI + IoT Agritech — Smart India Hackathon Track): ESP8266 microcontroller, soil-moisture probes, DHT22 sensors, automated 5V relay irrigation, and offline-first USSD/kiosk advisory.
  - **TRUSTMESH** (Proof-of-Reality Protocol): Zero-knowledge event attestation for flood/disaster scenarios without exposing citizen biometric identity or PII.
  - **Exchequer / ApexTreasury** (Fintech SaaS Infrastructure): Foreign currency tracking, EEFC account automated ring-fencing, RBI compliance, Supabase Edge Functions, and HMAC-SHA256 authenticated webhooks.
  - **OfflinePay** (Payment Continuity Architecture): Resilient offline transaction fallback via BLE and signed dynamic QR tokens with replay protection and bounded double-spend risk.
- **03. The Classifieds & Patent Registry**: Truthful technical skills inventory across 6 categorized newspaper columns (Programming, Web, AI/Data, IoT/Embedded, Security/Privacy, Backend/Cloud).
- **04. FORGE Dispatch & Campus Leadership**: Roster highlighting President (Hriday), VP (Vard), and Outreach Leader (Jitesh Kumar Reddy), detailing ties with the **Jain Launchpad** startup incubator.
- **05. Professional Strengths**: 6 engraved medal attributes (Problem Framing, Real-World Utility, Hackathon Execution, Technical Pitching, Ecosystem Outreach, Rapid Cross-Domain Synthesis).
- **06. The Telegraph Desk**: Interactive Indian Post & Telegraph form, one-click copy for email (`jiteshkumarreddy.work@gmail.com`), social coordinates, and Bengaluru latitude/longitude.

---

## ✦ How to Run & Preview

### Method 1: Instant Browser View (Zero Installation)
Simply double-click `index.html` in your file explorer, or right-click `index.html` and select **Open with Google Chrome** (or Edge/Brave/Firefox).

### Method 2: Local HTTP Server (Recommended)
Using Node.js:
```bash
npx serve .
```
Or using Python:
```bash
python -m SimpleHTTPServer 8000
```
Then navigate to `http://localhost:8000` (or the port indicated in terminal).

---

## ✦ Project Structure

```
python portfolio/
├── index.html       # Semantic HTML5 editorial broadsheet layout
├── styles.css       # Tactile typography, paper grain, dual theme & print styles
├── app.js           # Procedural Web Audio synth, physics stickers & modals
├── README.md        # Documentation and deployment guide
└── Jitesh_Kumar_Reddy_Portfolio_Profile.docx # Original profile source file
```

---

## ✦ Deploying to the Web

1. **GitHub Pages (Free)**:
   - Create a new GitHub repository (e.g. `jitesh-portfolio`).
   - Push `index.html`, `styles.css`, and `app.js`.
   - Go to **Settings > Pages > Branch: main > Save**.
   - Your portfolio will be live at `https://<your-username>.github.io/<repo-name>/`.

2. **Vercel or Netlify (Free)**:
   - Drag and drop the `python portfolio` folder into the Netlify dashboard or link the repository on Vercel.
   - Deploys instantly in under 30 seconds with custom domain support.
