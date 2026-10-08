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

const BLESSING_STAT_INFO = [
  { key: 'hp', emoji: '🩷', label: '体力の加護', storageKey: 'examCalc:blessingHp' },
  { key: 'atk', emoji: '🗡️', label: '力の加護', storageKey: 'examCalc:blessingAtk' },
  { key: 'def', emoji: '🛡️', label: '守りの加護', storageKey: 'examCalc:blessingDef' },
  { key: 'spd', emoji: '💨', label: '速さの加護', storageKey: 'examCalc:blessingSpd' },
];

// 育成モンスターと加護Lv.の共通設定。各タブはsubscribeで変更を受け取る
const PlayerSettings = (function () {
  const MONSTER_STORAGE_KEY = 'trainingTargetMonster';
  const BLESSING_MAX = 18;
  const listeners = [];
  const state = { monster: '', blessing: {} };

  function load(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // 保存できない環境ではページを開いている間のみ有効
    }
  }

  function notify() {
    listeners.forEach((fn) => fn());
  }

  function levelLabel(lv) {
    return lv === BLESSING_MAX ? 'Lv.MAX' : `Lv.${lv}`;
  }

  const monsterNames = typeof MONSTER_DATA === 'undefined' ? [] : MONSTER_DATA.map((m) => m.name);
  const savedMonster = load(MONSTER_STORAGE_KEY);
  state.monster = monsterNames.includes(savedMonster) ? savedMonster : (monsterNames[0] || '');

  BLESSING_STAT_INFO.forEach((stat) => {
    const lv = Number(load(stat.storageKey));
    state.blessing[stat.key] = Number.isInteger(lv) && lv >= 1 && lv <= BLESSING_MAX ? lv : 1;
  });

  return {
    BLESSING_MAX,
    levelLabel,
    get monster() {
      return state.monster;
    },
    getBlessing(key) {
      return state.blessing[key];
    },
    blessingText() {
      return BLESSING_STAT_INFO.map((stat) => `${stat.emoji}${levelLabel(state.blessing[stat.key])}`).join(' ');
    },
    setMonster(name) {
      state.monster = name;
      save(MONSTER_STORAGE_KEY, name);
      notify();
    },
    setBlessing(key, lv) {
      const stat = BLESSING_STAT_INFO.find((s) => s.key === key);
      if (!stat) return;
      state.blessing[key] = lv;
      save(stat.storageKey, String(lv));
      notify();
    },
    // 登録時に1回呼ばれ、以降は設定が変わるたびに呼ばれる
    subscribe(fn) {
      listeners.push(fn);
      fn();
    },
  };
})();

function hideDiceTooltip() {
  const existing = document.querySelector('.dice-tap__tooltip');
  if (existing) existing.remove();
}

function showDiceTooltip(target) {
  hideDiceTooltip();
  const monsterName = PlayerSettings.monster;
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
    const href = `monster.html?id=${monster.id}`;
    monsterListEl.appendChild(createMonsterCard(monster, href));
  });
})();

