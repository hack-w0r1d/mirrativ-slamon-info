(function () {
  const params = new URLSearchParams(window.location.search);
  const skillName = params.get('name') || '';
  const fromType = params.get('from');
  const fromName = params.get('fromName');

  const backLink = document.getElementById('backLink');
  if (backLink) {
    if (fromType === 'monster' && fromName) {
      backLink.href = `monster.html?name=${encodeURIComponent(fromName)}`;
      backLink.textContent = `← ${fromName}の詳細に戻る`;
    } else {
      backLink.href = skillName
        ? `index.html?tab=skill&skill=${encodeURIComponent(skillName)}`
        : 'index.html?tab=skill';
    }
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
    const a = document.createElement('a');
    a.href = `monster.html?name=${encodeURIComponent(m.name)}&from=skill&fromName=${encodeURIComponent(skill.name)}`;
    a.textContent = m.name;
    li.appendChild(a);
    listEl.appendChild(li);
  });
})();
