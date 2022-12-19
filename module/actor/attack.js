import { addShowDicePromise, diceSound, showDice } from "../dice.js";
import { hitAutomation, trackAmmo } from "../settings.js";

/**
 * Attack!
 */
export const attack = async (actor, itemId) => {
  if (hitAutomation()) {
    return automatedAttack(actor, itemId);
  }
  return unautomatedAttack(actor, itemId);
};

const automatedAttack = async (actor, itemId) => {
  let attackDR = await actor.getFlag(
    CONFIG.MB.systemName,
    CONFIG.MB.flags.ATTACK_DR
  );
  if (!attackDR) {
    attackDR = 12; // default
  }
  const targetArmor = await actor.getFlag(
    CONFIG.MB.systemName,
    CONFIG.MB.flags.TARGET_ARMOR
  );
  const dialogData = {
    attackDR,
    config: CONFIG.MorkBorg,
    itemId,
    targetArmor,
  };
  const html = await renderTemplate(
    "systems/morkborg/templates/dialog/attack-dialog.hbs",
    dialogData
  );
  return new Promise((resolve) => {
    new Dialog({
      title: game.i18n.localize("MB.Attack"),
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: game.i18n.localize("MB.Roll"),
          // callback: html => resolve(_createItem(actor.actor, html[0].querySelector("form")))
          callback: (html) => attackDialogCallback(actor, html),
        },
      },
      default: "roll",
      close: () => resolve(null),
    }).render(true);
  });
};

const unautomatedAttack = async (actor, itemId) => {
  const item = actor.items.get(itemId);
  const itemRollData = item.getRollData();
  const actorRollData = actor.getRollData();
  const isRanged = itemRollData.weaponType === "ranged";
  const ability = isRanged ? "presence" : "strength";
  const attackRoll = new Roll(`d20+@abilities.${ability}.value`, actorRollData);
  attackRoll.evaluate({ async: false });
  await showDice(attackRoll);

  const abilityAbbrevKey = isRanged
    ? "MB.AbilityPresenceAbbrev"
    : "MB.AbilityStrengthAbbrev";
  const weaponTypeKey = isRanged ? "MB.WeaponTypeRanged" : "MB.WeaponTypeMelee";
  const rollResult = {
    actor: actor,
    attackFormula: `1d20 + ${game.i18n.localize(abilityAbbrevKey)}`,
    attackRoll,
    item,
    weaponTypeKey,
  };
  await decrementWeaponAmmo(actor, item);
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/unautomated-attack-roll-card.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};

/**
 * Callback from attack dialog.
 */
const attackDialogCallback = async (actor, html) => {
  const form = html[0].querySelector("form");
  const itemId = form.itemid.value;
  const attackDR = parseInt(form.attackdr.value);
  const targetArmor = form.targetarmor.value;
  if (!itemId || !attackDR) {
    // TODO: prevent form submit via required fields
    return;
  }
  await actor.setFlag(
    CONFIG.MB.systemName,
    CONFIG.MB.flags.ATTACK_DR,
    attackDR
  );
  await actor.setFlag(
    CONFIG.MB.systemName,
    CONFIG.MB.flags.TARGET_ARMOR,
    targetArmor
  );
  await rollAttack(actor, itemId, attackDR, targetArmor);
};

/**
 * Do the actual attack rolls and resolution.
 */
const rollAttack = async (actor, itemId, attackDR, targetArmor) => {
  const item = actor.items.get(itemId);
  const itemRollData = item.getRollData();
  const actorRollData = actor.getRollData();

  // roll 1: attack
  const isRanged = itemRollData.weaponType === "ranged";
  // ranged weapons use presence; melee weapons use strength
  const ability = isRanged ? "presence" : "strength";
  const attackRoll = new Roll(`d20+@abilities.${ability}.value`, actorRollData);
  attackRoll.evaluate({ async: false });
  await showDice(attackRoll);

  const d20Result = attackRoll.terms[0].results[0].result;
  const fumbleTarget = itemRollData.fumbleOn ?? 1;
  const critTarget = itemRollData.critOn ?? 20;
  const isFumble = d20Result <= fumbleTarget;
  const isCrit = d20Result >= critTarget;
  // nat 1 is always a miss, nat 20 is always a hit, otherwise check vs DR
  const isHit =
    attackRoll.total !== 1 &&
    (attackRoll.total === 20 || attackRoll.total >= attackDR);

  let attackOutcome = null;
  let damageRoll = null;
  let targetArmorRoll = null;
  let takeDamage = null;
  if (isHit) {
    // HIT!!!
    attackOutcome = game.i18n.localize(isCrit ? "MB.AttackCritText" : "MB.Hit");
    // roll 2: damage.
    // Use parentheses for critical 2x in case damage die something like 1d6+1
    const damageFormula = isCrit ? "(@damageDie) * 2" : "@damageDie";
    damageRoll = new Roll(damageFormula, itemRollData);
    damageRoll.evaluate({ async: false });
    const dicePromises = [];
    addShowDicePromise(dicePromises, damageRoll);
    let damage = damageRoll.total;
    // roll 3: target damage reduction
    if (targetArmor) {
      targetArmorRoll = new Roll(targetArmor, {});
      targetArmorRoll.evaluate({ async: false });
      addShowDicePromise(dicePromises, targetArmorRoll);
      damage = Math.max(damage - targetArmorRoll.total, 0);
    }
    if (dicePromises) {
      await Promise.all(dicePromises);
    }
    takeDamage = `${game.i18n.localize(
      "MB.Inflict"
    )} ${damage} ${game.i18n.localize("MB.Damage")}`;
  } else {
    // MISS!!!
    attackOutcome = game.i18n.localize(
      isFumble ? "MB.AttackFumbleText" : "MB.Miss"
    );
  }

  // TODO: decide keys in handlebars/template?
  const abilityAbbrevKey = isRanged
    ? "MB.AbilityPresenceAbbrev"
    : "MB.AbilityStrengthAbbrev";
  const weaponTypeKey = isRanged ? "MB.WeaponTypeRanged" : "MB.WeaponTypeMelee";
  const rollResult = {
    actor,
    attackDR,
    attackFormula: `1d20 + ${game.i18n.localize(abilityAbbrevKey)}`,
    attackRoll,
    attackOutcome,
    damageRoll,
    items: [item],
    takeDamage,
    targetArmorRoll,
    weaponTypeKey,
  };
  await decrementWeaponAmmo(actor, item);
  await renderAttackRollCard(actor, rollResult);
};

const decrementWeaponAmmo = async (actor, weapon) => {
  if (weapon.system.usesAmmo && weapon.system.ammoId && trackAmmo()) {
    const ammo = actor.items.get(weapon.system.ammoId);
    if (ammo) {
      const attr = "system.quantity";
      const currQuantity = getProperty(ammo.data, attr);
      if (currQuantity > 1) {
        // decrement quantity by 1
        await ammo.update({ [attr]: currQuantity - 1 });
      } else {
        // quantity is now zero, so delete ammo item
        await actor.deleteEmbeddedDocuments("Item", [ammo.id]);
      }
    }
  }
};

/**
 * Show attack rolls/result in a chat roll card.
 */
const renderAttackRollCard = async (actor, rollResult) => {
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/attack-roll-card.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};