(function () {
  const toggle = document.getElementById('heartOnlyToggle');
  const containers = ['eventChoiceList', 'eventCharacterList']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!toggle || containers.length === 0) return;

  const HEART_REGEX = /♥/u;
  const LINE_REGEX = /^(\s*[^→\n]+→\s*)(.+?)(\s+\/\s+)(.+?)(\s*)$/u;

  function createChoice(text, isHideable) {
    const span = document.createElement('span');
    span.className = 'event-choice';
    span.textContent = text;
    if (isHideable) span.dataset.heartHide = '1';
    return span;
  }

  // 「名前 → 選択肢A / 選択肢B」の行を、選択肢ごとのspanに分割する
  // (🔀のダイス化より前に実行する必要がある)
  containers.forEach((container) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const targets = [];
    let node;
    while ((node = walker.nextNode())) {
      if (LINE_REGEX.test(node.textContent)) targets.push(node);
    }
    targets.forEach((textNode) => {
      const [, head, a, sep, b, tail] = textNode.textContent.match(LINE_REGEX);
      const aHasHeart = HEART_REGEX.test(a);
      const bHasHeart = HEART_REGEX.test(b);
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(head));
      frag.appendChild(createChoice(a, !aHasHeart && bHasHeart));
      frag.appendChild(document.createTextNode(sep));
      frag.appendChild(createChoice(b, aHasHeart && !bHasHeart));
      if (tail) frag.appendChild(document.createTextNode(tail));
      textNode.parentNode.replaceChild(frag, textNode);
    });
  });

  toggle.addEventListener('click', () => {
    const isOn = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(isOn));
    toggle.textContent = isOn ? '♥️のみ表示中' : '♥️のみ表示する';
    hideDiceTooltip();
    document.querySelectorAll('.event-choice[data-heart-hide]').forEach((el) => {
      if (isOn) {
        if (!el._origNodes) {
          el._origNodes = Array.from(el.childNodes);
          el.replaceChildren('-');
        }
      } else if (el._origNodes) {
        el.replaceChildren(...el._origNodes);
        el._origNodes = null;
      }
    });
    // 検索中なら検索結果(ハイライト数)を再計算する
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
      searchInput.dispatchEvent(new Event('input'));
    }
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

  let matches = [];
  let currentIndex = -1;
  let isFooterVisible = false;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function clearHighlights() {
    searchScope.querySelectorAll('mark.search-highlight').forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });
    searchScope.normalize();
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
    const walker = document.createTreeWalker(searchScope, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentNode.closest('.heart-filter, .summary-btn') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
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

  const currentTabEl = document.getElementById('tabsCurrent');

  // 現在開いているタブ名（例: 育成 › 選択イベント）。タブ欄を閉じている間の表示に使う
  function updateCurrentTabLabel() {
    if (!currentTabEl) return;
    const mainBtn = document.querySelector('.tabs__nav--main .tabs__btn.is-active');
    const mainPanel = document.querySelector('.tabs__panel:not(.tabs__panel--sub):not([hidden])');
    const subBtn = mainPanel ? mainPanel.querySelector('.tabs__nav--sub .tabs__btn.is-active') : null;
    currentTabEl.textContent = [mainBtn, subBtn]
      .filter(Boolean)
      .map((btn) => btn.textContent)
      .filter((text, i, texts) => text !== texts[i - 1])
      .join(' › ');
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
    updateCurrentTabLabel();
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
    updateCurrentTabLabel();
    updateSearchBarVisibility();
  }

  // 固定表示のバー（設定・メインタブ・サブタブ）の直下にタブ内のコンテンツの先頭が来る位置まで戻す
  // すでに先頭が見えている位置にいるときは動かさない
  function scrollToTabContent() {
    const mainPanel = document.querySelector('.tabs__panel:not(.tabs__panel--sub):not([hidden])');
    if (!mainPanel) return;
    const content = mainPanel.querySelector('.tabs__panel--sub:not([hidden])') || mainPanel;
    const subNav = mainPanel.querySelector('.tabs__nav--sub');
    const heightOf = (el) => (el ? Math.ceil(el.getBoundingClientRect().height) : 0);

    let barsHeight = heightOf(document.getElementById('stickySettings'))
      + heightOf(document.querySelector('.tabs__nav--main'));
    if (subNav && subNav.offsetParent !== null) {
      barsHeight += heightOf(subNav) + parseFloat(getComputedStyle(subNav).marginBottom);
    }

    const top = content.getBoundingClientRect().top + window.scrollY - barsHeight;
    if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
  }

  mainTabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const changed = !btn.classList.contains('is-active');
      switchMainTab(btn.dataset.tab);
      if (changed) scrollToTabContent();
      history.replaceState(null, '', window.location.pathname);
    });
  });

  subTabNavs.forEach((navEl) => {
    navEl.querySelectorAll('.tabs__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const changed = !btn.classList.contains('is-active');
        switchSubTab(navEl, btn.dataset.subtab);
        if (changed) scrollToTabContent();
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
    const monsterLinks = document.querySelectorAll('#tab-panel-monster a[href^="monster.html?id="]');
    monsterLinks.forEach((link) => {
      const linkParams = new URLSearchParams(link.getAttribute('href').split('?')[1]);
      if (linkParams.get('id') === deepLinkMonster) {
        link.scrollIntoView({ block: 'center' });
      }
    });
  }

  updateCurrentTabLabel();
})();

