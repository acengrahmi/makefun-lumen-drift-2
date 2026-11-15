// Lumen Drift II — the dew shop. Dew is the run's currency: foes drop it,
// the player banks it, and between waves they spend it on healing, Nova
// charges, fresh blessing cards and permanent Ember Cores. Every purchase
// checks its price, its stock and whether it would help at all.
import { SHOP } from './config.js';
import { burst, addText } from './fx.js';
import { offerBlessings } from './upgrades.js';

export function shopItem(world, index) {
  return SHOP[index] ?? null;
}

export function canAfford(world, item) {
  if (!item) return false;
  if (world.dew < item.cost) return false;
  if ((world.shopTaken[item.id] ?? 0) >= item.stock) return false;
  return item.canBuy(world);
}

export function buyShopItem(world, index) {
  const item = shopItem(world, index);
  if (!item || !canAfford(world, item)) return false;
  world.dew -= item.cost;
  world.stats.dewSpent += item.cost;
  world.shopTaken[item.id] = (world.shopTaken[item.id] ?? 0) + 1;
  if (item.id === 'reroll') {
    offerBlessings(world);
    addText(world, world.player.x, world.player.y - 34, 'New blessings!', '#8ef7ff', 22);
  } else {
    item.buy(world);
    addText(world, world.player.x, world.player.y - 34, item.title, '#8ef7ff', 22);
  }
  if (world.sound) world.sound.buySound();
  burst(world, world.player.x, world.player.y, '#8ef7ff', 18, 220, 4);
  return true;
}
