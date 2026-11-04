(function () {
  const params = new URLSearchParams(window.location.search);
  const monsterId = params.get('id') || '';
  const fromType = params.get('from');
  const fromName = params.get('fromName');

  const backLink = document.getElementById('backLink');
  if (backLink) {
    if (fromType === 'skill' && fromName) {
      backLink.href = `skill.html?name=${encodeURIComponent(fromName)}`;
      backLink.textContent = `← ${fromName}の詳細に戻る`;
    } else if (fromType === 'status') {
      backLink.href = 'index.html?tab=monster-status';
      backLink.textContent = '← モンスターのステータス一覧に戻る';
    } else {
      backLink.href = monsterId
        ? `index.html?tab=monster&monster=${encodeURIComponent(monsterId)}`
        : 'index.html?tab=monster';
    }
  }

  const nameEl = document.getElementById('monsterName');
  const targetEl = document.getElementById('monsterTarget');
  const statValuesRow = document.getElementById('monsterStatValues');
  const groupsEl = document.getElementById('monsterSkillGroups');

  const monster = MONSTER_DATA.find((m) => m.id === monsterId);

  if (!monster) {
    nameEl.textContent = 'モンスターが見つかりません';
    return;
  }

  nameEl.textContent = monster.name;
  targetEl.textContent = monster.target || '';
  document.getElementById('monsterImage').appendChild(createMonsterImage(monster));

  const stats = monster.stats || {};
  // 同名のトレーナーでステータスが+1以上強化されるものは、見出しに強化されやすいことを示す上昇矢印をつける
  // 矢印の数は上昇値に合わせる(+1:1個、+2:2個、+3以上:3個)
  const trainer = typeof TRAINER_DATA === 'undefined' ? null : TRAINER_DATA.find((t) => t.name === monster.name);
  const growth = trainer ? trainer.growth : {};
  const headers = document.querySelectorAll('.monster-detail-stats thead th');

  ['hp', 'atk', 'def', 'spd'].forEach((key, index) => {
    const td = document.createElement('td');
    td.textContent = stats[key] ?? '-';
    statValuesRow.appendChild(td);

    const count = Math.min(growth[key] || 0, 3);
    const header = headers[index];
    if (count < 1 || !header) return;

    // 矢印は同じ縦軸に重ね、CSS側で時間差をつけて上下にずらして流す(--i: 何番目か)
    const up = document.createElement('span');
    up.className = 'stat-up';
    up.dataset.count = count; // 矢印の数。CSS側で個数ごとの色を切り替える
    up.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      const arrow = document.createElement('span');
      arrow.className = 'stat-up__arrow';
      arrow.style.setProperty('--i', i);
      up.appendChild(arrow);
    }
    header.appendChild(up);
    header.title = 'トレーニングで強化されやすい';
  });

  const SKILL_TYPE_ORDER = ['物理攻撃', '魔法攻撃', 'バフスキル', 'デバフスキル', '状態異常', '回復・カウンター'];

  // スキル詳細ページから戻ってきたときも開いたままにするため、開いている種類をモンスターごとに保存する
  const OPEN_STORAGE_KEY = `monsterSkillGroups:open:${monster.id}`;

  function loadOpenTypes() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(OPEN_STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  }

  function saveOpenTypes(types) {
    try {
      sessionStorage.setItem(OPEN_STORAGE_KEY, JSON.stringify(types));
    } catch (e) {
      // 保存できない環境ではページを開いている間のみ有効
    }
  }

  const openTypes = new Set(loadOpenTypes());

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
      a.href = `skill.html?name=${encodeURIComponent(skill.name)}&from=monster&fromId=${encodeURIComponent(monster.id)}`;
      a.textContent = skill.name;
      li.appendChild(a);
      list.appendChild(li);
    });

    if (openTypes.has(type)) {
      header.setAttribute('aria-expanded', 'true');
      list.classList.add('is-open');
    }

    header.addEventListener('click', () => {
      const isOpen = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', String(!isOpen));
      list.classList.toggle('is-open', !isOpen);
      if (isOpen) {
        openTypes.delete(type);
      } else {
        openTypes.add(type);
      }
      saveOpenTypes([...openTypes]);
    });

    section.appendChild(header);
    section.appendChild(list);
    groupsEl.appendChild(section);
  });
})();