(function () {
  const statEmojiEl = document.getElementById('eventStatEmojiLine');
  const statRandomEl = document.getElementById('eventStatRandomLine');
  const statUnchangedEl = document.getElementById('eventStatUnchangedLine');
  if (!statEmojiEl || !statRandomEl) return;

  function updateLegend(value) {
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

  PlayerSettings.subscribe(() => {
    updateLegend(PlayerSettings.monster);
    hideDiceTooltip();
  });
})();

(function () {
  const monsterGrid = document.getElementById('settingsMonsterGrid');
  const monsterImage = document.getElementById('settingsMonsterImage');
  const monsterLabel = document.getElementById('settingsMonsterLabel');
  const blessingLabel = document.getElementById('settingsBlessingLabel');
  const blessingSelects = document.querySelectorAll('[data-blessing-stat]');
  if (!monsterGrid || typeof MONSTER_DATA === 'undefined') return;

  const monsterButtons = MONSTER_DATA.map((monster) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'monster-card monster-card--select';

    const name = document.createElement('span');
    name.className = 'monster-card__name';
    name.textContent = monster.name;

    btn.append(createMonsterImage(monster), name);
    btn.addEventListener('click', () => PlayerSettings.setMonster(monster.name));
    monsterGrid.appendChild(btn);
    return { monster, btn };
  });

  blessingSelects.forEach((select) => {
    for (let i = 1; i <= PlayerSettings.BLESSING_MAX; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = PlayerSettings.levelLabel(i);
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      PlayerSettings.setBlessing(select.dataset.blessingStat, Number(select.value));
    });
  });

  PlayerSettings.subscribe(() => {
    monsterButtons.forEach(({ monster, btn }) => {
      btn.setAttribute('aria-pressed', String(monster.name === PlayerSettings.monster));
    });
    blessingSelects.forEach((select) => {
      select.value = PlayerSettings.getBlessing(select.dataset.blessingStat);
    });
    if (monsterImage) {
      const current = MONSTER_DATA.find((m) => m.name === PlayerSettings.monster);
      monsterImage.replaceChildren(...(current ? [createMonsterImage(current)] : []));
    }
    if (monsterLabel) monsterLabel.textContent = PlayerSettings.monster;
    if (blessingLabel) blessingLabel.textContent = PlayerSettings.blessingText();
  });

  const dialog = document.getElementById('settingsDialog');
  if (!dialog) return;
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-settings]')) dialog.showModal();
  });
})();

(function () {
  const summaryDialog = document.getElementById('summaryDialog');
  const summaryBody = document.getElementById('summaryDialogBody');

  document.querySelectorAll('dialog.modal').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      // 背景(dialog自身)か閉じるボタンを押したら閉じる
      if (e.target === dialog || e.target.closest('[data-modal-close]')) dialog.close();
    });
  });

  if (!summaryDialog || !summaryBody) return;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-summary]');
    if (!btn) return;
    const template = document.getElementById(`summary-${btn.dataset.summary}`);
    if (!template) return;
    summaryBody.replaceChildren(template.content.cloneNode(true));
    summaryDialog.showModal();
    summaryBody.scrollTop = 0;
  });
})();

(function () {
  const examType = document.getElementById('examType');
  const rewardLv = document.getElementById('rewardLv');
  if (!examType || !rewardLv) return;

  const tableBody = document.getElementById('examCalcTableBody');
  const statLabels = ['HP', '攻撃', '守備', '素早さ'];
  const statKeys = ['hp', 'atk', 'def', 'spd'];

  const examConfig = {
    1: { base: 5, multiplier: 1 },
    2: { base: 7, multiplier: 2 },
    3: { base: 15, multiplier: 3 },
  };

  function fillRewardOptions(select, max) {
    for (let i = 0; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }
  }

  fillRewardOptions(rewardLv, 30);

  function getTrainerGrowth() {
    if (typeof TRAINER_DATA === 'undefined') return null;
    const trainer = TRAINER_DATA.find((t) => t.name === PlayerSettings.monster);
    return trainer ? trainer.growth : null;
  }

  function calculate() {
    const config = examConfig[examType.value];
    const blessingBonuses = statKeys.map((key) => PlayerSettings.getBlessing(key) - 1);
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
  }

  examType.addEventListener('change', calculate);
  rewardLv.addEventListener('change', calculate);
  // 登録時に1回計算され、育成モンスターや加護Lv.が変わるたびに再計算される
  PlayerSettings.subscribe(calculate);
})();

