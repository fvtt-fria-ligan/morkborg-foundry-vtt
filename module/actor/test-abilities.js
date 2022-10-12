import { diceSound, showDice } from "../dice.js";

const testAbility = async (
  actor,
  ability,
  abilityKey,
  abilityAbbrevKey,
  drModifiers
) => {
  const abilityRoll = new Roll(
    `1d20+@abilities.${ability}.value`,
    actor.getRollData()
  );
  abilityRoll.evaluate({ async: false });
  await showDice(abilityRoll);
  const rollResult = {
    abilityKey,
    abilityRoll,
    displayFormula: `1d20 + ${game.i18n.localize(abilityAbbrevKey)}`,
    drModifiers,
  };
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/test-ability-roll-card.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};

export const testStrength = async (actor) => {
  const drModifiers = [];
  if (actor.isEncumbered()) {
    drModifiers.push(
      `${game.i18n.localize("MB.Encumbered")}: ${game.i18n.localize(
        "MB.DR"
      )} +2`
    );
  }
  await testAbility(
    actor,
    "strength",
    "MB.AbilityStrength",
    "MB.AbilityStrengthAbbrev",
    drModifiers
  );
};

export const testAgility = async (actor) => {
  const drModifiers = [];
  const armor = actor.equippedArmor();
  if (armor) {
    const armorTier = CONFIG.MB.armorTiers[armor.system.tier.max];
    if (armorTier.agilityModifier) {
      drModifiers.push(
        `${armor.name}: ${game.i18n.localize("MB.DR")} +${
          armorTier.agilityModifier
        }`
      );
    }
  }
  if (actor.isEncumbered()) {
    drModifiers.push(
      `${game.i18n.localize("MB.Encumbered")}: ${game.i18n.localize(
        "MB.DR"
      )} +2`
    );
  }
  await testAbility(
    actor,
    "agility",
    "MB.AbilityAgility",
    "MB.AbilityAgilityAbbrev",
    drModifiers
  );
};

export const testPresence = async (actor) => {
  await testAbility(
    actor,
    "presence",
    "MB.AbilityPresence",
    "MB.AbilityPresenceAbbrev",
    null
  );
};

export const testToughness = async (actor) => {
  await testAbility(
    actor,
    "toughness",
    "MB.AbilityToughness",
    "MB.AbilityToughnessAbbrev",
    null
  );
};
