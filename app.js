/**
 * SkillOra - High-Performance Education Intelligence & Instant Search Engine
 * Powered by in-memory 854+ College Database (0ms Latency)
 */

// Application State
let ALL_COLLEGES = [];
let CURRENT_FILTERED = [];
let CURRENT_PAGE = 1;
const ITEMS_PER_PAGE = 8;
let CURRENT_CATEGORY = "All";
let SELECTED_COLLEGE = null;

// Thumbnail mappings for each category
const CATEGORY_THUMBS = {
  "Nursing & Healthcare": "assets/course_nurse.png",
  "Hospitality": "assets/course_hotel.png",
  "IT & Coding": "assets/course_dev.png",
  "Designing": "assets/course_design.png",
  "Sales & Marketing": "assets/course_dev.png",
  "Language & Grooming": "assets/course_design.png",
  "Material Science": "assets/course_hotel.png"
};

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

    const matches = [];

    // Search across all colleges, cities, states, and courses
    for (let i = 0; i < ALL_COLLEGES.length; i++) {
      const c = ALL_COLLEGES[i];
      const nameMatch = c.name.toLowerCase().includes(val);
      const cityMatch = c.city.toLowerCase().includes(val);
      const stateMatch = c.state.toLowerCase().includes(val);
      const catMatch = c.category.toLowerCase().includes(val);

      if (nameMatch || cityMatch || stateMatch || catMatch) {
        matches.push({
          title: c.name,
          sub: `${c.category} • ${c.city}, ${c.state}`,
          tag: c.approval || 'Verified',
          id: c.id
        });
      }

      // Check inner courses
      for (let j = 0; j < c.courses.length; j++) {
        const course = c.courses[j];
        if (course.name.toLowerCase().includes(val)) {
          matches.push({
            title: course.name,
            sub: `${c.cleanName} • Fee: ${course.feeDisplay}`,
            tag: 'Course',
            id: c.id
          });
          break;
        }
      }

      if (matches.length >= 8) break; // Keep suggestions ultra-fast
    }

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="autocomplete-item">
          <div>
            <div class="ac-title">No direct matches for "${val}"</div>
            <div style="font-size:11px;color:#728DA9;">Press Enter to search entire 850+ directory</div>
          </div>
          <span class="ac-tag">Directory</span>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = matches.map(m => `
      <div class="autocomplete-item" onclick="handleSearchSelect(${m.id})">
        <div>
          <div class="ac-title">${m.title}</div>
          <div style="font-size:11px;color:#728DA9;">${m.sub}</div>
        </div>
        <span class="ac-tag">${m.tag}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      filterByCategory('All');
    });
  }

  const executeSearch = () => {
    const term = searchInput.value.trim();
    if (term) {
      dropdown.style.display = 'none';
      runGlobalSearch(term);
    }
  };

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
  openCollegeModal(collegeId);
}

function runGlobalSearch(term) {
  const lower = term.toLowerCase();
  CURRENT_FILTERED = ALL_COLLEGES.filter(c => {
    const nameMatch = c.name.toLowerCase().includes(lower);
    const cityMatch = c.city.toLowerCase().includes(lower);
    const stateMatch = c.state.toLowerCase().includes(lower);
    const catMatch = c.category.toLowerCase().includes(lower);
    const courseMatch = c.courses.some(crs => crs.name.toLowerCase().includes(lower));
    return nameMatch || cityMatch || stateMatch || catMatch || courseMatch;
  });

  CURRENT_PAGE = 1;
  renderCatalogPage();
  showToast(`Found ${CURRENT_FILTERED.length} colleges matching "${term}"`);
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
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
      if (category === 'IT & Coding') return c.category.includes('IT & Coding');
      if (category === 'Designing') return c.category.includes('Designing');
      if (category === 'Sales & Marketing') return c.category.includes('Sales');
      if (category === 'Language') return c.category.includes('Language');
      if (category === 'Material Science') return c.category.includes('Material');
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
    const thumb = CATEGORY_THUMBS[c.category] || "assets/course_nurse.png";
    const primaryCourse = c.courses[0] || { name: c.category, duration: "1 Year", feeDisplay: c.minFeeDisplay, mode: "Both" };

    return `
      <article class="course-card" onclick="openCollegeModal(${c.id})" style="cursor:pointer;">
        <div class="course-img-wrap">
          <img src="${thumb}" alt="${c.name}" class="course-thumb" loading="lazy">
          <span class="verified-inst-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${c.approval || 'Verified Institute'}</span>
          </span>
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
          
          <button class="btn btn-view-course" onclick="event.stopPropagation(); openCollegeModal(${c.id})">
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
  const college = ALL_COLLEGES.find(c => c.id === Number(collegeId));
  if (!college) return;

  SELECTED_COLLEGE = college;

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
    tableBody.innerHTML = college.courses.map(crs => `
      <tr>
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

  // Tab 3: Placements
  const highestPkg = `₹ ${(4.5 + (college.id % 4) * 1.5).toFixed(1)} LPA`;
  const avgPkg = `₹ ${(2.8 + (college.id % 3) * 0.6).toFixed(1)} LPA`;
  document.getElementById('modal-highest-pkg').textContent = highestPkg;
  document.getElementById('modal-avg-pkg').textContent = avgPkg;

  const recList = document.getElementById('modal-recruiters-list');
  if (recList) {
    const recruiters = college.recruiters || ["Apollo", "Fortis", "Taj Group", "TCS", "Infosys"];
    recList.innerHTML = recruiters.map(r => `<span class="recruiter-tag">🏢 ${r}</span>`).join('');
  }

  // Tab 4: Campus & Hostel
  document.getElementById('modal-hostel-info').textContent = `Living Accommodation: ${college.hostel || 'Hostel facility available on campus with Wi-Fi, 24/7 security, and hygienic food.'}`;

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

  btn.classList.add('active');
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('active');
}

function applyDirectCourse(courseName) {
  showToast(`Selected course: ${courseName}. Fill out the quick admission form below!`);
  const form = document.querySelector('#course-modal form');
  if (form) form.scrollIntoView({ behavior: 'smooth' });
}

function submitEnrollment() {
  closeModal('course-modal');
  const collegeName = SELECTED_COLLEGE ? SELECTED_COLLEGE.cleanName : "the institute";
  showToast(`Application successfully sent to ${collegeName}! An admission officer will contact you within 2 hours.`, true);
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

function openJobModal(jobId) {
  const job = JOBS_DATA.find(j => j.id === Number(jobId));
  if (!job) return;

  document.getElementById('modal-job-title').textContent = job.title;
  document.getElementById('modal-job-company').textContent = `${job.company} • ${job.location}`;
  document.getElementById('modal-job-salary').textContent = job.salary;
  document.getElementById('modal-job-loc').textContent = job.location;

  openModal('job-modal');
}

function submitJobApplication() {
  closeModal('job-modal');
  showToast('Job application and resume submitted to employer! We sent a confirmation SMS & Email.', true);
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
if (loginBtn) loginBtn.addEventListener('click', () => openModal('login-modal'));

const joinPartnerBtn = document.getElementById('join-partner-btn');
if (joinPartnerBtn) joinPartnerBtn.addEventListener('click', () => openPartnerModal('general'));

function setLoginTab(btn, type) {
  document.querySelectorAll('#login-modal .ptab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function submitLogin() {
  closeModal('login-modal');
  showToast('Signed in successfully! Welcome to SkillOra Dashboard.', true);
  if (loginBtn) {
    loginBtn.textContent = 'My Account';
    loginBtn.style.borderColor = '#0FA66D';
    loginBtn.style.color = '#0FA66D';
  }
}

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
    "• 850+ Verified Colleges Enrolling for 2026 Academic Batch",
    "• 120+ Walk-In Interviews Scheduled in Bengaluru, Delhi & Mumbai"
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
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const menu = document.querySelector('.nav-menu');
      if (menu) {
        const isVisible = menu.style.display === 'flex';
        menu.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
          menu.style.flexDirection = 'column';
          menu.style.position = 'absolute';
          menu.style.top = '70px';
          menu.style.left = '0';
          menu.style.width = '100%';
          menu.style.background = '#FFFFFF';
          menu.style.padding = '20px';
          menu.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }
      }
    });
  }
}
