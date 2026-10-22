/**
 * SkillOra - High-Performance Education Intelligence & Instant Search Engine
 * Powered by 488 Verified Healthcare, Hospitality & Career Colleges (Supabase + In-Memory Engine)
 */

// Supabase Cloud Backend Configuration
const SUPABASE_CONFIG = {
  url: "https://fvotuteameyrohyphbrk.supabase.co",
  anonKey: "sb_publishable_9bpKJeqSF863GkBogIbE2A_d2s44ntl"
};

// Application State
let ALL_COLLEGES = [];
let CURRENT_FILTERED = [];
let CURRENT_PAGE = 1;
const ITEMS_PER_PAGE = 8;
let CURRENT_CATEGORY = "All";
let SELECTED_COLLEGE = null;
let SELECTED_JOB = null;

// Place Photography mappings (High-Res Realistic Campus & Workplace Photos)
const CAMPUS_PHOTOS = {
  nursing: [
    "assets/places/campus_nursing_1.jpg",
    "assets/places/campus_nursing_2.jpg",
    "assets/places/campus_nursing_3.jpg",
    "assets/places/campus_nursing_4.jpg",
    "assets/places/campus_nursing_5.jpg",
    "assets/places/campus_nursing_6.jpg"
  ],
  hospitality: [
    "assets/places/campus_hotel_1.jpg",
    "assets/places/campus_hotel_2.jpg",
    "assets/places/campus_hotel_3.jpg",
    "assets/places/campus_hotel_4.jpg",
    "assets/places/campus_hotel_5.jpg",
    "assets/places/campus_hotel_6.jpg"
  ],
  sales: [
    "assets/places/campus_sales_1.jpg",
    "assets/places/campus_sales_2.jpg",
    "assets/places/campus_sales_3.jpg",
    "assets/places/campus_sales_4.jpg"
  ],
  language: [
    "assets/places/campus_language_1.jpg",
    "assets/places/campus_language_2.jpg",
    "assets/places/campus_language_3.jpg",
    "assets/places/campus_language_4.jpg"
  ]
};

function getCollegeImage(college) {
  if (!college) return CAMPUS_PHOTOS.nursing[0];
  const cat = (college.category || "").toLowerCase();
  const id = Math.abs(Number(college.id) || 1);
  let pool = CAMPUS_PHOTOS.nursing;
  if (cat.includes("hotel") || cat.includes("hospitality")) {
    pool = CAMPUS_PHOTOS.hospitality;
  } else if (cat.includes("sales") || cat.includes("marketing")) {
    pool = CAMPUS_PHOTOS.sales;
  } else if (cat.includes("language") || cat.includes("grooming")) {
    pool = CAMPUS_PHOTOS.language;
  }
  return pool[id % pool.length];
}

let LAST_SUBMITTED_APPLICATION = null;

const NOTICES_DATA = [
  {
    id: 1,
    title: "Maharashtra State 2026 GNM & B.Sc Nursing Direct Admission Window",
    badge: "Official Circular",
    authority: "Directorate of Medical Education & Research (DMER) • Ref: DMER/NUR/2026/891",
    date: "October 18, 2026",
    content: `
      <p style="margin-bottom:12px;"><strong>Notice Summary:</strong> The Directorate of Medical Education & Research (DMER) and State Nursing Council have officially released the counseling dates for institutional round direct admissions for the 2026 academic batch.</p>
      <div style="background:#F3F9FE;padding:12px;border-radius:6px;margin-bottom:12px;">
        <ul style="padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:12.5px;">
          <li><strong>Eligible Courses:</strong> GNM (3 Years) & B.Sc Nursing (4 Years)</li>
          <li><strong>Eligibility Criteria:</strong> 10+2 with 40% aggregate marks (Science PCB for B.Sc; Any stream for GNM).</li>
          <li><strong>Direct Institutional Round:</strong> Verified participating institutes can conduct spot seat locks.</li>
          <li><strong>State Scholarship:</strong> Reserved category applicants eligible for up to 100% tuition waiver under Mahadbt.</li>
        </ul>
      </div>
      <p style="font-size:12px;color:#728DA9;">Candidates are advised to apply directly with recognized nursing colleges listed on SkillOra to secure provisional seat allotment before counseling rounds conclude.</p>
    `,
    actionText: "Browse Enrolling Nursing Colleges →",
    category: "Nursing"
  },
  {
    id: 2,
    title: "Pan-India Healthcare Mega Walk-In Drives (Direct Hospital Hiring)",
    badge: "Hiring Notification",
    authority: "Apollo, Fortis & Max Healthcare Recruitment Board • Ref: HR-REC-2026-OCT",
    date: "October 18, 2026",
    content: `
      <p style="margin-bottom:12px;"><strong>Drive Overview:</strong> Leading healthcare consortiums across Delhi NCR, Lucknow, Mumbai, and Bengaluru have announced open walk-in hiring drives for immediate joining in October and November 2026.</p>
      <div style="background:#EDFDF5;padding:12px;border-radius:6px;margin-bottom:12px;border:1px solid #B8EED4;">
        <ul style="padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:#0D2C4B;">
          <li><strong>Open Roles:</strong> Staff Nurse (ICU, Emergency, Ward), Patient Care Technicians, OT Assistants.</li>
          <li><strong>Salary Brackets:</strong> ₹ 18,000 to ₹ 40,000 / month + Provident Fund & Health Coverage.</li>
          <li><strong>Experience Required:</strong> Freshers & experienced candidates (0 to 4 years).</li>
          <li><strong>Interview Modes:</strong> Direct campus walk-ins and virtual video rounds.</li>
        </ul>
      </div>
      <p style="font-size:12px;color:#728DA9;">Applications submitted through SkillOra receive fast-track interview scheduling with employer HR within 24 hours.</p>
    `,
    actionText: "Apply to Verified Hospital Openings →",
    jobId: 1
  },
  {
    id: 3,
    title: "NCHMCT Hospitality Joint Entrance 2026 Registration Announcement",
    badge: "Admissions Alert",
    authority: "National Council for Hotel Management & Catering Technology • Ref: NCHM-JEE/2026",
    date: "October 17, 2026",
    content: `
      <p style="margin-bottom:12px;"><strong>Admissions Alert:</strong> Admissions for Degree & Diploma programs in Hotel Management, Culinary Arts, and Front Office Operations for the 2026-27 academic session are officially underway.</p>
      <div style="background:#FFF9E6;padding:12px;border-radius:6px;margin-bottom:12px;border:1px solid #FFE699;">
        <ul style="padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:#7A5200;">
          <li><strong>Programs Offered:</strong> B.Sc Hospitality & Hotel Administration, Diploma in Food & Beverage, Diploma in Bakery & Confectionery.</li>
          <li><strong>Placement Partners:</strong> Taj Hotels, Oberoi Group, Marriott International, Hyatt.</li>
          <li><strong>Mode of Learning:</strong> Full-time campus hands-on kitchen training and 6-month luxury hotel internships.</li>
        </ul>
      </div>
      <p style="font-size:12px;color:#728DA9;">Explore top institutes in Mumbai, Jaipur, Bengaluru, and Delhi with verified campus infrastructure on SkillOra.</p>
    `,
    actionText: "Explore Hospitality Colleges →",
    category: "Hospitality"
  },
  {
    id: 4,
    title: "State Nursing Scholarship & 0% EMI Fee Assistance Helpline",
    badge: "Student Welfare",
    authority: "SkillOra Academic Welfare Council • Advisory: SKL-WEL-2026/04",
    date: "October 16, 2026",
    content: `
      <p style="margin-bottom:12px;"><strong>Helpline Advisory:</strong> SkillOra has activated dedicated financial assistance desks to guide students seeking zero-interest EMI financing, state post-matric scholarships, and institutional fee waivers.</p>
      <div style="background:#F3F9FE;padding:12px;border-radius:6px;margin-bottom:12px;">
        <ul style="padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:12.5px;">
          <li><strong>Toll-Free Helpline:</strong> 1800-890-SKILL (9:00 AM - 8:00 PM IST)</li>
          <li><strong>WhatsApp Guidance:</strong> +91 98200 12345</li>
          <li><strong>Partner Banks:</strong> HDFC Credila, SBI Scholar Loans, Propelld Education Financing.</li>
        </ul>
      </div>
    `,
    actionText: "Talk to Student Welfare Counselor →",
    category: "Nursing"
  }
];

