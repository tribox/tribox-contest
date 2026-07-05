// 商品名の表示ルール
// TriboxContest.shortenProductName / TriboxContest.productBrandIcon (basejs) が参照する。
// - 名前の省略: ブランド名はロゴで示されるため名前からは除去し、仕様・付属品の表記も落とす。
//   GAN / MGC / HuaMeng など、名前を残すブランドは ProductNameBrands に含めない。
// - ロゴ: 商品名からブランドを特定し、最も規模の小さいブランドのロゴを表示する。
window.TriboxContest = window.TriboxContest || {};

// 付属品・仕様
// ブランド名を含むもの (+ MoYu Cube Robot Case 等) があるため、ブランドより先に除去される
TriboxContest.ProductNameSpecs = [
  ' + MoYu Cube Robot Case 56.5mm',
  ' + Cube Robot Case 56.5mm',
  ' + ポータブルチャージャー',
  ' + PowerPod',
  '(Premium Setup)',
  'Stickerless',
  'Stickered',
  '-Coated'
];

// 名前から除去するブランド
// 別のブランド名を含む名称 (Picube Edition と Picube 等) は長い方を先に置くこと
TriboxContest.ProductNameBrands = [
  'Cubing Classroom',
  'X-Man Design',
  "Cuber's Home",
  'Picube Edition',
  'Picube',
  'TheCubicle',
  'DianSheng',
  'ShengShou',
  'FANXIN',
  'DaYan',
  'MoYu',
  'QiYi',
  'YuXin',
  'Maru',
  'esc',
  'YJ'
];

// ロゴ表示用のブランド定義
// icon: images/brand_logo/<icon>.png のファイル名
// scale: 1=グループ, 2=メーカー, 3=サブブランド, 4=カスタムショップ。
//        商品名に複数ブランドが含まれるときは数字が最も大きい (最も小規模な) ブランドの
//        ロゴを表示し、同格なら icon 名のABC順で先のものを使う。
// match: 商品名中の表記 (複数可)。単語として一致したときだけヒットする。
// loose: true にすると後ろの区切りを見ない前方一致になる (GAN356, TORIBOステッカー 等)
TriboxContest.BrandIcons = [
  { icon: 'YJ', scale: 1, match: ['YJ'] },

  { icon: 'Ayi', scale: 2, match: ['Ayi'], loose: true },
  { icon: "Calvin's", scale: 2, match: ["Calvin's"] },
  { icon: 'Cube4You', scale: 2, match: ['Cube4You', 'Cube4you'] },
  { icon: 'CubeTwist', scale: 2, match: ['CubeTwist'] },
  { icon: 'DaYan', scale: 2, match: ['DaYan', 'Dayan'] },
  { icon: 'DianSheng', scale: 2, match: ['DianSheng'] },
  { icon: 'Eastsheen', scale: 2, match: ['Eastsheen'] },
  { icon: 'ESCube', scale: 2, match: ['esc'] },
  { icon: 'FANXIN', scale: 2, match: ['FANXIN'] },
  { icon: 'GANCUBE', scale: 2, match: ['GAN', 'Gans'], loose: true },
  { icon: 'GiiKER', scale: 2, match: ['GiiKER'] },
  { icon: 'LanLan', scale: 2, match: ['LanLan'] },
  { icon: 'Lefun', scale: 2, match: ['Lefun'] },
  { icon: 'LimCube', scale: 2, match: ['LimCube'] },
  { icon: 'MaruCube', scale: 2, match: ['Maru'] },
  { icon: "Meffert's", scale: 2, match: ["Meffert's"] },
  { icon: 'mf8', scale: 2, match: ['mf8'] },
  { icon: 'MoYu', scale: 2, match: ['MoYu'] },
  { icon: 'QiYi', scale: 2, match: ['QiYi'] },
  { icon: "Rubik's", scale: 2, match: ["Rubik's", 'ルービック'], loose: true },
  { icon: 'ShengShou', scale: 2, match: ['ShengShou'] },
  { icon: 'SpeedStacks', scale: 2, match: ['Speed Stacks'], loose: true },
  { icon: 'V-CUBE', scale: 2, match: ['V-CUBE'] },
  { icon: 'VeryPuzzle', scale: 2, match: ['VeryPuzzle'] },
  { icon: 'VinCube', scale: 2, match: ['Vin Cube'] },
  { icon: 'WitEden', scale: 2, match: ['WitEden'] },
  { icon: 'YUXIN', scale: 2, match: ['YuXin'] },
  { icon: 'Z-CUBE', scale: 2, match: ['Z-CUBE'] },
  { icon: 'ZEPUZZLES', scale: 2, match: ['ZEPUZZLES'] },

  { icon: 'CubingClassroom', scale: 3, match: ['Cubing Classroom'] },
  { icon: 'XMD', scale: 3, match: ['X-Man Design', 'XMD'] },

  { icon: 'CubersHome', scale: 4, match: ["Cuber's Home"] },
  { icon: 'Picube', scale: 4, match: ['Picube'] },
  { icon: 'SpeedCubeShop', scale: 4, match: ['SCS'] },
  { icon: 'TheCubicle', scale: 4, match: ['TheCubicle'] },
  { icon: 'TORIBO', scale: 4, match: ['TORIBO'], loose: true },
  { icon: 'tribox', scale: 4, match: ['tribox'], loose: true }
];
