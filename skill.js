(function () {
  const params = new URLSearchParams(window.location.search);
  const skillName = params.get('name') || '';

  const backLink = document.getElementById('backLink');
  if (backLink) {
    backLink.href = skillName
      ? `index.html?tab=skill&skill=${encodeURIComponent(skillName)}`
      : 'index.html?tab=skill';
  }

  const nameEl = document.getElementById('skillName');
  const descEl = document.getElementById('skillDescription');
  const typeEl = document.getElementById('skillType');
	const heartCostEl = document.getElementById('skillHeartCost');
  const listEl = document.getElementById('skillMonsterList');

  const skill = SKILL_DATA.find((s) => s.name === skillName);

  if (!skill) {
    nameEl.textContent = 'スキルが見つかりません';
    return;
  }

  nameEl.textContent = skill.name;
  descEl.textContent = skill.description;
  typeEl.textContent = skill.type || '';
  typeEl.dataset.skillType = skill.type || '';
	heartCostEl.textContent = typeof skill.heartCost === 'number'
  ? `❤️${skill.heartCost}`
  : '❤️-';

  const learners = MONSTER_DATA.filter((m) => m.skills.includes(skill.name));

  if (learners.length === 0) {
    const li = document.createElement('li');
    li.textContent = '習得可能なモンスターは未登録です';
    listEl.appendChild(li);
    return;
  }

  learners.forEach((m) => {
    const li = document.createElement('li');
    li.textContent = m.name;
    listEl.appendChild(li);
  });
})();
