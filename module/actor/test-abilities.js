import { showDice } from "../dice.js";
import { showRollResultCard } from "../utils.js";

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
  const cardTitle = `${game.i18n.localize("MB.Test")} ${game.i18n.localize(
    abilityKey
  )}`;
  const displayFormula = `1d20 + ${game.i18n.localize(abilityAbbrevKey)}`;
  const data = {
    cardTitle,
    drModifiers,
    rollResults: [
      {
        rollTitle: displayFormula,
        roll: abilityRoll,
        outcomeLines: [],
      },
    ],
  };
  await showRollResultCard(actor, data);
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

export const testCustomAbility = async (actor, ability) => {
  await testAbility(
    actor,
    ability,
    (ability.charAt(0).toUpperCase() + ability.slice(1)),
    (ability.slice(0,3)).toUpperCase(),
    null
  )
}
