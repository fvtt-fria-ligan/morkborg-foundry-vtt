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
    "background": "#ffe900",
    "foreground": "#000000",
    "foregroundAlt": "#808080",
    "highlightBackground": "#ffffff",
    "highlightForeground": "#000000",
    "sidebarBackground": "#ffe900",
    "sidebarForeground": "000000",
    "sidebarButtonBackground": "#000000",
    "sidebarButtonForeground": "#ffe900",
    "windowBackground": "#ffe900"
  },
  "blackOnWhiteBlack": {
    "background": "#ffffff",
    "foreground": "#000000",
    "foregroundAlt": "#808080",
    "highlightBackground": "#000000",
    "highlightForeground": "#ffffff",
    "sidebarBackground": "#ffffff",
    "sidebarForeground": "#000000",
    "sidebarButtonBackground": "#000000",
    "sidebarButtonForeground": "#ffffff",
    "windowBackground": "#ffffff"
  },
  "foundryDefault": {
    "background": "#f0f0e0",
    "foreground": "#191813",
    "foregroundAlt": "red",
    "highlightBackground": "#191813",
    "highlightForeground": "#f0f0e0",
    "sidebarBackground": "url(../ui/denim.jpg) repeat",
    "sidebarForeground": "#f0f0e0",
    "sidebarButtonBackground": "#f0f0e0",
    "sidebarButtonForeground": "#000000",
    "windowBackground": "url(../ui/parchment.jpg) repeat"
  },
  "whiteOnBlackYellow": {
    "background": "#000000",
    "foreground": "#ffffff",
    "foregroundAlt": "#ffe900",
    "highlightBackground": "#ffe900",
    "highlightForeground": "#000000",
    "sidebarBackground": "#000000",
    "sidebarForeground": "#ffffff",
    "sidebarButtonBackground": "#ffffff",
    "sidebarButtonForeground": "#000000",
    "windowBackground": "#000000"
  },
  "whiteOnBlackPink": {
    "background": "#000000",
    "foreground": "#ffffff",
    "foregroundAlt": "#ff3eb5",
    "highlightBackground": "#ff3eb5",
    "highlightForeground": "#000000",
    "sidebarBackground": "#000000",
    "sidebarForeground": "#ffffff",
    "sidebarButtonBackground": "#ffffff",
    "sidebarButtonForeground": "#000000",
    "windowBackground": "#000000"
  },
  "whiteOnPinkWhite": {
    "background": "#ff3eb5",
    "foreground": "#ffffff",
    "foregroundAlt": "#000000",
    "highlightBackground": "#ffffff",
    "highlightForeground": "#000000",
    "sidebarBackground": "#ff3eb5",
    "sidebarForeground": "#ffffff",
    "sidebarButtonBackground": "#ffffff",
    "sidebarButtonForeground": "#ff3eb5",
    "windowBackground": "#ff3eb5"
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
  "tablet": "MB.ScrollTypeTablet",
  "unclean": "MB.ScrollTypeUnclean"
};

MB.weaponTypes = {
  "melee": "MB.WeaponTypeMelee",
  "ranged": "MB.WeaponTypeRanged"
};

// Config variables for the Scvmfactory character generator
MB.scvmFactory = {
  foodAndWaterPack: "morkborg.equipment-misc",
  foodItemName: "Dried food",
  waterItemName: "Waterskin",

  characterCreationPack: "morkborg.character-creation",
  startingEquipmentTable1: "Starting Equipment (1)",
  startingEquipmentTable2: "Starting Equipment (2)",
  startingEquipmentTable3: "Starting Equipment (3)",
  startingWeaponTable: "Starting Weapon",
  weaponDieIfRolledScroll: "1d6",
  startingArmorTable: "Starting Armor",
  armorDieIfRolledScroll: "1d2",
  terribleTraitsTable: "Terribler Traits",
  brokenBodiesTable: "Brokener Bodies",
  badHabitsTable: "Badder Habits",
};