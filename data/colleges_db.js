/**
 * College directory loader.
 * Colleges now come ONLY from the database (verified partner institutions), not from a bundled file.
 * window.COLLEGES_READY resolves when window.COLLEGES_DB has been filled. Pages await it before rendering.
 */
window.COLLEGES_DB = [];
window.COLLEGES_READY = (async function () {
  try {
    if (window.SkillOraAuth && window.SkillOraAuth.loadPublicColleges) {
      window.COLLEGES_DB = await window.SkillOraAuth.loadPublicColleges();
    }
  } catch (e) { console.warn('Could not load colleges:', e); }
  return window.COLLEGES_DB;
})();
