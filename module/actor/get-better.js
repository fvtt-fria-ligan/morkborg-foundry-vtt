export const getBetter = async (actor) => {
  const oldHp = actor.system.hp.max;
  const newHp = betterHp(actor, oldHp);
  const oldStr = actor.system.abilities.strength.value;
  const newStr = betterAbility(oldStr);
  const oldAgi = actor.system.abilities.agility.value;
  const newAgi = betterAbility(oldAgi);
  const oldPre = actor.system.abilities.presence.value;
  const newPre = betterAbility(oldPre);
  const oldTou = actor.system.abilities.toughness.value;
  const newTou = betterAbility(oldTou);
  let newSilver = actor.system.silver;

  const hpOutcome = abilityOutcome(game.i18n.localize("MB.HP"), oldHp, newHp);
  const strOutcome = abilityOutcome(
    game.i18n.localize("MB.AbilityStrength"),
    oldStr,
    newStr
  );
  const agiOutcome = abilityOutcome(
    game.i18n.localize("MB.AbilityAgility"),
    oldAgi,
    newAgi
  );
  const preOutcome = abilityOutcome(
    game.i18n.localize("MB.AbilityPresence"),
    oldPre,
    newPre
  );
  const touOutcome = abilityOutcome(
    game.i18n.localize("MB.AbilityToughness"),
    oldTou,
    newTou
  );

  // Left in the debris you find...
  let debrisOutcome = null;
  let scrollTableName = null;
  const debrisRoll = new Roll("1d6").evaluate({
    async: false,
  });
  if (debrisRoll.total < 4) {
    debrisOutcome = "Nothing";
  } else if (debrisRoll.total === 4) {
    const silverRoll = new Roll("3d10").evaluate({
      async: false,
    });
    debrisOutcome = `${silverRoll.total} silver`;
    newSilver += silverRoll.total;
  } else if (debrisRoll.total === 5) {
    debrisOutcome = "an unclean scroll";
    scrollTableName = "Unclean Scrolls";
  } else {
    debrisOutcome = "a sacred scroll";
    scrollTableName = "Sacred Scrolls";
  }

  // show a single chat message for everything
  const data = {
    agiOutcome,
    debrisOutcome,
    hpOutcome,
    preOutcome,
    strOutcome,
    touOutcome,
  };
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/get-better-roll-card.hbs",
    data
  );
  ChatMessage.create({
    content: html,
    sound: CONFIG.sounds.dice, // make a single dice sound
    speaker: ChatMessage.getSpeaker({ actor }),
  });

  if (scrollTableName) {
    // roll a scroll
    const pack = game.packs.get("morkborg.random-tables");
    const content = await pack.getDocuments();
    const table = content.find((i) => i.name === scrollTableName);
    await table.draw();
  }

  // set new stats on the actor

  await actor.update({
    ["system.abilities.strength.value"]: newStr,
    ["system.abilities.agility.value"]: newAgi,
    ["system.abilities.presence.value"]: newPre,
    ["system.abilities.toughness.value"]: newTou,
    ["system.hp.max"]: newHp,
    ["system.silver"]: newSilver,
  });
};

const betterHp = (actor, oldHp) => {
  const hpRoll = new Roll("6d10").evaluate({
    async: false,
  });
  if (hpRoll.total >= oldHp) {
    // success, increase HP
    const howMuchRoll = new Roll("1d6").evaluate({
      async: false,
    });
    return oldHp + howMuchRoll.total;
  } else {
    // no soup for you
    return oldHp;
  }
};

const betterAbility = (oldVal) => {
  const roll = new Roll("1d6").evaluate({ async: false });
  if (roll.total === 1 || roll.total < oldVal) {
    // decrease, to a minimum of -3
    return Math.max(-3, oldVal - 1);
  } else {
    // increase, to a max of +6
    return Math.min(6, oldVal + 1);
  }
};

const abilityOutcome = (abilityName, oldVal, newVal) => {
  if (newVal < oldVal) {
    return `Lose ${oldVal - newVal} ${abilityName}`;
  } else if (newVal > oldVal) {
    return `Gain ${newVal - oldVal} ${abilityName}`;
  } else {
    return `${abilityName} unchanged`;
  }
};