// 設定バーとタブ欄の固定表示、タブ欄の開閉
(function () {
  const root = document.querySelector('.memo');
  const toggle = document.getElementById('tabsToggle');
  const settingsEl = document.getElementById('stickySettings');
  const mainNav = document.querySelector('.tabs__nav--main');
  if (!root || !toggle) return;

  toggle.addEventListener('click', () => {
    const collapsed = root.classList.toggle('is-tabs-collapsed');
    toggle.textContent = collapsed ? '▼' : '▲';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'タブ欄を開く' : 'タブ欄を閉じる');
  });

  // 上に固定される要素の高さに合わせて、下に重なる要素の固定位置を決める
  // 小数点以下は切り捨てて、要素の間に隙間ができないようにする
  function updateStickyOffsets() {
    const settingsH = settingsEl ? Math.floor(settingsEl.getBoundingClientRect().height) : 0;
    const mainH = mainNav ? Math.floor(mainNav.getBoundingClientRect().height) : 0;
    const style = document.documentElement.style;
    style.setProperty('--sticky-settings-h', `${settingsH}px`);
    style.setProperty('--sticky-main-h', `${mainH}px`);
  }

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(updateStickyOffsets);
    [settingsEl, mainNav].filter(Boolean).forEach((el) => observer.observe(el));
  }
  window.addEventListener('resize', updateStickyOffsets);
  updateStickyOffsets();
})();

// 加護Lv.UP必要量計算
(function () {
  const grid = document.getElementById('blessCalcGrid');
  const totalEl = document.getElementById('blessCalcTotal');
  if (!grid || !totalEl) return;

  // 【加護Lv.Upに必要な条件】と同じ内容（ゴルはLv.1〜8、以降はLv.9から順に金ぶる1,2,3…）
  const GOLD_COSTS = [100, 500, 1000, 1500, 2000, 3000, 4000, 5000];

  // 現在のLv.から次のLv.に上げるために必要な量
  function getUpCost(lv) {
    if (lv <= GOLD_COSTS.length) return { gold: GOLD_COSTS[lv - 1], statue: 0 };
    return { gold: 0, statue: lv - GOLD_COSTS.length };
  }

  function calcCost(from, to) {
    const total = { gold: 0, statue: 0 };
    for (let lv = from; lv < to; lv++) {
      const cost = getUpCost(lv);
      total.gold += cost.gold;
      total.statue += cost.statue;
    }
    return total;
  }

  function formatCost(cost) {
    return `🪙${cost.gold.toLocaleString()}　金ぶる${cost.statue}個`;
  }

  const targets = {};

  const cards = BLESSING_STAT_INFO.map((stat) => {
    const card = document.createElement('div');
    card.className = 'bless-card';

    const title = document.createElement('div');
    title.className = 'bless-card__title';
    title.textContent = `${stat.emoji}${stat.label}`;

    const levels = document.createElement('div');
    levels.className = 'bless-card__levels';
    const currentEl = document.createElement('span');
    currentEl.className = 'bless-card__current';
    const arrow = document.createElement('span');
    arrow.className = 'bless-card__arrow';
    arrow.textContent = '▶';
    const select = document.createElement('select');
    select.setAttribute('aria-label', `${stat.label}の目標Lv.`);
    levels.append(currentEl, arrow, select);

    const costEl = document.createElement('div');
    costEl.className = 'bless-card__cost';

    card.append(title, levels, costEl);
    grid.appendChild(card);

    select.addEventListener('change', () => {
      targets[stat.key] = Number(select.value);
      render();
    });

    return { stat, currentEl, select, costEl };
  });

  function render() {
    const total = { gold: 0, statue: 0 };

    cards.forEach(({ stat, currentEl, select, costEl }) => {
      const current = PlayerSettings.getBlessing(stat.key);
      // 現在のLv.より低い目標は選べないので、現在のLv.まで引き上げる
      if (!(targets[stat.key] >= current)) targets[stat.key] = current;
      const target = targets[stat.key];

      currentEl.textContent = PlayerSettings.levelLabel(current);
      select.innerHTML = '';
      for (let lv = current; lv <= PlayerSettings.BLESSING_MAX; lv++) {
        const opt = document.createElement('option');
        opt.value = lv;
        opt.textContent = PlayerSettings.levelLabel(lv);
        select.appendChild(opt);
      }
      select.value = target;

      const cost = calcCost(current, target);
      costEl.textContent = formatCost(cost);
      total.gold += cost.gold;
      total.statue += cost.statue;
    });

    totalEl.textContent = `合計　${formatCost(total)}`;
  }

  PlayerSettings.subscribe(render);
})();
