const EVENT_STAT_INFO = [
  { key: 'hp', text: '🩷HP', emoji: '🩷' },
  { key: 'atk', text: '🗡️攻撃', emoji: '🗡️' },
  { key: 'def', text: '🛡守備', emoji: '🛡' },
  { key: 'spd', text: '💨素早さ', emoji: '💨' },
];

function getShownEventStats(monsterName) {
  if (typeof TRAINER_DATA === 'undefined') return EVENT_STAT_INFO;
  const trainer = TRAINER_DATA.find((t) => t.name === monsterName);
  const growth = trainer ? trainer.growth : null;
  return growth ? EVENT_STAT_INFO.filter((s) => growth[s.key] !== 0) : EVENT_STAT_INFO;
}

function hideDiceTooltip() {
  const existing = document.querySelector('.dice-tap__tooltip');
  if (existing) existing.remove();
}

function showDiceTooltip(target) {
  hideDiceTooltip();
  const monsterName = document.getElementById('eventTrainingTargetMonster')?.value;
  const tooltip = document.createElement('span');
  tooltip.className = 'dice-tap__tooltip';
  tooltip.textContent = getShownEventStats(monsterName).map((s) => s.emoji).join('or');
  target.appendChild(tooltip);

  const margin = 8;
  const rect = tooltip.getBoundingClientRect();
  let shift = 0;
  if (rect.left < margin) {
    shift = margin - rect.left;
  } else if (rect.right > window.innerWidth - margin) {
    shift = window.innerWidth - margin - rect.right;
  }
  if (shift !== 0) {
    tooltip.style.transform = `translateX(calc(-50% + ${shift}px))`;
  }
}

