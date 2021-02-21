// Namespace Configuration Values
export const MB = {};

MB.abilities = {
  "agility": "MB.AbilityAgility",
  "presence": "MB.AbilityPresence",
  "strength": "MB.AbilityStrength",
  "toughness": "MB.AbilityToughness"
};

MB.armorTiers = {
  0: {
    key: "MB.ArmorTierNone",
    damageReductionDie: "1d0",
    agilityModifier: 0,
    defenseModifier: 0
  },
  1: {
    key: "MB.ArmorTierLight",
    damageReductionDie: "1d2",
    agilityModifier: 0,
    defenseModifier: 0
  },
  2: {
    key: "MB.ArmorTierMedium",
    damageReductionDie: "1d4",
    agilityModifier: 2,
    defenseModifier: 2
  },
  3: {
    key: "MB.ArmorTierHeavy",
    damageReductionDie: "1d6",
    agilityModifier: 4,
    defenseModifier: 2
  },
}

MB.flagScope = "morkborg";  // must match system name

MB.flags = {
  ATTACK_DR: "attackDR",
  DEFEND_DR: "defendDR",
  INCOMING_ATTACK: "incomingAttack",
  TARGET_ARMOR: "targetArmor"
}

MB.handed = {
  1: "MB.HandedOne",
  2: "MB.HandedTwo"
};

MB.itemTypes = {
  "armor": "MB.ItemTypeArmor",
  "class": "MB.ItemTypeClass",
  "container": "MB.ItemTypeContainer",
  "misc": "MB.ItemTypeMisc",
  "scroll": "MB.ItemTypeScroll",
  "shield": "MB.ItemTypeShield",
  "weapon": "MB.ItemTypeWeapon"
};

MB.scrollTypes = {
  "sacred": "MB.ScrollTypeSacred",
  "unclean": "MB.ScrollTypeUnclean"
};

MB.weaponTypes = {
  "melee": "MB.WeaponTypeMelee",
  "ranged": "MB.WeaponTypeRanged"
};