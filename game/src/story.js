// Cerita dan 9 misi Coral Heat. Teks ditulis baru untuk game ini.
export const INTRO = {
  title: 'CORAL HEAT',
  sub: 'Coral Bay — kota pantai, matahari tenggelam, dan satu malam panjang.',
  body: 'Rio baru turun dari kapal di Marina. Mama Luz memberinya kunci garasi tua dan satu nasihat: di kota ini, mobil bukan milik siapa-siapa — milik siapa yang paling cepat mengambilnya. Sembilan pekerjaan menanti. Polisi sudah hafal wajahmu.',
  hint: 'WASD / panah: jalan & nyetir  •  E: masuk/keluar mobil, bicara, ambil  •  Shift: nitro  •  Spasi: drift  •  F: tembak  •  P: jeda',
};

// 9 misi berantai. type: drive | deliver | taxi | race | escape | buy | chase | collect | finale.
export const MISSIONS = [
  {
    id: 'm1', giver: 'luz', title: 'First Wheels', type: 'drive', reward: 300,
    brief: 'Rio, kau butuh mobil. Di ujung Marina ada Coral GT merah terparkir. Ambil — cepat, sebelum pemiliknya kembali — lalu bawa ke garasiku.',
    objective: 'Curi Coral GT, bawa ke Garage Coral',
    targetSeg: 150, startSeg: 20,
  },
  {
    id: 'm2', giver: 'rico', title: 'Harbor Run', type: 'deliver', reward: 450,
    brief: 'Paket ini harus sampai ke Harbor sebelum matahari hilang. Jangan berhenti. Jangan ditabrak. Polisi lagi rajin malam ini.',
    objective: 'Antar paket ke Harbor Rd',
    targetSeg: 380, startSeg: 150,
  },
  {
    id: 'm3', giver: 'nina', title: 'Taxi Nights', type: 'taxi', reward: 500,
    brief: 'Taksiku mogok dan penumpangnya menunggu. Tiga orang, tiga tujuan. Senyum, jangan ngebut di tikungan — eh, ngebut dikit boleh.',
    objective: 'Antar 3 penumpang taksi (0/3)',
    targetSeg: 260, startSeg: 200, count: 3,
  },
  {
    id: 'm4', giver: 'faro', title: 'Street King', type: 'race', reward: 800,
    brief: 'Kau pikir kau cepat? Buktikan di Ocean Drive. Tiga pembalap, satu garis finis. Yang kalah bayar bensin semuanya.',
    objective: 'Menangi balapan jalanan di Ocean Drive',
    targetSeg: 660, startSeg: 620, rivals: 3,
  },
  {
    id: 'm5', giver: 'anselmo', title: 'Hot Pursuit', type: 'escape', reward: 700,
    brief: 'Anselmo butuh suku cadang dari gudang Harbor, tapi jalannya dijaga. Kau yang ambil. Kalau bintangmu naik, jangan pulang dulu.',
    objective: 'Ambil suku cadang, lalu hilangkan wanted level',
    targetSeg: 400, startSeg: 360,
  },
  {
    id: 'm6', giver: 'yara', title: 'Ammo Run', type: 'buy', reward: 600,
    brief: 'Toko Yara kehabisan stok karena... ya, kau tahu. Beli amunisi, antar ke Old Town. Uangnya sudah disiapkan, jangan dipakai jajan.',
    objective: 'Beli ammo di Yara, antar ke Old Town',
    targetSeg: 330, startSeg: 60,
  },
  {
    id: 'm7', giver: 'selma', title: 'Safe Haven', type: 'escape', reward: 650,
    brief: 'Selma menyembunyikan seseorang di safehouse Hills. Polisi mengendus. Antar dia ke sana — dan pastikan tidak ada yang mengikuti.',
    objective: 'Antar ke Safehouse Hills tanpa tertangkap',
    targetSeg: 560, startSeg: 480,
  },
  {
    id: 'm8', giver: 'marea', title: 'Neon Delivery', type: 'collect', reward: 750,
    brief: 'Radio Coral butuh tiga paket neon untuk pesta malam ini. Tiga titik, satu malam. Dengarkan laguku sambil jalan — itu bayaran tambahan.',
    objective: 'Kumpulkan 3 paket neon (0/3)',
    targetSeg: 120, startSeg: 300, count: 3,
  },
  {
    id: 'm9', giver: 'corso', title: 'Five-Star Escape', type: 'finale', reward: 1500,
    brief: 'Don Corso tidak pernah meminta dua kali. Seluruh kota akan mengejarmu malam ini. Sampai ke Marina dalam keadaan utuh — dan kota ini milikmu.',
    objective: 'Lolos dari wanted 5 bintang, sampai ke Marina',
    targetSeg: 30, startSeg: 600,
  },
];

export const BUSTED_TEXT = 'BUSTED — Polisi menangkapmu. Denda dibayar, mobil disita. Coral Bay tidak pernah tidur.';
export const WASTED_TEXT = 'WASTED — Rio tumbang di jalanan Coral Bay. Bangun di safehouse, dengan tagihan rumah sakit.';
export const WIN_TEXT = 'CORAL HEAT — Sembilan pekerjaan selesai. Don Corso mengangguk. Coral Bay kini mengenal namamu.';