(function () {
  const groupsEl = document.getElementById('skillGroups');
  if (!groupsEl || typeof SKILL_DATA === 'undefined') return;

  const SKILL_TYPE_ORDER = ['物理攻撃', '魔法攻撃', 'バフスキル', 'デバフスキル', '状態異常', '回復・カウンター'];

  SKILL_TYPE_ORDER.forEach((type) => {
    const skills = SKILL_DATA.filter((skill) => skill.type === type);
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
      a.href = `skill.html?name=${encodeURIComponent(skill.name)}`;
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

(function () {
  const monsterListEl = document.getElementById('monsterDetailList');
  if (!monsterListEl || typeof MONSTER_DATA === 'undefined') return;

  MONSTER_DATA.forEach((monster) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `monster.html?name=${encodeURIComponent(monster.name)}`;
    a.textContent = monster.name;
    li.appendChild(a);
    monsterListEl.appendChild(li);
  });
})();

(function () {
  const containers = ['eventChoiceList', 'eventCharacterList']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (containers.length === 0) return;

  containers.forEach((container) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const targets = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.includes('🔀')) targets.push(node);
    }
    targets.forEach((textNode) => {
      const frag = document.createDocumentFragment();
      textNode.textContent.split('🔀').forEach((part, i) => {
        if (i > 0) {
          const dice = document.createElement('span');
          dice.className = 'dice-tap';
          dice.textContent = '🔀';
          frag.appendChild(dice);
        }
        if (part) frag.appendChild(document.createTextNode(part));
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  });
})();

(function () {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.dice-tap');
    if (!target) {
      hideDiceTooltip();
      return;
    }
    const alreadyOpen = target.querySelector('.dice-tap__tooltip');
    hideDiceTooltip();
    if (!alreadyOpen) showDiceTooltip(target);
  });
})();

(function () {
  const searchScope = document.getElementById('tab-panel-event');
  const searchInput = document.getElementById('searchInput');
  const searchCount = document.getElementById('searchCount');
  const prevBtn = document.getElementById('searchPrev');
  const nextBtn = document.getElementById('searchNext');
  const searchBar = document.getElementById('searchBar');
  const footer = document.querySelector('footer.footer');

  const mainTabButtons = document.querySelectorAll('.tabs__nav--main .tabs__btn');
  const mainTabPanels = document.querySelectorAll('.tabs__panel:not(.tabs__panel--sub)');
  const subTabNavs = document.querySelectorAll('.tabs__nav--sub');

  const originalHTML = searchScope.innerHTML;
  let matches = [];
  let currentIndex = -1;
  let isFooterVisible = false;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function clearHighlights() {
    searchScope.innerHTML = originalHTML;
    matches = [];
    currentIndex = -1;
  }

  function highlight(query) {
    clearHighlights();
    if (!query) {
      updateCount();
      return;
    }

    const regex = new RegExp(escapeRegExp(query), 'gu');
    const walker = document.createTreeWalker(searchScope, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      regex.lastIndex = 0;
      let match;
      let lastIndex = 0;
      let found = false;
      const frag = document.createDocumentFragment();

      while ((match = regex.exec(text))) {
        found = true;
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = match[0];
        frag.appendChild(mark);
        matches.push(mark);
        lastIndex = match.index + match[0].length;
        if (match.index === regex.lastIndex) {
          regex.lastIndex += 1;
        }
      }

      if (found) {
        if (lastIndex < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });

    if (matches.length > 0) {
      currentIndex = 0;
      setActive();
    }
    updateCount();
  }

  function setActive() {
    matches.forEach((m) => m.classList.remove('search-highlight--active'));
    const current = matches[currentIndex];
    if (current) {
      current.classList.add('search-highlight--active');
      current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function updateCount() {
    searchCount.textContent = matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0';
    prevBtn.disabled = matches.length === 0;
    nextBtn.disabled = matches.length === 0;
  }

  function goNext() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex + 1) % matches.length;
    setActive();
    updateCount();
  }

  function goPrev() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    setActive();
    updateCount();
  }

  searchInput.addEventListener('input', (e) => {
    highlight(e.target.value.trim());
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goPrev();
      } else {
        goNext();
      }
    }
  });

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  function updateSearchBarPosition() {
    if (!window.visualViewport) return;
    const vv = window.visualViewport;
    const keyboardOffset = window.innerHeight - vv.height - vv.offsetTop;
    const offset = keyboardOffset > 0 ? keyboardOffset + 16 : 16;
    document.documentElement.style.setProperty('--search-bar-offset', `${offset}px`);
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateSearchBarPosition);
    window.visualViewport.addEventListener('scroll', updateSearchBarPosition);
  }

  searchInput.addEventListener('focus', updateSearchBarPosition);
  searchInput.addEventListener('blur', () => {
    document.documentElement.style.setProperty('--search-bar-offset', '16px');
  });

  function updateSearchBarVisibility() {
    const isEventVisible = !document.getElementById('tab-panel-event').hidden
      && !document.getElementById('tab-panel-training-main').hidden;
    searchBar.classList.toggle('search-bar--hidden', !isEventVisible || isFooterVisible);
  }

  function switchMainTab(tabName) {
    mainTabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    mainTabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== tabName;
    });
    updateSearchBarVisibility();
  }

  function switchSubTab(navEl, subtabName) {
    const container = navEl.closest('.tabs__panel');
    navEl.querySelectorAll('.tabs__btn').forEach((btn) => {
      const isActive = btn.dataset.subtab === subtabName;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    container.querySelectorAll('.tabs__panel--sub').forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== subtabName;
    });
    updateSearchBarVisibility();
  }

  mainTabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchMainTab(btn.dataset.tab);
      history.replaceState(null, '', window.location.pathname);
    });
  });

  subTabNavs.forEach((navEl) => {
    navEl.querySelectorAll('.tabs__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchSubTab(navEl, btn.dataset.subtab);
        history.replaceState(null, '', window.location.pathname);
      });
    });
  });

  if (footer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isFooterVisible = entry.isIntersecting;
          updateSearchBarVisibility();
        });
      },
      { threshold: 0 }
    );
    observer.observe(footer);
  }

  const TRAINING_SUBTABS = ['event', 'training', 'item', 'exam', 'skill', 'blessing'];
  const MONSTER_SUBTABS = ['monster', 'rank'];

  const deepLinkParams = new URLSearchParams(window.location.search);
  const deepLinkTab = deepLinkParams.get('tab');
  const deepLinkSkill = deepLinkParams.get('skill');
  const deepLinkMonster = deepLinkParams.get('monster');

  if (deepLinkTab) {
    if (TRAINING_SUBTABS.includes(deepLinkTab)) {
      switchMainTab('training-main');
      const nav = document.querySelector('#tab-panel-training-main .tabs__nav--sub');
      switchSubTab(nav, deepLinkTab);
    } else if (MONSTER_SUBTABS.includes(deepLinkTab)) {
      switchMainTab('monster-main');
      const nav = document.querySelector('#tab-panel-monster-main .tabs__nav--sub');
      switchSubTab(nav, deepLinkTab);
    } else {
      switchMainTab(deepLinkTab);
    }
  }

  if (deepLinkSkill) {
    const skillLinks = document.querySelectorAll('#tab-panel-skill a[href^="skill.html?name="]');
    skillLinks.forEach((link) => {
      const linkParams = new URLSearchParams(link.getAttribute('href').split('?')[1]);
      if (linkParams.get('name') === deepLinkSkill) {
        link.scrollIntoView({ block: 'center' });
      }
    });
  }

  if (deepLinkMonster) {
    const monsterLinks = document.querySelectorAll('#tab-panel-monster a[href^="monster.html?name="]');
    monsterLinks.forEach((link) => {
      const linkParams = new URLSearchParams(link.getAttribute('href').split('?')[1]);
      if (linkParams.get('name') === deepLinkMonster) {
        link.scrollIntoView({ block: 'center' });
      }
    });
  }
})();

