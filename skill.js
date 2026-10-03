(function () {
  const params = new URLSearchParams(window.location.search);
  const skillName = params.get('name') || '';
  const fromType = params.get('from');
  const fromName = params.get('fromName');
  const fromId = params.get('fromId');

  const backLink = document.getElementById('backLink');
  if (backLink) {
    if (fromType === 'monster' && fromId) {
      const fromMonster = MONSTER_DATA.find((m) => m.id === fromId);
      backLink.href = `monster.html?id=${encodeURIComponent(fromId)}`;
      backLink.textContent = `← ${fromMonster ? fromMonster.name : 'モンスター'}の詳細に戻る`;
    } else if (fromType === 'skill' && fromName) {
      backLink.href = `skill.html?name=${encodeURIComponent(fromName)}`;
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

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderDescription(description, currentName) {
    const escaped = escapeHtml(description);
    return escaped.replace(/「([^」]+)」(に進化可能|から進化)/g, (match, name, suffix) => {
      const target = SKILL_DATA.find((s) => s.name === name);
      if (!target) return match;
      const href = `skill.html?name=${encodeURIComponent(name)}&from=skill&fromName=${encodeURIComponent(currentName)}`;
      return `「<a href="${href}">${name}</a>」${suffix}`;
    });
  }

  nameEl.textContent = skill.name;
  descEl.innerHTML = renderDescription(skill.description, skill.name);
  typeEl.textContent = skill.type || '';
  typeEl.dataset.skillType = skill.type || '';
	heartCostEl.textContent = typeof skill.heartCost === 'number'
  ? `❤️${skill.heartCost}`
  : '❤️-';

  const learners = MONSTER_DATA.filter((m) => m.skills.includes(skill.name));

  if (learners.length === 0) {
    const p = document.createElement('p');
    p.className = 'monster-card-grid__empty';
    p.textContent = '習得可能なモンスターは未登録です';
    listEl.appendChild(p);
    return;
  }

  learners.forEach((m) => {
    const href = `monster.html?id=${m.id}&from=skill&fromName=${encodeURIComponent(skill.name)}`;
    listEl.appendChild(createMonsterCard(m, href));
  });
})();
