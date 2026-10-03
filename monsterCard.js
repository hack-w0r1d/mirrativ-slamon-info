const MONSTER_FRAME_SRC = 'images/monster-frame.png';
const MONSTER_IMAGE_DIR = 'images/monsters/';

// モンスター画像は ID.png（例: images/monsters/m01.png）を参照する
function getMonsterImageSrc(monster) {
  return `${MONSTER_IMAGE_DIR}${monster.id}.png`;
}

// 背景フレームの上にモンスター画像を重ねた画像部分を作る
function createMonsterImage(monster) {
  const wrap = document.createElement('span');
  wrap.className = 'monster-image';

  const frame = document.createElement('img');
  frame.className = 'monster-image__frame';
  frame.src = MONSTER_FRAME_SRC;
  frame.alt = '';

  const body = document.createElement('img');
  body.className = 'monster-image__body';
  body.src = getMonsterImageSrc(monster);
  body.alt = '';
  body.loading = 'lazy';
  // 画像が未用意のモンスターはフレームのみ表示する
  body.addEventListener('error', () => body.remove());

  wrap.append(frame, body);
  return wrap;
}

// 一覧用のカード（画像＋モンスター名）。カード全体がリンクになる
function createMonsterCard(monster, href) {
  const a = document.createElement('a');
  a.className = 'monster-card';
  a.href = href;

  const name = document.createElement('span');
  name.className = 'monster-card__name';
  name.textContent = monster.name;

  a.append(createMonsterImage(monster), name);
  return a;
}
