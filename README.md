# SkillOra - Unified Career & Education Platform

A pixel-perfect, production-grade recreation of the **SkillOra** landing page matching the Figma design specifications.

---

## 🌟 Key Features & Fidelity Highlights

### 1. Header & Navigation (`<header>`)
- **Brand Identity**: Stylized tri-color vector logo with gradient swoosh and tagline: *"Learn · Skill · Build Your Future"*.
- **Interactive Mega-Menus**:
  - `Explore Courses ⌵`: Direct category shortcuts to Healthcare, Hospitality, IT, Design, etc.
  - `Find Jobs ⌵`: Direct filter links to Staff Nurse, ICU, Hotel Front Desk, IT roles.
  - `Colleges & Institutes ⌵`: Links to verified college profiles and state directories.
  - `Online Learning ⌵`: Live batches, self-paced certifications, and free masterclasses.
  - `Career Updates ⌵`: Admission dates, exam alerts, and government job notifications.
- **Header Actions**:
  - Search icon with auto-focus trigger.
  - `Login` button opening the Student / Partner authentication modal.
  - `Join as Partner` button opening institutional onboarding.

### 2. Hero Section
- **Typography & Copy**:
  - Eyebrow: *"Your Skills, Your Career, Our Mission."*
  - H1 Headline: *"One Platform. Every Career Possibility."* with accent color styling.
  - Subtitle: *"Discover courses, verified institutes and jobs across healthcare, hospitality, technology and professional skills."*
- **Live Search Autocomplete**:
  - Instant typeahead searching across courses, institutes, and job postings.
  - Keyboard enter / submit button support with clear button (`✕`).
- **Platform Metrics**:
  - 🎓 `500+` Courses
  - 🏛️ `200+` Verified Institutes
  - 💼 `1000+` Job Opportunities
  - 🗂️ `50+` Career Categories
- **Hero Artwork**:
  - 4 Diverse Indian professionals/students (Nurse, Hotel Manager, Coder, Designer).
  - Handwritten *"Learn Build Grow"* brush calligraphy script.
  - 3 Interactive Floating Badges: `Verified Institutes`, `Expert Support`, `Flexible Learning`.

### 3. Category Carousel (7 Horizontal Cards)
1. **Nursing & Healthcare** (Teal `#00A389` • Heart-pulse icon)
2. **Hospitality** (Orange `#FF922A` • Cloche/concierge icon)
3. **Coding & IT** (Purple `#7756C4` • Code `</>` icon)
4. **Designing** (Magenta `#C354CF` • Pen-tool icon)
5. **Sales & Marketing** (Green `#009E83` • Analytics chart icon)
6. **Language & Grooming** (Blue `#0497DD` • Chat bubbles icon)
7. **Material Science** (Dark Green `#069B75` • Atom/molecule icon)
- *All cards are clickable and dynamically filter the courses below!*

### 4. 3-Column Layout

#### Column 1: Left Filter Sidebar ("Find Your Perfect Match")
- **Dynamic State & City Selectors**: Selecting Maharashtra filters cities to Mumbai, Pune; Delhi filters to Delhi NCR; Karnataka to Bengaluru.
- **Course Category & Qualification Selectors**.
- **Interactive Fee Range Slider**: Smooth slider with live currency readout from `₹0` to `₹2,00,000+`.
- **Delivery Mode Checkboxes**: Online, Offline, Both.
- **Action Buttons**: `Apply Filters` (filters the catalog in real-time) and `Clear All` (resets all controls).

#### Column 2: Center Content ("Explore Courses" & "Grow with SkillOra")
- **Category Filter Tabs (Pills)**: `All`, `Nursing`, `Hospitality`, `IT & Coding`, `Designing`, `Language`, `Sales & Marketing`, `Material Science`.
- **Carousel Controls**: Smooth sliding with `<` and `>` arrows.
- **Rich Course Cards**:
  - GNM – General Nursing & Midwifery (Sunrise College of Nursing)
  - Hotel Management (Global Hospitality Institute)
  - Full Stack Web Development (iTech Skills Academy)
  - Graphic Design & UI/UX (Creative Design Institute)
  - *Plus additional catalog items matching search and state filters.*
- **Interactive "View Course →" Button**: Opens Course Details Modal with full curriculum breakdown, duration, starting fee, eligibility, and direct enrollment form.
- **"Grow with SkillOra" Partnership Block**:
  - 3 Sub-Cards for College / Institute Partner, Hospital / Hotel Employer, Trainer / Course Creator.
  - Direct "Become a Partner →" onboarding modals.

#### Column 3: Right Column ("Latest Verified Jobs" & Trust Cards)
- **4 Verified Job Listings**:
  - Staff Nurse (GNM/B.Sc) • City Hospital & Research Centre • Lucknow
  - ICU Nurse • Metro Multispecialty Hospital • Delhi
  - Front Office Executive • Grand Vista Hotel • Jaipur
  - F&B Service Staff • The Royal Hotel • Bengaluru
- **"Apply Now" Modal**: Form with name, contact, salary display, and simulated resume upload.
- **2 Trust Cards**:
  - State-wise Course Availability (with India map silhouette illustration).
  - Recognized & Verified Institutes (with shield badge and 3-step verification audit popup).

### 5. Bottom Updates Ticker & WhatsApp Help Bar
- **Announcement Ticker**: Auto-scrolling ticker with latest admission alerts and government job notifications.
- **WhatsApp Support Widget**:
  - Green WhatsApp card with "Chat Now →" button.
  - Opens a live WhatsApp conversational drawer with instant automated bot replies.

### 6. Footer
- Dark navy `#0D2C4B` container with official SkillOra logo.
- Links: About Us | Contact Us | Partner Registration | Terms & Conditions | Privacy Policy | Student Support (each opening dedicated informational views).
- Social links: Facebook, Instagram, LinkedIn, YouTube.
- *"India's Multi-Sector Career Platform"* badge.

---

## 🚀 How to Run the Website

### Option 1: Direct Double-Click
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Local HTTP Server
Using Python:
```bash
python -m http.server 3000
```
Then navigate to: `http://localhost:3000`

Using Node:
```bash
npx serve .
```

---

## 📁 File Structure

```
d:/Work/
├── index.html        # Main semantic HTML5 markup
├── styles.css        # Pixel-perfect CSS3 stylesheet with exact Figma tokens
├── app.js            # Interactive JavaScript application & filter engine
├── assets/           # Photography, logo artworks, and icons
├── figma_source/     # Figma CSS dump analysis and extraction assets
└── README.md         # Documentation
```