(function () {
  const trainingTargetMonsterSelects = [
    document.getElementById('trainingTargetMonster'),
    document.getElementById('eventTrainingTargetMonster'),
  ].filter(Boolean);
  if (trainingTargetMonsterSelects.length === 0 || typeof MONSTER_DATA === 'undefined') return;

  const statEmojiEl = document.getElementById('eventStatEmojiLine');
  const statRandomEl = document.getElementById('eventStatRandomLine');
  const statUnchangedEl = document.getElementById('eventStatUnchangedLine');
  const TRAINING_TARGET_MONSTER_STORAGE_KEY = 'trainingTargetMonster';

  trainingTargetMonsterSelects.forEach((select) => {
    MONSTER_DATA.forEach((monster) => {
      const opt = document.createElement('option');
      opt.value = monster.name;
      opt.textContent = monster.name;
      select.appendChild(opt);
    });
  });

  function updateLegend(value) {
    if (!statEmojiEl || !statRandomEl) return;
    const shown = getShownEventStats(value);
    const unchanged = EVENT_STAT_INFO.filter((s) => !shown.includes(s));
    statEmojiEl.textContent = shown.map((s) => s.text).join('');
    statRandomEl.textContent = `🔀上記${shown.length}つのうちランダムに1つ`;
    if (statUnchangedEl) {
      statUnchangedEl.innerHTML = unchanged.length > 0
      ? `<br>(${unchanged.map((s) => s.text).join('と')}は変化しません)`
      : '';
    }
  }

  function applyTrainingTargetMonster(value, save) {
    trainingTargetMonsterSelects.forEach((select) => {
      if (select.value !== value) select.value = value;
    });
    updateLegend(value);
    hideDiceTooltip();
    if (save) {
      localStorage.setItem(TRAINING_TARGET_MONSTER_STORAGE_KEY, value);
    }
  }

  const savedTrainingTargetMonster = localStorage.getItem(TRAINING_TARGET_MONSTER_STORAGE_KEY);
  applyTrainingTargetMonster(savedTrainingTargetMonster || trainingTargetMonsterSelects[0].value, false);

  trainingTargetMonsterSelects.forEach((select) => {
    select.addEventListener('change', () => applyTrainingTargetMonster(select.value, true));
  });
})();

(function () {
  const examType = document.getElementById('examType');
  const trainingTargetMonster = document.getElementById('trainingTargetMonster');
  const calcBtn = document.getElementById('examCalcBtn');
  if (!examType || !trainingTargetMonster || !calcBtn) return;

  const blessingIds = ['blessingHp', 'blessingAtk', 'blessingDef', 'blessingSpd'];
  const rewardLv = document.getElementById('rewardLv');
  const resultBox = document.getElementById('examCalcResult');
  const tableBody = document.getElementById('examCalcTableBody');
  const statLabels = ['HP', '攻撃', '守備', '素早さ'];
  const statKeys = ['hp', 'atk', 'def', 'spd'];

  const examConfig = {
    1: { base: 5, multiplier: 1 },
    2: { base: 7, multiplier: 2 },
    3: { base: 15, multiplier: 3 },
  };

  function fillLevelOptions(select, max) {
    for (let i = 1; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i === max ? 'Lv.MAX' : `Lv.${i}`;
      select.appendChild(opt);
    }
  }

  function fillRewardOptions(select, max) {
    for (let i = 0; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }
  }

  blessingIds.forEach((id) => fillLevelOptions(document.getElementById(id), 18));
  fillRewardOptions(rewardLv, 30);

  const BLESSING_STORAGE_PREFIX = 'examCalc:';

  blessingIds.forEach((id) => {
    const select = document.getElementById(id);
    const saved = localStorage.getItem(BLESSING_STORAGE_PREFIX + id);
    if (saved !== null) {
      select.value = saved;
    }
    select.addEventListener('change', () => {
      localStorage.setItem(BLESSING_STORAGE_PREFIX + id, select.value);
    });
  });

  function getTrainerGrowth() {
    if (typeof TRAINER_DATA === 'undefined') return null;
    const trainer = TRAINER_DATA.find((t) => t.name === trainingTargetMonster.value);
    return trainer ? trainer.growth : null;
  }

  function calculate() {
    const config = examConfig[examType.value];
    const blessingBonuses = blessingIds.map((id) => Number(document.getElementById(id).value) - 1);
    const rewardBonus = Number(rewardLv.value) * config.multiplier;
    const growth = getTrainerGrowth();

    tableBody.innerHTML = '';
    statLabels.forEach((rewardedLabel, rewardedIndex) => {
      if (growth && growth[statKeys[rewardedIndex]] === 0) return;

      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = rewardedLabel;
      row.appendChild(nameCell);

      statLabels.forEach((_, statIndex) => {
        const cell = document.createElement('td');
        let value = config.base + blessingBonuses[statIndex];
        if (statIndex === rewardedIndex) {
          value += rewardBonus;
        }
        cell.textContent = `+${value}`;
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });

    resultBox.hidden = false;
  }

  calcBtn.addEventListener('click', calculate);
})();