// Fallback seed data if database file is loaded standalone
const FALLBACK_SEED = [
  {
    id: 1,
    name: "Sunrise College of Nursing (Mumbai)",
    cleanName: "Sunrise College of Nursing",
    category: "Nursing & Healthcare",
    state: "Maharashtra",
    city: "Mumbai",
    established: 2012,
    rating: 4.8,
    approval: "INC Approved",
    minFee: 45000,
    minFeeDisplay: "₹ 45,000",
    coursesCount: 3,
    courses: [
      { name: "GNM – General Nursing & Midwifery", duration: "3 Years", fee: 45000, feeDisplay: "₹ 45,000", mode: "Both", eligibility: "10+2 Any Stream" },
      { name: "B.Sc Nursing", duration: "4 Years", fee: 75000, feeDisplay: "₹ 75,000", mode: "Offline", eligibility: "10+2 Science (PCB)" },
      { name: "Post Basic B.Sc Nursing", duration: "2 Years", fee: 42000, feeDisplay: "₹ 42,000", mode: "Both", eligibility: "GNM Registered" }
    ],
    recruiters: ["Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Medanta"],
    verified: true,
    hostel: "Available (AC & Non-AC)",
    overview: "Premier accredited healthcare institution in Mumbai affiliated with the State Nursing Council and Indian Nursing Council."
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  initSearchEngine();
  initCategoryListeners();
  initSidebarFilters();
  initStateDirectory();
  initCarousel();
  initTickerAnimation();
  initKeyboardListeners();
});

/* ==========================================================================
   1. DATABASE INITIALIZATION & IN-MEMORY ENGINE
   ========================================================================== */
function initDatabase() {
  if (window.COLLEGES_DB && Array.isArray(window.COLLEGES_DB) && window.COLLEGES_DB.length > 0) {
    ALL_COLLEGES = window.COLLEGES_DB;
  } else {
    ALL_COLLEGES = FALLBACK_SEED;
  }

  // Merge custom colleges from Admin and College Partner Portals
  try {
    const customColleges = JSON.parse(localStorage.getItem('SKILLORA_CUSTOM_COLLEGES') || '[]');
    if (customColleges.length > 0) {
      ALL_COLLEGES = [...customColleges, ...ALL_COLLEGES];
      ALL_COLLEGES = Array.from(new Map(ALL_COLLEGES.map(c => [c.id, c])).values());
    }
  } catch(e) {}

  CURRENT_FILTERED = [...ALL_COLLEGES];
  CURRENT_PAGE = 1;

  // Render initial page
  renderCatalogPage();
  updateCityOptions();
}

/* ==========================================================================
   2. INSTANT SEARCH AUTOCOMPLETE (< 1ms Latency)
   ========================================================================== */
