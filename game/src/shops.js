// Toko Coral Bay: tiga toko nyata dengan stok, harga, dan efek.
// Panel toko digambar di atas dunia 3D; beli pakai uang tunai.
import { SHOP_STOCK } from './config.js';
import { weaponById } from './weapons.js';

export function shopStock(shopId) {
  return SHOP_STOCK[shopId] || [];
}

export function openShop(G, shopId) {
  G.shop = { id: shopId, sel: 0 };
}

export function closeShop(G) {
  G.shop = null;
}

export function shopMove(G, dir) {
  if (!G.shop) return;
  const n = shopStock(G.shop.id).length;
  G.shop.sel = (G.shop.sel + dir + n) % n;
}

export function shopBuy(G) {
  if (!G.shop) return 'No shop open.';
  const item = shopStock(G.shop.id)[G.shop.sel];
  const p = G.player;
  if (p.cash < item.price) return 'Not enough cash.';
  p.cash -= item.price;
  if (item.kind === 'ammo') p.ammo[item.weapon] = (p.ammo[item.weapon] || 0) + item.qty;
  else if (item.kind === 'weapon') {
    if (!p.ownedWeapons.includes(item.weapon)) p.ownedWeapons.push(item.weapon);
    p.weapon = item.weapon;
  } else if (item.kind === 'armor') p.armor = Math.min(100, p.armor + item.qty);
  else if (item.kind === 'heal') p.health = Math.min(100, p.health + item.qty);
  else if (item.kind === 'nitro') p.nitro = Math.min(100, p.nitro + item.qty);
  else if (item.kind === 'upgrade') p.upgrades[item.up] = true;
  else if (item.kind === 'map') p.hasMap = true;
  return `Bought ${item.name} for $${item.price}.`;
}

export function drawShop(G, ctx) {
  const s = G.shop;
  if (!s) return;
  const shop = G.world.spots.shops.find((x) => x.id === s.id);
  const items = shopStock(s.id);
  const pw = 620, ph = 440, px = 1280 - pw - 40, py = 120;
  ctx.fillStyle = 'rgba(10,10,16,0.92)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, pw, ph);
  ctx.fillStyle = '#ffd60a';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(shop.name, px + 24, py + 18);
  ctx.fillStyle = '#9a9aad';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(shop.blurb, px + 24, py + 52);
  ctx.fillStyle = '#30d158';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`Cash $${G.player.cash}`, px + 24, py + 78);
  items.forEach((it, i) => {
    const y = py + 112 + i * 38;
    if (i === s.sel) {
      ctx.fillStyle = 'rgba(255,214,10,0.2)';
      ctx.fillRect(px + 12, y - 6, pw - 24, 34);
    }
    ctx.fillStyle = i === s.sel ? '#ffd60a' : '#f5f5f0';
    ctx.font = '19px system-ui, sans-serif';
    ctx.fillText(it.name, px + 24, y);
    ctx.fillStyle = '#30d158';
    ctx.textAlign = 'right';
    ctx.fillText(`$${it.price}`, px + pw - 24, y);
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = '#9a9aad';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Atas/bawah: pilih • Enter: beli • Esc: tutup', px + 24, py + ph - 34);
}
