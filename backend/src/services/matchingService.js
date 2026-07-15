/**
 * Resume Matching Engine
 * Compares job text against user's skills_keywords and computes a score.
 */
function calculateMatchScore(skillsText, descriptionText, titleText, userSkillsString) {
  if (!userSkillsString) {
    return { score: 0, matched: [], missing: [] };
  }

  // Split and normalize user skills (e.g., "React, Node.js, MySQL" => ["react", "node.js", "mysql"])
  const userSkills = userSkillsString
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);

  if (userSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  // Normalize search text (join title, skills field, and description)
  const searchText = `${titleText || ''} ${skillsText || ''} ${descriptionText || ''}`.toLowerCase();

  const matched = [];
  const missing = [];

  userSkills.forEach(skill => {
    // Escape regex characters (e.g. node.js, c++)
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // We check if the skill exists as a word boundaries boundary or direct matching
    // (We search for it as substring or with word boundaries, e.g. "sql" in "mysql" or standalone)
    const regex = new RegExp(`\\b${escapedSkill}\\b|${escapedSkill}`, 'i');
    
    if (regex.test(searchText)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const score = Math.round((matched.length / userSkills.length) * 100);

  return {
    score,
    matched, // lowercase matched skills
    missing  // lowercase missing skills
  };
}

module.exports = {
  calculateMatchScore
};
