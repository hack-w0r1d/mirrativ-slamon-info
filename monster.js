(function () {
  const params = new URLSearchParams(window.location.search);
  const monsterName = params.get('name') || '';
  const fromType = params.get('from');
  const fromName = params.get('fromName');

  const backLink = document.getElementById('backLink');
  if (backLink) {
    if (fromType === 'skill' && fromName) {
      backLink.href = `skill.html?name=${encodeURIComponent(fromName)}`;
      backLink.textContent = `← ${fromName}の詳細に戻る`;
    } else {
      backLink.href = monsterName
        ? `index.html?tab=monster&monster=${encodeURIComponent(monsterName)}`
        : 'index.html?tab=monster';
    }
  }

  const nameEl = document.getElementById('monsterName');
  const targetEl = document.getElementById('monsterTarget');
  const statValuesRow = document.getElementById('monsterStatValues');
  const groupsEl = document.getElementById('monsterSkillGroups');

  const monster = MONSTER_DATA.find((m) => m.name === monsterName);

  if (!monster) {
    nameEl.textContent = 'モンスターが見つかりません';
    return;
  }

  nameEl.textContent = monster.name;
  targetEl.textContent = monster.target || '';

  const stats = monster.stats || {};
  [stats.hp, stats.atk, stats.def, stats.spd].forEach((value) => {
    const td = document.createElement('td');
    td.textContent = value ?? '-';
    statValuesRow.appendChild(td);
  });

  const SKILL_TYPE_ORDER = ['物理攻撃', '魔法攻撃', 'バフスキル', 'デバフスキル', '状態異常', '回復・カウンター'];

  SKILL_TYPE_ORDER.forEach((type) => {
    const skills = SKILL_DATA.filter((skill) => monster.skills.includes(skill.name) && skill.type === type);
    if (skills.length === 0) return;

    const section = document.createElement('div');
    section.className = 'skill-group';
    section.dataset.skillType = type;

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'skill-group__header';
    header.textContent = type;
    header.setAttribute('aria-expanded', 'false');

    const list = document.createElement('ul');
    list.className = 'skill-detail-list skill-group__list';

    skills.forEach((skill) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `skill.html?name=${encodeURIComponent(skill.name)}&from=monster&fromName=${encodeURIComponent(monster.name)}`;
      a.textContent = skill.name;
      li.appendChild(a);
      list.appendChild(li);
    });

    header.addEventListener('click', () => {
      const isOpen = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', String(!isOpen));
      list.classList.toggle('is-open', !isOpen);
    });

    section.appendChild(header);
    section.appendChild(list);
    groupsEl.appendChild(section);
  });
})();
