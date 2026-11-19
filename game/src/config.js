// Coral Heat — konfigurasi dunia dan angka main.
// Kota pantai Coral Bay: 5 distrik di satu rute lingkar, kamera kejar 3D di belakang mobil.
export const VIEW = { w: 1280, h: 800 };
export const SEG_LEN = 200; // panjang satu segmen jalan, satuan dunia
export const ROAD_WIDTH = 2200; // lebar jalan, satuan dunia
export const LANES = 3;
export const CAM_HEIGHT = 1050; // tinggi kamera di atas jalan
export const CAM_DEPTH = 0.84; // 1 / tan(fov/2), fov ~100 derajat
export const DRAW_DIST = 200; // segmen yang digambar ke depan
export const ROUTE_SEGS = 720; // panjang rute lingkar
export const MAX_SPEED = 9200; // satuan dunia / detik (mobil tercepat)
export const WALK_SPEED = 420;
export const WANTED_MAX = 5;
export const NITRO_MAX = 100;

// Distrik di sepanjang rute (rentang segmen, gaya visual, warna langit sore).
export const DISTRICTS = [
  { name: 'Marina', from: 0, to: 119, sky: ['#ff9a3d', '#ff5e7a', '#7a4a9e'], ground: '#3d6b4f', buildH: [60, 160], palms: 0.8, tower: 0.1, style: 'hotel' },
  { name: 'Downtown', from: 120, to: 239, sky: ['#ff8a2a', '#e84a6f', '#5a3a8e'], ground: '#4a4a55', buildH: [220, 620], palms: 0.1, tower: 0.9, style: 'glass' },
  { name: 'Old Town', from: 240, to: 359, sky: ['#ffb347', '#ff6b4a', '#8e4a7a'], ground: '#6b5a44', buildH: [70, 190], palms: 0.3, tower: 0.05, style: 'color' },
  { name: 'Harbor', from: 360, to: 479, sky: ['#ff7a3d', '#d94a6f', '#4a3a7a'], ground: '#55504a', buildH: [90, 240], palms: 0.05, tower: 0.2, style: 'ware' },
  { name: 'Hills', from: 480, to: 599, sky: ['#ffa53d', '#ff5e5e', '#6a3a8e'], ground: '#4f6b3d', buildH: [80, 200], palms: 0.4, tower: 0.1, style: 'villa' },
  { name: 'Ocean Drive', from: 600, to: 719, sky: ['#ff9a3d', '#ff4a6a', '#7a3a9e'], ground: '#3d6b5a', buildH: [60, 170], palms: 0.9, tower: 0.15, style: 'hotel' },
];

// 5 model mobil curian: nama, warna, akselerasi, top speed, handling, harga jual.
export const CARS = [
  { name: 'Coral GT', color: '#ff3b30', top: '#c81e1e', accel: 4200, max: 9200, grip: 1.0, price: 1200, spoiler: true },
  { name: 'Marina S', color: '#0a84ff', top: '#0a5ac8', accel: 3800, max: 8400, grip: 1.1, price: 900, spoiler: false },
  { name: 'Sol Taxi', color: '#ffd60a', top: '#e0a800', accel: 3200, max: 7600, grip: 1.2, price: 500, spoiler: false, taxi: true },
  { name: 'Vela XR', color: '#bf5af2', top: '#8e2fc8', accel: 4600, max: 9800, grip: 0.9, price: 1800, spoiler: true },
  { name: 'Palm Van', color: '#30d158', top: '#1e8e3e', accel: 2800, max: 6800, grip: 1.3, price: 400, spoiler: false, van: true },
];

// Senjata: nama, damage, jarak, laju tembak, harga, harga peluru.
export const WEAPONS = [
  { id: 'fists', name: 'Fists', dmg: 12, range: 90, rate: 2.5, price: 0, ammoPrice: 0, infinite: true },
  { id: 'pistol', name: 'Pistol', dmg: 22, range: 900, rate: 3.5, price: 350, ammoPrice: 4, infinite: false },
  { id: 'smg', name: 'SMG', dmg: 14, range: 700, rate: 9, price: 900, ammoPrice: 2, infinite: false },
  { id: 'shotgun', name: 'Shotgun', dmg: 16, range: 500, rate: 1.2, price: 1200, ammoPrice: 8, infinite: false, pellets: 5 },
];

// Barang toko: id, nama, harga, efek.
export const SHOP_STOCK = {
  ammo: [
    { id: 'ammo_pistol', name: 'Pistol ammo x24', price: 96, kind: 'ammo', weapon: 'pistol', qty: 24 },
    { id: 'ammo_smg', name: 'SMG ammo x60', price: 120, kind: 'ammo', weapon: 'smg', qty: 60 },
    { id: 'ammo_shot', name: 'Shells x12', price: 96, kind: 'ammo', weapon: 'shotgun', qty: 12 },
    { id: 'armor', name: 'Body armor', price: 400, kind: 'armor', qty: 50 },
    { id: 'medkit', name: 'Medkit', price: 150, kind: 'heal', qty: 50 },
    { id: 'pistol', name: 'Pistol', price: 350, kind: 'weapon', weapon: 'pistol' },
    { id: 'smg', name: 'SMG', price: 900, kind: 'weapon', weapon: 'smg' },
    { id: 'shotgun', name: 'Shotgun', price: 1200, kind: 'weapon', weapon: 'shotgun' },
  ],
  customs: [
    { id: 'nitro', name: 'Nitro kit', price: 600, kind: 'upgrade', up: 'nitro' },
    { id: 'engine', name: 'Engine tune', price: 800, kind: 'upgrade', up: 'engine' },
    { id: 'armor_car', name: 'Car armor', price: 700, kind: 'upgrade', up: 'cararmor' },
    { id: 'tires', name: 'Grip tires', price: 450, kind: 'upgrade', up: 'grip' },
    { id: 'paint', name: 'Neon paint', price: 300, kind: 'upgrade', up: 'paint' },
  ],
  market: [
    { id: 'snack', name: 'Snack +25 HP', price: 40, kind: 'heal', qty: 25 },
    { id: 'drink', name: 'Energy drink +nitro', price: 60, kind: 'nitro', qty: 40 },
    { id: 'map', name: 'City map', price: 100, kind: 'map' },
    { id: 'medkit2', name: 'Medkit', price: 150, kind: 'heal', qty: 50 },
  ],
};

// Warna-warna sunset dan kota.
export const COLORS = {
  asphaltA: '#3a3a44', asphaltB: '#34343e', lane: '#ffd60a', edge: '#f5f5f0',
  sidewalk: '#8a7f70', sidewalkB: '#7d7266', grass: '#3d6b4f',
  sun: '#ffd60a', sunCore: '#fff3b0', sea: '#1a6a8e',
};
