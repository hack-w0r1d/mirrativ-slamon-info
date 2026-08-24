const SKILL_DATA = [
  {
    name: 'ファイーア',
    heartCost: 10,
    description: '相手1体に炎の魔法攻撃。「ギガファイーア」に進化可能。',
  },
  {
    name: 'ギガファイーア',
    heartCost: 30,
    description: '「ファイーア」から進化。相手1体に炎の魔法攻撃。',
  },
  {
    name: 'サンーダ',
    heartCost: 10,
    description: '相手1体に雷の魔法攻撃。HPが高い時に発動確率が上がる。「ギガサンーダ」に進化可能。',
  },
  {
    name: 'ギガサンーダ',
    heartCost: 30,
    description: '「サンーダ」から進化。相手1体に雷の魔法攻撃。HPが高い時に発動確率が上がる。',
  },
  {
    name: 'するどいキバ',
    heartCost: 15,
    description: '相手1体に強力な攻撃。',
  },
  {
    name: 'おしつぶし',
    heartCost: 15,
    description: '相手1体にかなり強力な攻撃。HPが低い時発動確率が上がる。',
  },
  {
    name: 'ドリルスピン',
    heartCost: null,
    description: '通常攻撃の約1.5倍',
  },
  {
    name: 'リフレシュ',
    heartCost: 10,
    description: '自分のHPを150回復か。「チョーリフレシュ」に進化可能',
  },
  {
    name: 'ムキムキン',
    heartCost: 10,
    description: '攻撃力を上げる。「バキバキン」に進化可能。',
  },
  {
    name: 'バキバキン',
    heartCost: 30,
    description: '「ムキムキン」から進化。攻撃力を約2倍上げる。',
  },
  {
    name: 'カチコチン',
    heartCost: 10,
    description: '守備力を上げる。「ガチガチン」に進化可能。',
  },
  {
    name: 'ガチガチン',
    heartCost: 30,
    description: '「カチコチン」から進化。守備力をかなり上げる。',
  },
  {
    name: 'キビキビン',
    heartCost: 10,
    description: '素早さを上げる。「シュビシュビン」に進化可能。',
  },
  {
    name: 'シュビシュビン',
    heartCost: 30,
    description: '「キビキビン」から進化。素早さをかなり上げる。',
  },
  {
    name: 'ピタピタン',
    heartCost: 10,
    description: '命中率を上げる。「バチバチン」に進化可能。',
  },
  {
    name: 'バチバチン',
    heartCost: 30,
    description: '「ピタピタン」から進化。命中率をかなり上げる。',
  },
  {
    name: 'フニャムキン',
    heartCost: 10,
    description: '守備力が大きく下がる代わりに攻撃力を大きく上げる。',
  },
  {
    name: 'ポヨポヨン',
    heartCost: 10,
    description: '魔法守備力を上げる。「ブヨブヨン」に進化可能。',
  },
  {
    name: 'ブヨブヨン',
    heartCost: 30,
    description: '「ポヨポヨン」から進化。魔法守備力をかなり上げる。',
  },
  {
    name: 'カシコイン',
    heartCost: 10,
    description: '魔法攻撃力を上げる。「インテリン」に進化可能。',
  },
  {
    name: 'インテリン',
    heartCost: 30,
    description: '「カシコイン」から進化。魔法攻撃力をかなり上げる。',
  },
  {
    name: 'フニャルト',
    heartCost: 10,
    description: '相手1体の守備力を下げる。「フニャフニャルト」に進化可能。',
  },
  {
    name: 'フニャフニャルト',
    heartCost: 30,
    description: '「フニャルト」から進化。相手1体の守備力をかなり下げる。',
  },
  {
    name: 'シオルト',
    heartCost: 10,
    description: '相手1体の攻撃力を下げる。「シオシオルト」に進化可能。',
  },
  {
    name: 'シオシオルト',
    heartCost: 30,
    description: '「シオルト」から進化。相手1体の攻撃力をかなり下げる。討伐戦においてかなり優秀。',
  },
  {
    name: 'オソルト',
    heartCost: 10,
    description: '相手1体の素早さを下げる。「オソオソルト」に進化可能。',
  },
  {
    name: 'オソオソルト',
    heartCost: 30,
    description: '「オソルト」から進化。相手1体の素早さをかなり下げる。',
  },
  {
    name: 'ブレルト',
    heartCost: 10,
    description: '相手1体の命中率を下げる。「ブレブレルト」に進化可能。',
  },
  {
    name: 'ブレブレルト',
    heartCost: 30,
    description: '「ブレルト」から進化。相手1体の命中率をかなり下げる。討伐戦においてかなり優秀。',
  },
  {
    name: 'ポヤルト',
    heartCost: 10,
    description: '相手1体の魔法攻撃力を下げる。「ポヤポヤルト」に進化可能。',
  },
  {
    name: 'ポヤポヤルト',
    heartCost: 30,
    description: '「ポヤルト」から進化。相手1体の魔法攻撃力をかなり下げる。',
  },
  {
    name: 'カサルト',
    heartCost: 10,
    description: '相手1体の魔法守備力を下げる。「カサカサルト」に進化可能。',
  },
  {
    name: 'カサカサルト',
    heartCost: 30,
    description: '「カサルト」から進化。相手1体の魔法守備力をかなり下げる。',
  },
  {
    name: 'ドクルト',
    heartCost: null,
    description: 'モンスターを毒状態にし、毎ターン行動後最大HPの約1/6ダメージ。ボス討伐においてかなり優秀。2~3回目で発動すれば必ず制限ターン内に決着がつきます。',
  },
  {
    name: 'ナイトメーア',
    heartCost: null,
    description: '敵全体に通常攻撃分のダメージ、素早さを下げる',
  },
  {
    name: 'ユルミノウタ',
    heartCost: null,
    description: '相手全員の攻撃力約3/4倍',
  },
];
