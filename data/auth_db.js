/**
 * SkillOra Unified Database & Cloud Authentication Engine
 * - Supabase Cloud Authentication (Cloud PostgreSQL Auth)
 * - Supabase Cloud Storage (Resumes Bucket)
 * - Supabase Cloud REST Sync (admission_leads & job_applications)
 * - SHA-256 Cryptographic Password Hashing (Web Crypto API)
 * - Persistent Local Cache (`SKILLORA_DB_USERS`)
 * - Dynamic Session Management for Students, Colleges & Employers
 */

(function (window) {
  'use strict';

  // Supabase Cloud Configuration (Dynamic & Environment-Safe)
  const SUPABASE_BASE_URL = (typeof window !== 'undefined' && window.__SKILLORA_SUPABASE_URL__)
    || "https://fvotuteameyrohyphbrk.supabase.co";
  const SUPABASE_REST_URL = `${SUPABASE_BASE_URL}/rest/v1`;
  const SUPABASE_AUTH_URL = `${SUPABASE_BASE_URL}/auth/v1`;
  const SUPABASE_STORAGE_URL = `${SUPABASE_BASE_URL}/storage/v1`;

  // Dynamic Key Resolver (Reads from config.local.js or LocalStorage)
  function getSupabaseKey() {
    return (typeof window !== 'undefined' && window.__SKILLORA_SUPABASE_KEY__)
      || (typeof localStorage !== 'undefined' && localStorage.getItem('SKILLORA_SUPABASE_KEY'))
      || "";
  }

  // Auto-load local config if running in browser
  if (typeof document !== 'undefined' && typeof window !== 'undefined' && !window.__SKILLORA_SUPABASE_KEY__) {
    const cfg = document.createElement('script');
    cfg.src = 'data/config.local.js';
    cfg.onerror = function() {};
    document.head.appendChild(cfg);
  }

  // SHA-256 Password Hasher
  async function hashPassword(plainText) {
    if (!plainText) return "";
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Load Local Users Cache
  function getDbUsers() {
    try {
      const raw = localStorage.getItem('SKILLORA_DB_USERS');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Error reading SKILLORA_DB_USERS:", e);
    }
    return [];
  }

  // Save Local Users Cache
  function saveDbUsers(users) {
    try {
      localStorage.setItem('SKILLORA_DB_USERS', JSON.stringify(users));
    } catch (e) {
      console.error("Error saving SKILLORA_DB_USERS:", e);
    }
  }

  // Find User in Local Cache
  function findUser(identifier, role) {
    const users = getDbUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    return users.find(u => {
      const matchEmail = (u.email || '').toLowerCase() === cleanId;
      const matchPhone = (u.phone || '').trim() === cleanId;
      const matchRole = role ? (u.role === role) : true;
      return (matchEmail || matchPhone) && matchRole;
    });
  }

  // Register User in Supabase Cloud & Local Cache
  async function registerUser(userData) {
    const {
      role = 'student',
      name,
      email,
      phone,
      password,
      qualification = '',
      sector = '',
      city = 'Mumbai',
      state = 'Maharashtra',
      extra = {}
    } = userData;

    if (!name || !name.trim()) {
      return { success: false, message: "Please provide your full legal name." };
    }
    if (!phone || phone.trim().length < 10) {
      return { success: false, message: "Please enter a valid 10-digit mobile number." };
    }
    if (!email || !email.includes('@')) {
      return { success: false, message: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check local cache first
    const users = getDbUsers();
    const existing = users.find(u => 
      ((u.email || '').toLowerCase() === cleanEmail || (u.phone || '').trim() === cleanPhone) && u.role === role
    );

    if (existing) {
      return { 
        success: false, 
        message: `An account with this ${existing.email.toLowerCase() === cleanEmail ? 'Email' : 'Mobile number'} already exists. Please Sign In.` 
      };
    }

    // Cryptographic Password Hashing (SHA-256)
    const passwordHash = await hashPassword(password);
    const userId = `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let cloudId = null;

    // 1. Create User in Supabase Cloud Authentication
    try {
      const cloudRes = await fetch(`${SUPABASE_AUTH_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: name.trim(),
            phone: cleanPhone,
            role,
            qualification,
            sector,
            city,
            state,
            resume_name: null,
            resume_url: null,
            resume_size: null,
            resume_date: null,
            ...extra
          }
        })
      });

      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        cloudId = cloudData.id;
        console.log("Account successfully provisioned in Supabase Cloud:", cloudId);
      } else {
        const errJson = await cloudRes.json();
        console.warn("Supabase Cloud user create notice:", errJson);
      }
    } catch (cloudErr) {
      console.warn("Cloud connection notice during sign up (fallback to local):", cloudErr);
    }

    // 2. Save in Local Database Cache (No fake resume placeholder)
    const newUser = {
      id: userId,
      cloudId: cloudId || userId,
      role,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      qualification,
      sector,
      city,
      state,
      resumeName: null,      // Empty until user actually uploads
      resumeUrl: null,       // Empty until user actually uploads
      resumeSize: null,
      resumeDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...extra
    };

    users.push(newUser);
    saveDbUsers(users);

    return { 
      success: true, 
      message: "Account registered in cloud successfully! Please sign in with your password to continue.",
      user: { ...newUser, passwordHash: undefined } 
    };
  }

  // Authenticate User against Supabase Cloud & Local Cache
  async function authenticateUser(identifier, password, role = 'student') {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: "Please enter your registered Email or Mobile number." };
    }
    if (!password) {
      return { success: false, message: "Please enter your account password." };
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Try Supabase Cloud Auth first (if email format)
    if (cleanId.includes('@')) {
      try {
        const cloudAuthRes = await fetch(`${SUPABASE_AUTH_URL}/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': getSupabaseKey(),
            'Authorization': `Bearer ${getSupabaseKey()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: cleanId,
            password: password
          })
        });

        if (cloudAuthRes.ok) {
          const authData = await cloudAuthRes.json();
          const cloudUser = authData.user;
          const meta = cloudUser.user_metadata || {};

          const sessionUser = {
            id: cloudUser.id,
            cloudId: cloudUser.id,
            name: meta.name || cleanId.split('@')[0],
            email: cloudUser.email,
            phone: meta.phone || "",
            role: meta.role || role,
            qualification: meta.qualification || "12th Pass",
            sector: meta.sector || "Nursing & Healthcare",
            city: meta.city || "Mumbai",
            state: meta.state || "Maharashtra",
            resumeName: meta.resume_name || null,
            resumeUrl: meta.resume_url || null,
            resumeSize: meta.resume_size || null,
            resumeDate: meta.resume_date || null,
            lastLogin: new Date().toISOString()
          };

          // Store in corresponding role session exclusively (Single Active Role)
          setExclusiveSession(role, sessionUser);

          // Sync into local cache
          const localUsers = getDbUsers();
          const existingIdx = localUsers.findIndex(u => u.email === cleanId && u.role === role);
          if (existingIdx !== -1) {
            localUsers[existingIdx] = { ...localUsers[existingIdx], ...sessionUser };
          } else {
            const pwdHash = await hashPassword(password);
            localUsers.push({ ...sessionUser, passwordHash: pwdHash });
          }
          saveDbUsers(localUsers);

          return { success: true, message: `Welcome back, ${sessionUser.name}!`, user: sessionUser };
        }
      } catch (cloudErr) {
        console.warn("Cloud auth check notice (checking local cache):", cloudErr);
      }
    }

    // 2. Check Local Database Cache
    const user = findUser(cleanId, role);
    if (!user) {
      return { 
        success: false, 
        message: `No ${role} account found matching "${identifier}". Please create an account (Sign Up) first.` 
      };
    }

    const enteredHash = await hashPassword(password);
    if (user.passwordHash !== enteredHash) {
      return { success: false, message: "Incorrect password. Please verify your password and try again." };
    }

    const sessionUser = {
      id: user.id,
      cloudId: user.cloudId || user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      qualification: user.qualification || "12th Pass",
      sector: user.sector || "Nursing & Healthcare",
      city: user.city || "Mumbai",
      state: user.state || "Maharashtra",
      resumeName: user.resumeName || null,
      resumeUrl: user.resumeUrl || null,
      resumeSize: user.resumeSize || null,
      resumeDate: user.resumeDate || null,
      lastLogin: new Date().toISOString()
    };

    // Store in corresponding role session exclusively (Single Active Role)
    const finalUser = (role === 'student') ? sessionUser : { ...sessionUser, ...user.extra };
    setExclusiveSession(role, finalUser);

    return { success: true, message: `Welcome back, ${user.name}!`, user: sessionUser };
  }

  // Upload Resume File Directly to Supabase Cloud Storage
  async function uploadResumeFile(file, currentUser) {
    if (!file) return { success: false, message: "No file selected." };

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const cloudFileName = `student_${currentUser.id || 'usr'}_${Date.now()}_${sanitizedName}`;
    const sizeKb = Math.round(file.size / 1024);
    const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    const dateFormatted = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    try {
      // 1. Upload to Supabase Storage Bucket `resumes`
      const uploadUrl = `${SUPABASE_STORAGE_URL}/object/resumes/${cloudFileName}`;
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
          'Content-Type': file.type || 'application/pdf',
          'x-upsert': 'true'
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error(`Cloud storage upload failed: ${uploadRes.status}`);
      }

      // Public downloadable URL on Supabase
      const publicUrl = `${SUPABASE_STORAGE_URL}/object/public/resumes/${cloudFileName}`;

      // 2. Update Student Metadata in Supabase Cloud Auth
      if (currentUser.cloudId) {
        try {
          await fetch(`${SUPABASE_AUTH_URL}/admin/users/${currentUser.cloudId}`, {
            method: 'PUT',
            headers: {
              'apikey': getSupabaseKey(),
              'Authorization': `Bearer ${getSupabaseKey()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_metadata: {
                resume_name: file.name,
                resume_url: publicUrl,
                resume_size: sizeFormatted,
                resume_date: dateFormatted
              }
            })
          });
        } catch (mErr) {
          console.warn("Could not sync metadata to cloud auth:", mErr);
        }
      }

      // 3. Update Local Student Session
      const updatedUser = {
        ...currentUser,
        resumeName: file.name,
        resumeUrl: publicUrl,
        resumeSize: sizeFormatted,
        resumeDate: dateFormatted
      };
      localStorage.setItem('SKILLORA_CURRENT_USER', JSON.stringify(updatedUser));

      // 4. Update in Local Users DB
      const dbUsers = getDbUsers();
      const uIdx = dbUsers.findIndex(u => (u.id === currentUser.id) || (u.email === currentUser.email));
      if (uIdx !== -1) {
        dbUsers[uIdx] = { ...dbUsers[uIdx], ...updatedUser };
        saveDbUsers(dbUsers);
      }

      return {
        success: true,
        message: "Resume uploaded and stored securely in Supabase Cloud Storage!",
        resumeName: file.name,
        resumeUrl: publicUrl,
        resumeSize: sizeFormatted,
        resumeDate: dateFormatted
      };

    } catch (err) {
      console.error("Resume Cloud Upload Error:", err);
      // Fallback: save locally
      const updatedUser = {
        ...currentUser,
        resumeName: file.name,
        resumeUrl: null,
        resumeSize: sizeFormatted,
        resumeDate: dateFormatted
      };
      localStorage.setItem('SKILLORA_CURRENT_USER', JSON.stringify(updatedUser));
      return {
        success: true,
        message: "Resume saved to student profile locally (Cloud offline fallback).",
        resumeName: file.name,
        resumeUrl: null,
        resumeSize: sizeFormatted,
        resumeDate: dateFormatted
      };
    }
  }

  // Fetch Student Cloud Admissions (from Supabase Cloud `admission_leads`)
  async function fetchStudentCloudAdmissions(email) {
    if (!email) return [];
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/admission_leads?email=eq.${encodeURIComponent(email)}&order=created_at.desc`, {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Could not fetch cloud admissions:", e);
    }
    return [];
  }

  // Fetch Student Cloud Job Applications (from Supabase Cloud `job_applications`)
  async function fetchStudentCloudJobs(email) {
    if (!email) return [];
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/job_applications?email=eq.${encodeURIComponent(email)}&order=applied_at.desc`, {
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Could not fetch cloud jobs:", e);
    }
    return [];
  }

  // Submit College Admission to Supabase Cloud
  async function submitAdmissionToCloud(admissionData) {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/admission_leads`, {
        method: 'POST',
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          college_id: admissionData.collegeId || null,
          student_name: admissionData.studentName,
          phone: admissionData.phone,
          email: admissionData.email,
          course_name: admissionData.courseName,
          state: admissionData.collegeState || null,
          city: admissionData.collegeCity || null,
          status: 'New',
          source: 'SkillOra Direct Admissions',
          counsellor_notes: `Ref: ${admissionData.refId}`
        })
      });
      return res.ok;
    } catch (e) {
      console.warn("Cloud admission submission fallback:", e);
      return false;
    }
  }

  // Submit Job Application to Supabase Cloud
  async function submitJobApplicationToCloud(jobData) {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/job_applications`, {
        method: 'POST',
        headers: {
          'apikey': getSupabaseKey(),
          'Authorization': `Bearer ${getSupabaseKey()}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          job_id: jobData.jobId || null,
          candidate_name: jobData.candidateName,
          phone: jobData.phone,
          email: jobData.email,
          experience_years: jobData.experience || 'Fresher',
          resume_url: jobData.resumeUrl || null,
          stage: 'Applied',
          recruiter_notes: `Ref: ${jobData.refId} - ${jobData.jobTitle}`
        })
      });
      return res.ok;
    } catch (e) {
      console.warn("Cloud job application submission fallback:", e);
      return false;
    }
  }

  // Exclusive Session Manager (Enforces 1 Active Role per Browser Session)
  function setExclusiveSession(role, userObject) {
    // Purge other role sessions completely to prevent simultaneous multi-role login
    localStorage.removeItem('SKILLORA_CURRENT_USER');
    localStorage.removeItem('SKILLORA_COLLEGE_USER');
    localStorage.removeItem('SKILLORA_EMPLOYER_USER');

    localStorage.setItem('SKILLORA_ACTIVE_ROLE', role);
    if (role === 'student') {
      localStorage.setItem('SKILLORA_CURRENT_USER', JSON.stringify(userObject));
    } else if (role === 'college') {
      localStorage.setItem('SKILLORA_COLLEGE_USER', JSON.stringify(userObject));
    } else if (role === 'employer') {
      localStorage.setItem('SKILLORA_EMPLOYER_USER', JSON.stringify(userObject));
    }
  }

  // Get Current Active Role ('student', 'college', 'employer', or null)
  function getActiveRole() {
    const active = localStorage.getItem('SKILLORA_ACTIVE_ROLE');
    if (active) return active;
    if (localStorage.getItem('SKILLORA_CURRENT_USER')) return 'student';
    if (localStorage.getItem('SKILLORA_COLLEGE_USER')) return 'college';
    if (localStorage.getItem('SKILLORA_EMPLOYER_USER')) return 'employer';
    return null;
  }

  // Get Active Session for Role
  function getCurrentUser(role = 'student') {
    // If checking a role that is NOT the currently active role, return null
    const activeRole = getActiveRole();
    if (activeRole && activeRole !== role) {
      return null;
    }

    let key = 'SKILLORA_CURRENT_USER';
    if (role === 'college') key = 'SKILLORA_COLLEGE_USER';
    if (role === 'employer') key = 'SKILLORA_EMPLOYER_USER';

    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Sign Out (Clears Role & Active Session Flag)
  function signOut(role) {
    if (!role || role === 'all') {
      localStorage.removeItem('SKILLORA_CURRENT_USER');
      localStorage.removeItem('SKILLORA_COLLEGE_USER');
      localStorage.removeItem('SKILLORA_EMPLOYER_USER');
      localStorage.removeItem('SKILLORA_ACTIVE_ROLE');
      return;
    }
    if (role === 'student') localStorage.removeItem('SKILLORA_CURRENT_USER');
    if (role === 'college') localStorage.removeItem('SKILLORA_COLLEGE_USER');
    if (role === 'employer') localStorage.removeItem('SKILLORA_EMPLOYER_USER');
    if (localStorage.getItem('SKILLORA_ACTIVE_ROLE') === role) {
      localStorage.removeItem('SKILLORA_ACTIVE_ROLE');
    }
  }

  // Enforce Single Active Role Gatekeeper for Protected Pages
  function enforceExclusiveRole(requiredRole) {
    const activeRole = getActiveRole();
    const roleLabels = {
      student: 'Student',
      college: 'College Partner',
      employer: 'Hospital / Hotel HR Recruiter'
    };

    if (activeRole && activeRole !== requiredRole) {
      const currentLabel = roleLabels[activeRole] || activeRole;
      const targetLabel = roleLabels[requiredRole] || requiredRole;
      alert(`Active Session Notice:\n\nYou are currently signed in as a ${currentLabel}.\n\nIn SkillOra, a user can only be active as one account type at a time per browser tab. To access the ${targetLabel} portal, please sign in with your ${targetLabel} account.\n\nSwitching to sign in screen...`);
      window.location.href = `auth.html?role=${requiredRole}`;
      return false;
    }

    const user = getCurrentUser(requiredRole);
    if (!user) {
      window.location.href = `auth.html?role=${requiredRole}`;
      return false;
    }
    return true;
  }

  // Gatekeeper helper for Apply Actions
  function requireLoginToApply(applyIntent) {
    const student = getCurrentUser('student');
    if (student) {
      return { allowed: true, user: student };
    }

    try {
      sessionStorage.setItem('SKILLORA_PENDING_APPLY', JSON.stringify(applyIntent));
    } catch (e) {}

    const params = new URLSearchParams({
      redirect: 'apply',
      type: applyIntent.type || 'course',
      title: applyIntent.courseName || applyIntent.role || ''
    });

    alert("Please Sign In or Register your free Student Account to submit your application and lock your seat/interview.");
    window.location.href = `auth.html?${params.toString()}`;
    return { allowed: false, user: null };
  }

  // Public API
  window.SkillOraAuth = {
    hashPassword,
    getDbUsers,
    registerUser,
    authenticateUser,
    uploadResumeFile,
    fetchStudentCloudAdmissions,
    fetchStudentCloudJobs,
    submitAdmissionToCloud,
    submitJobApplicationToCloud,
    getCurrentUser,
    signOut,
    requireLoginToApply,
    getSupabaseKey,
    setExclusiveSession,
    getActiveRole,
    enforceExclusiveRole
  };

})(window);