function initSearchEngine() {
  const searchInput = document.getElementById('hero-search-input');
  const dropdown = document.getElementById('search-autocomplete-dropdown');
  const clearBtn = document.getElementById('clear-search-btn');
  const submitBtn = document.getElementById('hero-search-submit');
  const headerSearchBtn = document.getElementById('header-search-btn');

  if (!searchInput || !dropdown) return;

  const executeSearch = () => {
    const term = searchInput.value.trim();
    if (!term) return;
    dropdown.style.display = 'none';

    const lower = term.toLowerCase();
    const jobKeywords = ['job', 'vacancy', 'hiring', 'work', 'salary', 'nurse vacancy', 'icu nurse', 'staff nurse', 'receptionist', 'executive', 'technician', 'fresher job', 'walk in'];
    const isJobRelated = jobKeywords.some(k => lower.includes(k));

    if (isJobRelated) {
      window.location.href = `jobs.html?search=${encodeURIComponent(term)}`;
    } else {
      window.location.href = `colleges.html?search=${encodeURIComponent(term)}`;
    }
  };

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();

    if (clearBtn) {
      clearBtn.style.display = val.length > 0 ? 'block' : 'none';
    }

    if (val.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }

    const collegeMatches = [];
    const courseMatches = [];
    const jobMatches = [];

    // 1. Search Colleges Database (488+ institutes)
    for (let i = 0; i < ALL_COLLEGES.length; i++) {
      const c = ALL_COLLEGES[i];
      const nameMatch = c.name.toLowerCase().includes(val);
      const cityMatch = c.city.toLowerCase().includes(val);
      const stateMatch = c.state.toLowerCase().includes(val);
      const catMatch = (c.category || '').toLowerCase().includes(val);

      if ((nameMatch || cityMatch || stateMatch || catMatch) && collegeMatches.length < 4) {
        collegeMatches.push({
          title: c.name,
          sub: `${c.category} • ${c.city}, ${c.state}`,
          tag: '🎓 College',
          url: `colleges.html?collegeId=${c.id}`
        });
      }

      // Check inner courses
      if (c.courses && courseMatches.length < 4) {
        for (let j = 0; j < c.courses.length; j++) {
          const crs = c.courses[j];
          if (crs.name.toLowerCase().includes(val)) {
            if (!courseMatches.some(m => m.title === crs.name)) {
              courseMatches.push({
                title: crs.name,
                sub: `Offered at ${c.cleanName || c.name} • Fee: ${crs.feeDisplay}`,
                tag: '📚 Course',
                url: `colleges.html?search=${encodeURIComponent(crs.name)}`
              });
            }
          }
        }
      }

      if (collegeMatches.length >= 4 && courseMatches.length >= 4) break;
    }

    // 2. Search Verified Jobs Database
    const ALL_VERIFIED_JOBS = [
      { id: 1, title: "Staff Nurse (GNM / B.Sc)", company: "City Hospital & Research Centre", location: "Lucknow, Uttar Pradesh", salary: "₹ 18,000 - 28,000 / mo", sector: "Healthcare" },
      { id: 2, title: "ICU & Critical Care Nurse", company: "Metro Multispecialty Hospital", location: "Delhi, Delhi NCR", salary: "₹ 25,000 - 40,000 / mo", sector: "Healthcare" },
      { id: 3, title: "Front Office Executive & Receptionist", company: "Grand Vista Hotel & Resort", location: "Jaipur, Rajasthan", salary: "₹ 16,000 - 22,000 / mo", sector: "Hospitality" },
      { id: 4, title: "Food & Beverage (F&B) Service Staff", company: "The Royal Hotel & Suites", location: "Bengaluru, Karnataka", salary: "₹ 14,000 - 20,000 / mo", sector: "Hospitality" },
      { id: 5, title: "Hospital Operations & Admission Desk", company: "Medanta Super Specialty Wing", location: "Lucknow, Uttar Pradesh", salary: "₹ 20,000 - 30,000 / mo", sector: "Healthcare" },
      { id: 6, title: "Corporate Healthcare Relationship Manager", company: "Apex Healthcare Network", location: "Mumbai, Maharashtra", salary: "₹ 22,000 - 35,000 / mo", sector: "Sales" }
    ];

    for (let k = 0; k < ALL_VERIFIED_JOBS.length; k++) {
      const j = ALL_VERIFIED_JOBS[k];
      const titleMatch = j.title.toLowerCase().includes(val);
      const compMatch = j.company.toLowerCase().includes(val);
      const locMatch = j.location.toLowerCase().includes(val);
      const secMatch = (j.sector || '').toLowerCase().includes(val);

      if ((titleMatch || compMatch || locMatch || secMatch) && jobMatches.length < 4) {
        jobMatches.push({
          title: j.title,
          sub: `${j.company} • ${j.location} • ${j.salary}`,
          tag: '💼 Job Vacancy',
          url: `jobs.html?jobId=${j.id}`
        });
      }
    }

    const totalMatches = collegeMatches.length + courseMatches.length + jobMatches.length;

    if (totalMatches === 0) {
      dropdown.innerHTML = `
        <div class="ac-top-summary" style="background:#FFF9F0; border-bottom:1px solid #FFE4CC;">
          <div class="ac-top-summary-text">
            <span>⚠️ No immediate match for &ldquo;<strong>${escapeHtml(val)}</strong>&rdquo;</span>
          </div>
          <span class="ac-top-count-badge" style="color:#FF922A; border-color:#FFD2A8;">0 Found</span>
        </div>
        <div class="autocomplete-item" onclick="window.location.href='colleges.html?search=${encodeURIComponent(val)}'">
          <div class="ac-main-col">
            <div class="ac-title">Search complete database for &ldquo;${escapeHtml(val)}&rdquo;</div>
            <div class="ac-sub">Press Enter to explore all 488+ colleges, accredited courses, and hospital/hotel jobs</div>
          </div>
          <span class="ac-tag ac-tag-college">Search All →</span>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    let html = `
      <div class="ac-top-summary">
        <div class="ac-top-summary-text">
          <span class="ac-summary-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#087BFF" stroke-width="2.5"/><path d="M21 21L16.65 16.65" stroke="#087BFF" stroke-width="2.5" stroke-linecap="round"/></svg>
          </span>
          <span>Found <strong>${totalMatches}</strong> results for &ldquo;<strong>${escapeHtml(val)}</strong>&rdquo;</span>
        </div>
        <span class="ac-top-count-badge">${totalMatches} Matches</span>
      </div>
    `;

    if (collegeMatches.length > 0) {
      html += `<div class="ac-group-header">🎓 Colleges & Institutes (${collegeMatches.length})</div>`;
      html += collegeMatches.map(m => `
        <a class="autocomplete-item" href="${m.url}">
          <div class="ac-main-col">
            <div class="ac-title">${escapeHtml(m.title)}</div>
            <div class="ac-sub">${escapeHtml(m.sub)}</div>
          </div>
          <span class="ac-tag ac-tag-college">${m.tag}</span>
        </a>
      `).join('');
    }

    if (courseMatches.length > 0) {
      html += `<div class="ac-group-header">📚 Courses & Degrees (${courseMatches.length})</div>`;
      html += courseMatches.map(m => `
        <a class="autocomplete-item" href="${m.url}">
          <div class="ac-main-col">
            <div class="ac-title">${escapeHtml(m.title)}</div>
            <div class="ac-sub">${escapeHtml(m.sub)}</div>
          </div>
          <span class="ac-tag ac-tag-course">${m.tag}</span>
        </a>
      `).join('');
    }

    if (jobMatches.length > 0) {
      html += `<div class="ac-group-header">💼 Verified Jobs & Openings (${jobMatches.length})</div>`;
      html += jobMatches.map(m => `
        <a class="autocomplete-item" href="${m.url}">
          <div class="ac-main-col">
            <div class="ac-title">${escapeHtml(m.title)}</div>
            <div class="ac-sub">${escapeHtml(m.sub)}</div>
          </div>
          <span class="ac-tag ac-tag-job">${m.tag}</span>
        </a>
      `).join('');
    }

    html += `
      <div class="ac-footer-action" onclick="executeHeroSearchSubmit()">
        <span>🔎 Press <kbd style="background:#FFFFFF;border:1px solid #C7D8E8;padding:2px 6px;border-radius:4px;font-family:inherit;font-size:11px;font-weight:800;color:#0A2540;">Enter</kbd> to explore full results for &ldquo;${escapeHtml(val)}&rdquo; in dedicated tab →</span>
      </div>
    `;

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  });

  window.executeHeroSearchSubmit = executeSearch;

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
    });
  }

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
  });

  if (submitBtn) submitBtn.addEventListener('click', executeSearch);

  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', () => {
      searchInput.focus();
      document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

function handleSearchSelect(collegeId) {
  const dropdown = document.getElementById('search-autocomplete-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  window.location.href = `colleges.html?collegeId=${collegeId}`;
}

function runGlobalSearch(term) {
  window.location.href = `colleges.html?search=${encodeURIComponent(term)}`;
}

/* ==========================================================================
   3. CATEGORY FILTER SYSTEM
   ========================================================================== */
function initCategoryListeners() {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      filterByCategory(cat);
      document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.dropdown-item[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-category');
      filterByCategory(cat);
      document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function filterByCategory(category) {
  CURRENT_CATEGORY = category;

  document.querySelectorAll('.pill-btn').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (cat === category) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  if (category === 'All') {
    CURRENT_FILTERED = [...ALL_COLLEGES];
  } else {
    // Exact or loose match category
    CURRENT_FILTERED = ALL_COLLEGES.filter(c => {
      if (category === 'Nursing') return c.category.includes('Nursing');
      if (category === 'Hospitality') return c.category.includes('Hospitality');
      if (category === 'Sales & Marketing') return c.category.includes('Sales');
      if (category === 'Language') return c.category.includes('Language');
      return c.category === category;
    });
  }

  CURRENT_PAGE = 1;
  renderCatalogPage();

  const catSelect = document.getElementById('filter-category');
  if (catSelect) catSelect.value = category === 'All' ? '' : category;
}

/* ==========================================================================
   4. SIDEBAR FILTERS & DYNAMIC CASCADING
   ========================================================================== */
function initSidebarFilters() {
  const feeSlider = document.getElementById('filter-fee');
  if (feeSlider) {
    updateFeeDisplay(feeSlider.value);
  }
}

function updateCityOptions() {
  const stateSelect = document.getElementById('filter-state');
  const citySelect = document.getElementById('filter-city');
  if (!stateSelect || !citySelect) return;

  const state = stateSelect.value;
  citySelect.innerHTML = '<option value="">All Cities</option>';

  let cities = new Set();
  ALL_COLLEGES.forEach(c => {
    if (!state || c.state === state) {
      cities.add(c.city);
    }
  });

  Array.from(cities).sort().forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
}

function updateFeeDisplay(val) {
  const display = document.getElementById('fee-current-val');
  if (display) {
    const formatted = Number(val).toLocaleString('en-IN');
    display.textContent = `Up to ₹${formatted}`;
  }
}

function applySidebarFilters() {
  const state = document.getElementById('filter-state')?.value || '';
  const city = document.getElementById('filter-city')?.value || '';
  const category = document.getElementById('filter-category')?.value || '';
  const maxFee = Number(document.getElementById('filter-fee')?.value || 200000);

  const selectedModes = [];
  document.querySelectorAll('input[name="mode"]:checked').forEach(cb => {
    selectedModes.push(cb.value);
  });

  CURRENT_FILTERED = ALL_COLLEGES.filter(c => {
    if (category) {
      if (category === 'Nursing' && !c.category.includes('Nursing')) return false;
      if (category === 'Hospitality' && !c.category.includes('Hospitality')) return false;
      if (category === 'IT & Coding' && !c.category.includes('IT & Coding')) return false;
      if (category === 'Designing' && !c.category.includes('Designing')) return false;
      if (category === 'Sales & Marketing' && !c.category.includes('Sales')) return false;
      if (category === 'Language' && !c.category.includes('Language')) return false;
      if (category === 'Material Science' && !c.category.includes('Material')) return false;
    }

    if (c.minFee > maxFee) return false;
    if (state && c.state !== state) return false;
    if (city && c.city !== city) return false;

    if (selectedModes.length > 0) {
      const matchesMode = c.courses.some(crs => 
        selectedModes.includes(crs.mode) || crs.mode === "Both"
      );
      if (!matchesMode) return false;
    }

    return true;
  });

  CURRENT_PAGE = 1;
  renderCatalogPage();
  showToast(`Filters applied: ${CURRENT_FILTERED.length} colleges matching!`);
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

function resetSidebarFilters() {
  const form = document.getElementById('filter-form');
  if (form) form.reset();

  const feeSlider = document.getElementById('filter-fee');
  if (feeSlider) {
    feeSlider.value = 200000;
    updateFeeDisplay(200000);
  }

  updateCityOptions();
  filterByCategory('All');
  showToast('All filters reset. Displaying full directory.');
}

function filterByState(state) {
  closeModal('state-modal');
  const stateSelect = document.getElementById('filter-state');
  if (stateSelect) {
    stateSelect.value = state;
    updateCityOptions();
    applySidebarFilters();
  }
}

/* ==========================================================================
   5. CATALOG RENDERING & PAGINATION (Zero Lag)
   ========================================================================== */
function renderCatalogPage() {
  const container = document.getElementById('courses-grid');
  const countBadge = document.getElementById('catalog-count-badge');
  const pageIndicator = document.getElementById('page-indicator');
  const prevBtn = document.getElementById('page-prev-btn');
  const nextBtn = document.getElementById('page-next-btn');

  if (!container) return;

  const total = CURRENT_FILTERED.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  if (CURRENT_PAGE > totalPages) CURRENT_PAGE = totalPages;
  if (CURRENT_PAGE < 1) CURRENT_PAGE = 1;

  const startIndex = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, total);
  const pageItems = CURRENT_FILTERED.slice(startIndex, endIndex);

  // Update badge and controls
  if (countBadge) {
    countBadge.textContent = total > 0 
      ? `Showing ${startIndex + 1}–${endIndex} of ${total} Verified Colleges`
      : `0 Colleges Found`;
  }

  if (pageIndicator) pageIndicator.textContent = `Page ${CURRENT_PAGE} of ${totalPages}`;
  if (prevBtn) prevBtn.disabled = CURRENT_PAGE <= 1;
  if (nextBtn) nextBtn.disabled = CURRENT_PAGE >= totalPages;

  if (total === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: #F8FCFF; border: 1px dashed #CCDEF5; border-radius: 8px;">
        <h4 style="font-size: 15px; color: #173C62; margin-bottom: 6px;">No colleges found for this specific filter</h4>
        <p style="font-size: 12px; color: #728DA9; margin-bottom: 14px;">Try expanding your fee budget or checking All States.</p>
        <button class="btn btn-apply-filters" onclick="resetSidebarFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = pageItems.map(c => {
    const thumb = getCollegeImage(c);
    const primaryCourse = c.courses[0] || { name: c.category, duration: "1 Year", feeDisplay: c.minFeeDisplay, mode: "Both" };

    return `
      <article class="course-card" onclick="window.location.href='colleges.html?collegeId=' + ${c.id}" style="cursor:pointer;">
        <div class="course-img-wrap">
          <img src="${thumb}" alt="${c.cleanName || c.name} Campus Facility" class="course-thumb" loading="lazy">
          <span class="verified-inst-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${c.approval || 'Verified Institute'}</span>
          </span>
          <span class="campus-photo-tag">📍 Verified Campus</span>
        </div>
        <div class="course-body">
          <h3 class="course-title" title="${c.name}">${primaryCourse.name}</h3>
          
          <div class="course-meta-item">
            <span class="meta-icon icon-teal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#5FBAAE" stroke-width="2"/><path d="M16 2V6" stroke="#5FBAAE" stroke-width="2"/><path d="M8 2V6" stroke="#5FBAAE" stroke-width="2"/><path d="M3 10H21" stroke="#5FBAAE" stroke-width="2"/></svg>
            </span>
            <span class="meta-text">Duration: ${primaryCourse.duration}</span>
          </div>

          <div class="course-meta-item">
            <span class="meta-icon icon-gold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="2" stroke="#EBBE61" stroke-width="2"/><path d="M16 13C16 14.1 16.9 15 18 15H22V11H18C16.9 11 16 11.9 16 13Z" stroke="#EBBE61" stroke-width="2"/></svg>
            </span>
            <span class="meta-text">Fee starts at: <strong>${c.minFeeDisplay}</strong></span>
          </div>

          <div class="course-mode-row">
            <span class="mode-tag"><span class="mode-bullet">📍</span> ${c.city}, ${c.state}</span>
          </div>

          <div class="course-provider" title="${c.name}">${c.cleanName || c.name}</div>
          
          <button class="btn btn-view-course" onclick="event.stopPropagation(); window.location.href='colleges.html?collegeId=' + ${c.id}">
            <span>View College & Fees</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function changeCatalogPage(delta) {
  CURRENT_PAGE += delta;
  renderCatalogPage();
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

function slideCourses(direction) {
  changeCatalogPage(direction);
}

/* ==========================================================================
   6. COLLEGE INTELLIGENCE MULTI-TAB MODAL (Collegedunia-style)
   ========================================================================== */
function openCollegeModal(collegeId) {
  window.location.href = `colleges.html?collegeId=${collegeId}`;
  return;
  const college = ALL_COLLEGES.find(c => c.id === Number(collegeId));
  if (!college) return;

  SELECTED_COLLEGE = college;

  // Set Campus Place Photo Hero Banner
  const campusImg = document.getElementById('modal-campus-img');
  const campusBadge = document.getElementById('modal-campus-badge-text');
  if (campusImg) {
    campusImg.src = getCollegeImage(college);
  }
  if (campusBadge) {
    const cat = (college.category || "").toLowerCase();
    if (cat.includes('nurse') || cat.includes('health')) {
      campusBadge.textContent = "📍 Verified Medical Campus & Teaching Hospital";
    } else if (cat.includes('hotel') || cat.includes('hospit')) {
      campusBadge.textContent = "📍 Verified Luxury Hotel & Culinary Campus";
    } else if (cat.includes('sales')) {
      campusBadge.textContent = "📍 Verified Corporate Business Campus";
    } else {
      campusBadge.textContent = "📍 Verified Academic Learning Campus";
    }
  }

  // Header info
  document.getElementById('modal-course-cat').textContent = college.category;
  document.getElementById('modal-rating-pill').textContent = `★ ${college.rating || 4.7} / 5`;
  document.getElementById('modal-approval-badge').textContent = college.approval || 'Verified Institute';
  document.getElementById('modal-course-title').textContent = college.name;
  document.getElementById('modal-course-institute').textContent = `${college.city}, ${college.state} • Est. ${college.established || 2012}`;

  // Tab 1: Overview
  const pCourse = college.courses[0] || { duration: "3 Years", feeDisplay: college.minFeeDisplay, mode: "Offline" };
  document.getElementById('modal-course-duration').textContent = pCourse.duration;
  document.getElementById('modal-course-fee').textContent = college.minFeeDisplay;
  document.getElementById('modal-course-mode').textContent = pCourse.mode;
  document.getElementById('modal-course-appr').textContent = college.approval || 'Government Approved';
  document.getElementById('modal-course-desc').textContent = college.overview || 'Accredited institution offering top-tier clinical and industrial training with guaranteed campus placement support.';

  // Tab 2: Courses & Fees Table
  document.getElementById('modal-tab-courses-count').textContent = college.courses.length;
  const tableBody = document.getElementById('modal-courses-table-body');
  if (tableBody) {
    tableBody.innerHTML = college.courses.map((crs, idx) => `
      <tr id="course-row-${idx}">
        <td style="font-weight:700;">${crs.name}</td>
        <td>${crs.duration}</td>
        <td class="table-fee-highlight">${crs.feeDisplay}</td>
        <td>${crs.mode}</td>
        <td style="color:#728DA9;">${crs.eligibility || '10+2 Any Stream'}</td>
        <td>
          <button class="table-apply-btn" onclick="applyDirectCourse('${crs.name}')">Apply</button>
        </td>
      </tr>
    `).join('');
  }

  // Dynamic Course Dropdown Selector inside Admission Form
  const courseSelect = document.getElementById('lead-course-select');
  if (courseSelect) {
    courseSelect.innerHTML = college.courses.map(crs => `
      <option value="${crs.name}" data-duration="${crs.duration}" data-fee="${crs.feeDisplay}">
        ${crs.name} (${crs.feeDisplay} / yr)
      </option>
    `).join('');
  }

  // Initialize selected course highlight with primary course
  updateFormCourseHighlight(pCourse);

  // Tab 3: Placements
  const highestPkg = `₹ ${(4.5 + (college.id % 4) * 1.5).toFixed(1)} LPA`;
  const avgPkg = `₹ ${(2.8 + (college.id % 3) * 0.6).toFixed(1)} LPA`;
  document.getElementById('modal-highest-pkg').textContent = highestPkg;
  document.getElementById('modal-avg-pkg').textContent = avgPkg;

  const recList = document.getElementById('modal-recruiters-list');
  if (recList) {
    const recruiters = college.recruiters || ["Apollo Hospitals", "Fortis Healthcare", "Taj Hotels", "Marriott", "Max Healthcare"];
    recList.innerHTML = recruiters.map(r => `<span class="recruiter-tag">🏢 ${r}</span>`).join('');
  }

  // Tab 4: Campus & Hostel
  document.getElementById('modal-hostel-info').textContent = `Living Accommodation: ${college.hostel || 'Hostel facility available on campus with Wi-Fi, 24/7 security, and hygienic food.'}`;

  // Reset form and success box state
  const form = document.getElementById('admission-enquiry-form');
  const successBox = document.getElementById('admission-success-box');
  if (form) form.style.display = 'block';
  if (successBox) successBox.style.display = 'none';

  // Auto-fill student profile if authenticated
  const userStr = localStorage.getItem('SKILLORA_CURRENT_USER');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      const nameInput = document.getElementById('lead-student-name');
      const phoneInput = document.getElementById('lead-student-phone');
      const emailInput = document.getElementById('lead-student-email');
      if (nameInput && u.name) nameInput.value = u.name;
      if (phoneInput && u.phone) phoneInput.value = u.phone;
      if (emailInput && u.email) emailInput.value = u.email;
    } catch (e) {}
  }

  // Default to overview tab
  const firstTab = document.querySelector('.c-tab-btn');
  if (firstTab) switchCollegeTab(firstTab, 'c-tab-overview');

  openModal('course-modal');
}

// Compatibility alias
function openCourseModal(id) {
  openCollegeModal(id);
}

function switchCollegeTab(btn, paneId) {
  document.querySelectorAll('.c-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.college-tab-pane').forEach(p => p.classList.remove('active'));

  if (btn) btn.classList.add('active');
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('active');
}

function onCourseDropdownChange() {
  const select = document.getElementById('lead-course-select');
  if (!select || !SELECTED_COLLEGE) return;
  const courseName = select.value;
  const course = (SELECTED_COLLEGE.courses || []).find(c => c.name === courseName) || {
    name: courseName,
    duration: "Flexible",
    feeDisplay: SELECTED_COLLEGE.minFeeDisplay
  };
  updateFormCourseHighlight(course);
}

function updateFormCourseHighlight(course) {
  const nameEl = document.getElementById('highlight-course-name');
  const durEl = document.getElementById('highlight-course-duration');
  const feeEl = document.getElementById('highlight-course-fee');
  if (nameEl) nameEl.textContent = course.name;
  if (durEl) durEl.textContent = `⏱️ ${course.duration || 'Flexible'}`;
  if (feeEl) feeEl.textContent = `💰 ${course.feeDisplay || course.fee || '₹ 45,000'} / Year`;
}

function applyDirectCourse(courseName) {
  const select = document.getElementById('lead-course-select');
  if (select) {
    select.value = courseName;
    onCourseDropdownChange();
  }
  showToast(`Selected "${courseName}". Fill the quick form below to submit!`);
  const formContainer = document.querySelector('.modal-admission-container');
  if (formContainer) {
    formContainer.scrollIntoView({ behavior: 'smooth' });
    const nameInput = document.getElementById('lead-student-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 300);
  }
}

async function submitEnrollment() {
  const nameInput = document.getElementById('lead-student-name');
  const phoneInput = document.getElementById('lead-student-phone');
  const emailInput = document.getElementById('lead-student-email');
  const batchInput = document.getElementById('lead-student-batch');
  const courseSelect = document.getElementById('lead-course-select');
  const submitBtn = document.getElementById('btn-submit-lead');

  const batch = batchInput ? batchInput.value : '2026 Regular Batch';
  const selectedCourseName = courseSelect ? courseSelect.value : (
    (SELECTED_COLLEGE && SELECTED_COLLEGE.courses && SELECTED_COLLEGE.courses[0]) 
      ? SELECTED_COLLEGE.courses[0].name 
      : (SELECTED_COLLEGE ? SELECTED_COLLEGE.category : 'General Admission')
  );
  const collegeName = SELECTED_COLLEGE ? (SELECTED_COLLEGE.cleanName || SELECTED_COLLEGE.name) : "the institute";
  const collegeId = SELECTED_COLLEGE ? SELECTED_COLLEGE.id : null;

  // 1. Mandatory Student Authentication Check
  const userStr = localStorage.getItem('SKILLORA_CURRENT_USER');
  if (!userStr) {
    sessionStorage.setItem('SKILLORA_PENDING_APPLY', JSON.stringify({
      type: 'course',
      collegeId: collegeId,
      courseName: selectedCourseName,
      collegeName: collegeName
    }));
    alert(`To apply for "${selectedCourseName}" at ${collegeName}, please Sign In or create your free Student Account.`);
    window.location.href = `auth.html?redirect=apply&type=course&title=${encodeURIComponent(selectedCourseName)}`;
    return;
  }

  const user = JSON.parse(userStr);
  const studentName = (nameInput && nameInput.value.trim()) || user.name;
  const phone = (phoneInput && phoneInput.value.trim()) || user.phone;
  const email = (emailInput && emailInput.value.trim()) || user.email;

  if (!studentName || !phone) {
    showToast('Please enter your Name and Mobile Number.');
    return;
  }

  const courseObj = (SELECTED_COLLEGE && SELECTED_COLLEGE.courses) 
    ? SELECTED_COLLEGE.courses.find(c => c.name === selectedCourseName) 
    : null;
  const courseFee = courseObj ? courseObj.feeDisplay : (SELECTED_COLLEGE ? SELECTED_COLLEGE.minFeeDisplay : "Standard Fee");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Registering in Supabase...</span>';
  }

  const refId = `SKL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  LAST_SUBMITTED_APPLICATION = {
    refId,
    studentName,
    phone,
    email: email || 'Not provided',
    courseName: selectedCourseName,
    collegeName,
    collegeState: SELECTED_COLLEGE ? SELECTED_COLLEGE.state : '',
    collegeCity: SELECTED_COLLEGE ? SELECTED_COLLEGE.city : '',
    batch,
    fee: courseFee,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: new Date().toISOString()
  };

  // Persist locally for Admin Portal and Student Dashboard
  try {
    const allCourseApps = JSON.parse(localStorage.getItem('SKILLORA_ALL_COURSE_APPLICATIONS') || '[]');
    allCourseApps.unshift(LAST_SUBMITTED_APPLICATION);
    localStorage.setItem('SKILLORA_ALL_COURSE_APPLICATIONS', JSON.stringify(allCourseApps));

    const myAdmissions = JSON.parse(localStorage.getItem('SKILLORA_MY_ADMISSIONS') || '[]');
    myAdmissions.unshift(LAST_SUBMITTED_APPLICATION);
    localStorage.setItem('SKILLORA_MY_ADMISSIONS', JSON.stringify(myAdmissions));

    const activityLog = JSON.parse(localStorage.getItem('SKILLORA_LIVE_ACTIVITY_LOG') || '[]');
    activityLog.unshift({
      id: refId,
      type: 'course',
      title: `${studentName} applied for ${selectedCourseName}`,
      desc: `${collegeName} (${SELECTED_COLLEGE ? SELECTED_COLLEGE.city : 'Campus'}) • 10-Digit: ${phone}`,
      time: 'Just now',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('SKILLORA_LIVE_ACTIVITY_LOG', JSON.stringify(activityLog.slice(0, 50)));
  } catch (storageErr) {
    console.warn('LocalStorage save error:', storageErr);
  }

  try {
    const payload = {
      college_id: collegeId,
      student_name: studentName,
      phone: phone,
      email: email || null,
      course_name: `${selectedCourseName} (${batch})`,
      state: SELECTED_COLLEGE ? SELECTED_COLLEGE.state : null,
      city: SELECTED_COLLEGE ? SELECTED_COLLEGE.city : null,
      source: 'Direct Website Form'
    };

    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/admission_leads`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Note: offline fallback for admission lead submission:', err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Confirm & Submit Direct Application</span><span style="font-size:14px;">→</span>';
    }

    // Display professional in-modal success card
    const form = document.getElementById('admission-enquiry-form');
    const successBox = document.getElementById('admission-success-box');
    if (form) form.style.display = 'none';
    if (successBox) {
      const refEl = document.getElementById('receipt-ref-id');
      const nameEl = document.getElementById('receipt-student-name');
      const courseEl = document.getElementById('receipt-course-name');
      const collEl = document.getElementById('receipt-college-name');
      const feeEl = document.getElementById('receipt-course-fee');
      if (refEl) refEl.textContent = refId;
      if (nameEl) nameEl.textContent = studentName;
      if (courseEl) courseEl.textContent = selectedCourseName;
      if (collEl) collEl.textContent = collegeName;
      if (feeEl) feeEl.textContent = `${courseFee} / Year`;
      successBox.style.display = 'block';
      successBox.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Application successfully registered! Ref ID: ${refId}`, true);
  }
}

function downloadApplicationSlip() {
  if (!LAST_SUBMITTED_APPLICATION) {
    showToast('No active application slip available.');
    return;
  }
  const app = LAST_SUBMITTED_APPLICATION;
  const printWindow = window.open('', '_blank', 'width=750,height=600');
  if (!printWindow) {
    showToast(`Application Reference: ${app.refId}. Receipt confirmed!`, true);
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SkillOra - Official Admission Application Slip (${app.refId})</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #173C62; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #087BFF; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #173C62; }
        .logo span { color: #FF922A; }
        .badge { background: #EDF8FF; color: #087BFF; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
        .table td { padding: 10px 12px; border-bottom: 1px solid #E5F0F9; font-size: 14px; }
        .table td:first-child { font-weight: 600; color: #728DA9; width: 35%; }
        .table td:last-child { font-weight: 700; color: #173C62; }
        .footer { font-size: 11px; color: #728DA9; border-top: 1px dashed #CCDEF5; padding-top: 12px; margin-top: 30px; text-align: center; }
        .stamp { display: inline-block; border: 2px solid #0FA66D; color: #0FA66D; font-weight: 800; font-size: 13px; padding: 6px 14px; border-radius: 6px; text-transform: uppercase; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Skill<span>Ora</span> <div style="font-size:11px;color:#728DA9;font-weight:600;">Verified Admissions Portal</div></div>
        <div class="badge">PROVISIONAL ADMISSION SLIP 2026</div>
      </div>
      <h3>Direct Admission Registration Acknowledgment</h3>
      <table class="table">
        <tr><td>Reference ID</td><td style="color:#087BFF;">${app.refId}</td></tr>
        <tr><td>Registration Date</td><td>${app.date}</td></tr>
        <tr><td>Student Full Name</td><td>${app.studentName}</td></tr>
        <tr><td>Mobile Number</td><td>${app.phone}</td></tr>
        <tr><td>Email Address</td><td>${app.email}</td></tr>
        <tr><td>Target Institution</td><td>${app.collegeName} (${app.collegeCity}, ${app.collegeState})</td></tr>
        <tr><td>Enrolled Program</td><td>${app.courseName}</td></tr>
        <tr><td>Academic Batch</td><td>${app.batch}</td></tr>
        <tr><td>Annual Tuition Fee</td><td style="color:#0FA66D;">${app.fee}</td></tr>
      </table>
      <div style="text-align:center;">
        <div class="stamp">✔ DIRECT SEAT APPLICATION REGISTERED</div>
      </div>
      <div class="footer">
        SkillOra Institutional Admissions Network • BKC, Mumbai • 1800-890-SKILL • support@skillora.in
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/* ==========================================================================
   7. STATE DIRECTORY MODAL
   ========================================================================== */
function initStateDirectory() {
  const container = document.querySelector('.state-grid-list');
  if (!container) return;

  // Aggregate real college counts by state
  const stateCounts = {};
  ALL_COLLEGES.forEach(c => {
    stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
  });

  const sortedStates = Object.keys(stateCounts).sort();

  container.innerHTML = sortedStates.map(state => `
    <div class="state-item" onclick="filterByState('${state}')">
      <strong class="state-name">${state}</strong>
      <span class="state-count">${stateCounts[state]} Verified Institutes • ${stateCounts[state] * 3}+ Courses</span>
    </div>
  `).join('');
}

/* ==========================================================================
   8. JOBS & PARTNER MODALS
   ========================================================================== */
const JOBS_DATA = [
  { id: 1, title: "Staff Nurse (GNM/B.Sc)", company: "City Hospital & Research Centre", location: "Lucknow, Uttar Pradesh", salary: "₹ 18,000 - 28,000/month", type: "Full Time" },
  { id: 2, title: "ICU Nurse", company: "Metro Multispecialty Hospital", location: "Delhi, Delhi", salary: "₹ 25,000 - 40,000/month", type: "Full Time" },
  { id: 3, title: "Front Office Executive", company: "Grand Vista Hotel", location: "Jaipur, Rajasthan", salary: "₹ 16,000 - 22,000/month", type: "Full Time" },
  { id: 4, title: "F&B Service Staff", company: "The Royal Hotel", location: "Bengaluru, Karnataka", salary: "₹ 12,000 - 18,000/month", type: "Full Time" }
];

const JOB_PLACE_PHOTOS = {
  1: { img: "assets/places/job_hospital_1.jpg", badge: "🏥 Verified Hospital Facility • Lucknow" },
  2: { img: "assets/places/job_hospital_2.jpg", badge: "🏥 Verified Multispecialty Hospital • Delhi" },
  3: { img: "assets/places/job_hotel_1.jpg", badge: "🏨 Verified Resort & Hotel • Jaipur" },
  4: { img: "assets/places/job_hotel_2.jpg", badge: "🏨 Verified Luxury Hotel • Bengaluru" }
};

function openJobModal(jobId) {
  window.location.href = `jobs.html?jobId=${jobId}`;
  return;
  const job = JOBS_DATA.find(j => j.id === Number(jobId)) || JOBS_DATA[0];
  SELECTED_JOB = job;

  const photoInfo = JOB_PLACE_PHOTOS[job.id] || JOB_PLACE_PHOTOS[1];
  const jobImg = document.getElementById('modal-job-img');
  const jobBadge = document.getElementById('modal-job-badge-text');
  if (jobImg) jobImg.src = photoInfo.img;
  if (jobBadge) jobBadge.textContent = photoInfo.badge;

  document.getElementById('modal-job-title').textContent = job.title;
  document.getElementById('modal-job-company').textContent = `${job.company} • ${job.location}`;
  document.getElementById('modal-job-salary').textContent = job.salary;
  document.getElementById('modal-job-loc').textContent = job.location;

  // Reset form / success state
  const form = document.getElementById('job-application-form');
  const successBox = document.getElementById('job-success-box');
  if (form) form.style.display = 'block';
  if (successBox) successBox.style.display = 'none';

  // Auto-fill student profile if authenticated
  const userStr = localStorage.getItem('SKILLORA_CURRENT_USER');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      const nameInput = document.getElementById('job-candidate-name');
      const phoneInput = document.getElementById('job-candidate-phone');
      const emailInput = document.getElementById('job-candidate-email');
      if (nameInput && u.name) nameInput.value = u.name;
      if (phoneInput && u.phone) phoneInput.value = u.phone;
      if (emailInput && u.email) emailInput.value = u.email;
    } catch (e) {}
  }

  openModal('job-modal');
}

async function submitJobApplication() {
  const nameInput = document.getElementById('job-candidate-name');
  const phoneInput = document.getElementById('job-candidate-phone');
  const emailInput = document.getElementById('job-candidate-email');
  const expInput = document.getElementById('job-candidate-exp');
  const submitBtn = document.getElementById('btn-submit-job');

  const jobTitle = SELECTED_JOB ? SELECTED_JOB.title : 'Healthcare / Hospitality Opening';
  const companyName = SELECTED_JOB ? SELECTED_JOB.company : 'Verified Employer';
  const jobId = SELECTED_JOB ? SELECTED_JOB.id : 1;

  // 1. Mandatory Student Authentication Check
  const userStr = localStorage.getItem('SKILLORA_CURRENT_USER');
  if (!userStr) {
    sessionStorage.setItem('SKILLORA_PENDING_APPLY', JSON.stringify({
      type: 'job',
      jobId: jobId,
      role: jobTitle,
      company: companyName
    }));
    alert(`To apply for "${jobTitle}" at ${companyName}, please Sign In or create your free Student Account.`);
    window.location.href = `auth.html?redirect=apply&type=job&title=${encodeURIComponent(jobTitle)}`;
    return;
  }

  const user = JSON.parse(userStr);
  const candidateName = (nameInput && nameInput.value.trim()) || user.name;
  const phone = (phoneInput && phoneInput.value.trim()) || user.phone;
  const email = (emailInput && emailInput.value.trim()) || user.email;
  const exp = expInput ? expInput.value.trim() : '';

  if (!candidateName || !phone) {
    showToast('Please enter your Full Name and Mobile Number.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Application...';
  }

  const refId = `SKL-JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const jobAppRecord = {
    refId,
    candidateName,
    phone,
    email: email || 'Not provided',
    role: jobTitle,
    company: companyName,
    location: SELECTED_JOB ? SELECTED_JOB.location : 'Pan-India',
    salary: SELECTED_JOB ? SELECTED_JOB.salary : '₹ 20,000 - 35,000/mo',
    exp: exp || 'Fresher',
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: new Date().toISOString(),
    status: 'Shortlisted for Interview',
    statusClass: 'status-shortlisted'
  };

  try {
    const allJobApps = JSON.parse(localStorage.getItem('SKILLORA_ALL_JOB_APPLICATIONS') || '[]');
    allJobApps.unshift(jobAppRecord);
    localStorage.setItem('SKILLORA_ALL_JOB_APPLICATIONS', JSON.stringify(allJobApps));

    const myJobs = JSON.parse(localStorage.getItem('SKILLORA_MY_JOBS') || '[]');
    myJobs.unshift(jobAppRecord);
    localStorage.setItem('SKILLORA_MY_JOBS', JSON.stringify(myJobs));

    const activityLog = JSON.parse(localStorage.getItem('SKILLORA_LIVE_ACTIVITY_LOG') || '[]');
    activityLog.unshift({
      id: refId,
      type: 'job',
      title: `${candidateName} applied for ${jobTitle}`,
      desc: `${companyName} • Contact: ${phone}`,
      time: 'Just now',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('SKILLORA_LIVE_ACTIVITY_LOG', JSON.stringify(activityLog.slice(0, 50)));
  } catch (storageErr) {
    console.warn('LocalStorage save error:', storageErr);
  }

  try {
    const payload = {
      job_id: jobId,
      candidate_name: candidateName,
      phone: phone,
      email: email || null,
      experience_years: exp || 'Fresher',
      stage: 'Applied'
    };

    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/job_applications`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Note: offline fallback for job application:', err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm & Apply Now';
    }

    const form = document.getElementById('job-application-form');
    const successBox = document.getElementById('job-success-box');
    if (form) form.style.display = 'none';
    if (successBox) {
      const refEl = document.getElementById('job-receipt-ref-id');
      const nameEl = document.getElementById('job-receipt-name');
      const roleEl = document.getElementById('job-receipt-role');
      const compEl = document.getElementById('job-receipt-company');
      if (refEl) refEl.textContent = refId;
      if (nameEl) nameEl.textContent = candidateName;
      if (roleEl) roleEl.textContent = jobTitle;
      if (compEl) compEl.textContent = companyName;
      successBox.style.display = 'block';
    }
    showToast(`Application for "${jobTitle}" submitted to HR! Ref: ${refId}`, true);
  }
}

/* ==========================================================================
   8B. LATEST UPDATES & OFFICIAL CIRCULARS MODAL
   ========================================================================== */
function openLatestNoticeModal(noticeId) {
  openNoticeModal(noticeId);
}

function openNoticeModal(noticeId) {
  const notice = NOTICES_DATA.find(n => n.id === Number(noticeId)) || NOTICES_DATA[0];
  const badgeEl = document.getElementById('notice-badge');
  const dateEl = document.getElementById('notice-date');
  const titleEl = document.getElementById('notice-title');
  const authEl = document.getElementById('notice-authority');
  const bodyEl = document.getElementById('notice-body-text');

  if (badgeEl) badgeEl.textContent = notice.badge;
  if (dateEl) dateEl.textContent = notice.date;
  if (titleEl) titleEl.textContent = notice.title;
  if (authEl) authEl.textContent = notice.authority;
  if (bodyEl) bodyEl.innerHTML = notice.content;

  const actionBtn = document.getElementById('notice-action-btn');
  if (actionBtn) {
    actionBtn.textContent = notice.actionText;
    actionBtn.onclick = () => {
      closeModal('notice-modal');
      if (notice.category) {
        filterByCategory(notice.category);
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
      } else if (notice.jobId) {
        openJobModal(notice.jobId);
      }
    };
  }

  openModal('notice-modal');
}

function openAllNoticesModal() {
  const badgeEl = document.getElementById('notice-badge');
  const dateEl = document.getElementById('notice-date');
  const titleEl = document.getElementById('notice-title');
  const authEl = document.getElementById('notice-authority');
  const bodyEl = document.getElementById('notice-body-text');

  if (badgeEl) badgeEl.textContent = "All Official Bulletins";
  if (dateEl) dateEl.textContent = "October 2026 Active Feed";
  if (titleEl) titleEl.textContent = "Verified Admissions & Employment Bulletins (2026)";
  if (authEl) authEl.textContent = "SkillOra Central Academic & Employment Registry";

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${NOTICES_DATA.map(n => `
          <div style="border:1px solid #E5F0F9;border-radius:8px;padding:12px;background:#F8FCFF;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:10.5px;font-weight:700;color:#087BFF;background:#EDF8FF;padding:2px 8px;border-radius:4px;">${n.badge}</span>
              <span style="font-size:11px;color:#728DA9;">${n.date}</span>
            </div>
            <h4 style="font-size:13px;color:#173C62;margin-bottom:4px;cursor:pointer;" onclick="openNoticeModal(${n.id})">${n.title}</h4>
            <div style="font-size:11px;color:#728DA9;margin-bottom:8px;">${n.authority}</div>
            <button class="btn btn-apply-filters" style="padding:4px 10px;font-size:11px;" onclick="openNoticeModal(${n.id})">Read Circular Details →</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  const actionBtn = document.getElementById('notice-action-btn');
  if (actionBtn) {
    actionBtn.textContent = "Explore All Courses";
    actionBtn.onclick = () => {
      closeModal('notice-modal');
      filterByCategory('All');
      document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    };
  }

  openModal('notice-modal');
}

function openPartnerModal(type = 'general') {
  openModal('partner-modal');
  const orgInput = document.getElementById('partner-org-name');
  if (!orgInput) return;
  if (type === 'employer') orgInput.placeholder = "Hospital / Hotel / Company Name *";
  else if (type === 'trainer') orgInput.placeholder = "Trainer Name / Academy *";
  else orgInput.placeholder = "College / Institute Name *";
}

function setPartnerTab(btn, type) {
  document.querySelectorAll('#partner-modal .ptab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const orgInput = document.getElementById('partner-org-name');
  if (type === 'employer') orgInput.placeholder = "Hospital / Hotel / Company Name *";
  else if (type === 'trainer') orgInput.placeholder = "Trainer Name / Academy *";
  else orgInput.placeholder = "College / Institute Name *";
}

function submitPartnerForm() {
  closeModal('partner-modal');
  const form = document.getElementById('partner-registration-form');
  if (form) form.reset();
  showToast('Partner registration received! Our institutional partnership manager will verify your credentials within 24 hours.', true);
}

/* ==========================================================================
   9. AUTHENTICATION & MODAL UTILS
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openStateModal() { openModal('state-modal'); }
function openVerifiedModal() { openModal('verified-modal'); }

const loginBtn = document.getElementById('login-btn');
const joinPartnerBtn = document.getElementById('join-partner-btn');

function checkAuthStatus() {
  const student = localStorage.getItem('SKILLORA_CURRENT_USER');
  const college = localStorage.getItem('SKILLORA_COLLEGE_USER');
  const employer = localStorage.getItem('SKILLORA_EMPLOYER_USER');

  if (loginBtn) {
    if (student) {
      try {
        const u = JSON.parse(student);
        loginBtn.textContent = `Student (${u.name ? u.name.split(' ')[0] : 'Profile'})`;
        loginBtn.href = 'dashboard.html';
        loginBtn.style.color = '#0FA66D';
        loginBtn.style.borderColor = '#0FA66D';
      } catch (e) {
        loginBtn.href = 'dashboard.html';
      }
    } else {
      loginBtn.textContent = 'Student Login / Sign Up';
      loginBtn.href = 'auth.html?role=student';
      loginBtn.style.color = '#087BFF';
      loginBtn.style.borderColor = '#087BFF';
    }
  }

  if (joinPartnerBtn) {
    joinPartnerBtn.onclick = function(e) {
      window.location.href = 'auth.html?role=institute';
    };
  }

  // Handle return redirect from authentication
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openApply') === 'true' && urlParams.get('collegeId')) {
      const colId = Number(urlParams.get('collegeId'));
      const crs = urlParams.get('courseName');
      setTimeout(() => {
        openCollegeModal(colId);
        if (crs) applyDirectCourse(decodeURIComponent(crs));
      }, 500);
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', checkAuthStatus);
checkAuthStatus();

function openInfoModal(type) {
  const title = document.getElementById('info-modal-title');
  const content = document.getElementById('info-modal-content');
  if (!title || !content) return;

  const infoData = {
    about: {
      title: "About SkillOra",
      html: `
        <p style="margin-bottom:10px;"><strong>SkillOra</strong> is India’s premier unified career readiness ecosystem, bringing high-quality vocational education, verified healthcare & hospitality colleges, and genuine employment opportunities into one trusted digital hub.</p>
        <p style="margin-bottom:10px;">Founded with the mission to bridge the skill gap between aspiring learners and top-tier healthcare facilities, luxury hotels, and modern tech enterprises, SkillOra empowers over 50,000 students annually across 23 states in India.</p>
        <p><strong>Headquarters:</strong> SkillOra Towers, BKC, Mumbai • Branch offices in New Delhi, Bengaluru, and Jaipur.</p>
      `
    },
    contact: {
      title: "Contact SkillOra Support",
      html: `
        <p style="margin-bottom:10px;">We are here to assist learners, institutes, and corporate employers 7 days a week.</p>
        <div style="background:#F3F9FE;padding:12px;border-radius:6px;font-size:12.5px;display:flex;flex-direction:column;gap:6px;">
          <div>📞 <strong>Student Helpline:</strong> 1800-890-SKILL (Toll Free, 9 AM - 8 PM IST)</div>
          <div>✉️ <strong>General Inquiries:</strong> support@skillora.in</div>
          <div>🏢 <strong>Institute Partnerships:</strong> admissions@skillora.in</div>
          <div>💬 <strong>WhatsApp Helpline:</strong> +91 98200 12345</div>
        </div>
      `
    },
    terms: {
      title: "Terms & Conditions",
      html: `
        <p style="margin-bottom:10px;">By using the SkillOra portal, you agree to comply with our institutional guidelines, fair recruitment policies, and transparent fee disclosures.</p>
        <ul style="font-size:12px;color:#728DA9;display:flex;flex-direction:column;gap:6px;padding-left:18px;">
          <li>All student applications are free from hidden admission processing charges.</li>
          <li>Institutes listed on SkillOra must maintain statutory accreditation and physical lab standards.</li>
          <li>Verified job opportunities are monitored to prevent fraudulent employment fees.</li>
        </ul>
      `
    },
    privacy: {
      title: "Privacy Policy",
      html: `
        <p style="margin-bottom:10px;">SkillOra is committed to protecting your personal data in accordance with the Digital Personal Data Protection Act (DPDP).</p>
        <p style="font-size:12px;color:#728DA9;">We never sell your contact details or resume data to third-party telemarketers. Information is shared strictly with the educational institutes or employers you explicitly apply to.</p>
      `
    },
    support: {
      title: "Student Support & Career Assistance",
      html: `
        <p style="margin-bottom:10px;">Our dedicated student welfare desk assists with:</p>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;">
          <div>✔ Education loan facilitation with 0% interest partner banks</div>
          <div>✔ Hostel accommodation and mess guidance in major study hubs</div>
          <div>✔ Scholarship guidance for reserved and merit-based aspirants</div>
          <div>✔ Post-course placement grievance escalation and redressal</div>
        </div>
      `
    }
  };

  const selected = infoData[type] || infoData.about;
  title.textContent = selected.title;
  content.innerHTML = selected.html;

  openModal('info-modal');
}

/* ==========================================================================
   10. LIVE WHATSAPP CHAT SIMULATOR
   ========================================================================== */
function openWhatsAppChat(initialMsg) {
  const drawer = document.getElementById('whatsapp-drawer');
  if (drawer) {
    drawer.classList.add('active');
    if (initialMsg) {
      setTimeout(() => sendQuickWAMsg(initialMsg), 300);
    }
  }
}

function closeWhatsAppDrawer() {
  const drawer = document.getElementById('whatsapp-drawer');
  if (drawer) drawer.classList.remove('active');
}

function sendWAMessage() {
  const input = document.getElementById('wa-chat-input');
  const text = input.value.trim();
  if (!text) return;

  appendWAMessage(text, 'outgoing');
  input.value = '';

  setTimeout(() => {
    let reply = "Thank you for reaching out! A verified SkillOra academic counselor is reviewing your profile. Would you like to check admission cutoffs or fee financing options?";
    if (text.toLowerCase().includes('nursing')) {
      reply = "Admissions for GNM and B.Sc Nursing are currently open across 122+ colleges in India. Would you like us to check fee structures for your city?";
    } else if (text.toLowerCase().includes('job')) {
      reply = "We have verified job openings across Lucknow, Delhi, and Bengaluru with starting salaries from ₹18,000 to ₹40,000/month. What role are you looking for?";
    }
    appendWAMessage(reply, 'incoming');
  }, 900);
}

function sendQuickWAMsg(text) {
  appendWAMessage(text, 'outgoing');
  setTimeout(() => {
    let reply = "Great! Connecting you with our Senior Counselor. Please share your WhatsApp number or city so we can send the prospectus directly.";
    appendWAMessage(reply, 'incoming');
  }, 800);
}

function appendWAMessage(text, type) {
  const body = document.getElementById('wa-chat-body');
  if (!body) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `wa-msg wa-${type}`;
  msgDiv.innerHTML = `
    <span>${text}</span>
    <div class="wa-time">Just now</div>
  `;
  body.appendChild(msgDiv);
  body.scrollTop = body.scrollHeight;
}

/* ==========================================================================
   11. TICKER & KEYBOARD LISTENERS
   ========================================================================== */
function initTickerAnimation() {
  const ticker = document.getElementById('ticker-content');
  if (!ticker) return;

  const updates = [
    "• New Nursing Batch Admissions Open across Maharashtra & Karnataka",
    "• Top 10 In-Demand Jobs in Healthcare Sector Announced",
    "• Hotel Management Diploma Courses Now Available in Online Mode",
    "• 488+ Verified Colleges Enrolling for 2026 Academic Batch",
    "• Direct Walk-In Interviews Scheduled in Bengaluru, Delhi & Mumbai"
  ];

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % updates.length;
    ticker.style.opacity = '0.4';
    setTimeout(() => {
      if (ticker.children[0]) ticker.children[0].textContent = updates[idx];
      ticker.style.opacity = '1';
    }, 250);
  }, 5000);
}

function showToast(message, isSuccess = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${isSuccess ? 'toast-success' : ''}`;
  toast.innerHTML = `
    <span>${isSuccess ? '✔' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initCarousel() {
  // Handled via page pagination
}

function initKeyboardListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => {
        closeModal(m.id);
      });
      closeWhatsAppDrawer();
    }
  });

  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileClose = document.getElementById('mobile-drawer-close');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (mobileBackdrop && mobileDrawer) {
    mobileBackdrop.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  if (mobileClose && mobileDrawer) {
    mobileClose.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
}
