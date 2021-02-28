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
};

MB.colorSchemes = {
  "blackOnYellowWhite": {
    "background": "#ffe500",
    "foreground": "#000000",
    "highlightForeground": "#000000",
    "highlightBackground": "#ffffff"
  },
  "blackOnWhiteBlack": {
    "background": "#ffffff",
    "foreground": "#000000",
    "highlightForeground": "#ffffff",
    "highlightBackground": "#000000"
  },
  "whiteOnBlackYellow": {
    "background": "#000000",
    "foreground": "#ffffff",
    "highlightForeground": "#000000",
    "highlightBackground": "#ffe500"
  },
  "whiteOnBlackPink": {
    "background": "#000000",
    "foreground": "#ffffff",
    "highlightForeground": "#000000",
    "highlightBackground": "#f242b0"
  },
  "whiteOnPinkWhite": {
    "background": "#f242b0",
    "foreground": "#ffffff",
    "highlightForeground": "#000000",
    "highlightBackground": "#ffffff"
  }
};

MB.flagScope = "morkborg";  // must match system name

MB.flags = {
  ATTACK_DR: "attackDR",
  DEFEND_DR: "defendDR",
  INCOMING_ATTACK: "incomingAttack",
  TARGET_ARMOR: "targetArmor"
}

MB.fontSchemes = {
  "blackletter": {
    "chat": "Alegreya",
    "chatInfo": "Oswald",
    "h1": "Blood Crow",
    "h2": "FetteTrumpDeutsch",
    "h3": "Old Cupboard",
    "item": "Special Elite"
  },
  "legible": {
    "chat": "Alegreya",
    "chatInfo": "Oswald",
    "h1": "Blood Crow",
    "h2": "Calling Code Regular",
    "h3": "Old Cupboard",
    "item": "Lato"
  }
};

MB.handed = {
  1: "MB.HandedOne",
  2: "MB.HandedTwo"
};

MB.itemTypes = {
  armor: "armor",
  class: "class",
  container: "container",
  feat: "feat",
  misc: "misc",
  scroll: "scroll",
  shield: "shield",
  weapon: "weapon"
};

MB.itemTypeKeys = {
  "armor": "MB.ItemTypeArmor",
  "class": "MB.ItemTypeClass",
  "container": "MB.ItemTypeContainer",
  "feat": "MB.ItemTypeFeat",
  "misc": "MB.ItemTypeMisc",
  "scroll": "MB.ItemTypeScroll",
  "shield": "MB.ItemTypeShield",
  "weapon": "MB.ItemTypeWeapon"  
};

// these Item types are "equipment"
MB.itemEquipmentTypes = [
  MB.itemTypes.armor,
  MB.itemTypes.container,
  MB.itemTypes.misc,
  MB.itemTypes.scroll,
  MB.itemTypes.shield,
  MB.itemTypes.weapon,
];

MB.scrollTypes = {
  "sacred": "MB.ScrollTypeSacred",
  "unclean": "MB.ScrollTypeUnclean"
};

MB.weaponTypes = {
  "melee": "MB.WeaponTypeMelee",
  "ranged": "MB.WeaponTypeRanged"
};