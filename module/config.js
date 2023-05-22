// Namespace Configuration Values
export const MB = {};

MB.systemName = "morkborg";

// order of abilities on the character sheet
MB.abilitySheetOrder = ["strength", "agility", "presence", "toughness"];

MB.armorTiers = {
  0: {
    key: "MB.ArmorTierNone",
    damageReductionDie: "0",
    agilityModifier: 0,
    defenseModifier: 0,
  },
  1: {
    key: "MB.ArmorTierLight",
    damageReductionDie: "d2",
    agilityModifier: 0,
    defenseModifier: 0,
  },
  2: {
    key: "MB.ArmorTierMedium",
    damageReductionDie: "d4",
    agilityModifier: 2,
    defenseModifier: 2,
  },
  3: {
    key: "MB.ArmorTierHeavy",
    damageReductionDie: "d6",
    agilityModifier: 4,
    defenseModifier: 2,
  },
};

MB.colorSchemes = {
  blackOnYellowWhite: {
    background: "#ffe900",
    foreground: "#000000",
    foregroundAlt: "#808080",
    highlightBackground: "#ffffff",
    highlightForeground: "#000000",
    sidebarBackground: "#ffe900",
    sidebarForeground: "000000",
    sidebarButtonBackground: "#000000",
    sidebarButtonForeground: "#ffe900",
    windowBackground: "#ffe900",
  },
  blackOnWhiteBlack: {
    background: "#ffffff",
    foreground: "#000000",
    foregroundAlt: "#808080",
    highlightBackground: "#000000",
    highlightForeground: "#ffffff",
    sidebarBackground: "#ffffff",
    sidebarForeground: "#000000",
    sidebarButtonBackground: "#000000",
    sidebarButtonForeground: "#ffffff",
    windowBackground: "#ffffff",
  },
  foundryDefault: {
    background: "#f0f0e0",
    foreground: "#191813",
    foregroundAlt: "red",
    highlightBackground: "#191813",
    highlightForeground: "#f0f0e0",
    sidebarBackground: "url(../ui/denim.jpg) repeat",
    sidebarForeground: "#f0f0e0",
    sidebarButtonBackground: "#f0f0e0",
    sidebarButtonForeground: "#000000",
    windowBackground: "url(../ui/parchment.jpg) repeat",
  },
  whiteOnBlackYellow: {
    background: "#000000",
    foreground: "#ffffff",
    foregroundAlt: "#ffe900",
    highlightBackground: "#ffe900",
    highlightForeground: "#000000",
    sidebarBackground: "#000000",
    sidebarForeground: "#ffffff",
    sidebarButtonBackground: "#ffffff",
    sidebarButtonForeground: "#000000",
    windowBackground: "#000000",
  },
  whiteOnBlackPink: {
    background: "#000000",
    foreground: "#ffffff",
    foregroundAlt: "#ff3eb5",
    highlightBackground: "#ff3eb5",
    highlightForeground: "#000000",
    sidebarBackground: "#000000",
    sidebarForeground: "#ffffff",
    sidebarButtonBackground: "#ffffff",
    sidebarButtonForeground: "#000000",
    windowBackground: "#000000",
  },
  whiteOnPinkWhite: {
    background: "#ff3eb5",
    foreground: "#ffffff",
    foregroundAlt: "#000000",
    highlightBackground: "#ffffff",
    highlightForeground: "#000000",
    sidebarBackground: "#ff3eb5",
    sidebarForeground: "#ffffff",
    sidebarButtonBackground: "#ffffff",
    sidebarButtonForeground: "#ff3eb5",
    windowBackground: "#ff3eb5",
  },
};

MB.flags = {
  ATTACK_DR: "attackDR",
  DEFEND_DR: "defendDR",
  INCOMING_ATTACK: "incomingAttack",
  TARGET_ARMOR: "targetArmor",
};

MB.fontSchemes = {
  blackletter: {
    chat: "Alegreya",
    chatInfo: "Oswald",
    h1: "Blood Crow",
    h2: "FetteTrumpDeutsch",
    h3: "Old Cupboard",
    item: "Special Elite",
  },
  legible: {
    chat: "Alegreya",
    chatInfo: "Oswald",
    h1: "Blood Crow",
    h2: "Inconsolatazi4varl_qu",
    h3: "Old Cupboard",
    item: "Lato",
  },
};

MB.handed = {
  1: "MB.HandedOne",
  2: "MB.HandedTwo",
};

MB.actorTypes = {
  character: "character",
  creature: "creature",
  container: "container",
  follower: "follower",
};

MB.ammoTypes = {
  arrow: "MB.AmmoTypeArrow",
  bolt: "MB.AmmoTypeBolt",
  slingstone: "MB.AmmoTypeSlingstone",
};

MB.itemTypes = {
  ammo: "ammo",
  armor: "armor",
  class: "class",
  container: "container",
  feat: "feat",
  misc: "misc",
  scroll: "scroll",
  shield: "shield",
  weapon: "weapon",
};

MB.itemTypeKeys = {
  ammo: "MB.ItemTypeAmmo",
  armor: "MB.ItemTypeArmor",
  class: "MB.ItemTypeClass",
  container: "MB.ItemTypeContainer",
  feat: "MB.ItemTypeFeat",
  misc: "MB.ItemTypeMisc",
  scroll: "MB.ItemTypeScroll",
  shield: "MB.ItemTypeShield",
  weapon: "MB.ItemTypeWeapon",
};

// these Item types are "equipment"
MB.itemEquipmentTypes = [
  MB.itemTypes.ammo,
  MB.itemTypes.armor,
  MB.itemTypes.container,
  MB.itemTypes.misc,
  MB.itemTypes.scroll,
  MB.itemTypes.shield,
  MB.itemTypes.weapon,
];

MB.allowedContainerItemTypes = [
  MB.itemTypes.ammo,
  MB.itemTypes.armor,
  MB.itemTypes.misc,
  MB.itemTypes.scroll,
  MB.itemTypes.shield,
  MB.itemTypes.weapon,
];

MB.equippableItemTypes = [
  MB.itemTypes.armor,
  MB.itemTypes.shield,
  MB.itemTypes.weapon,
];

MB.droppableItemTypes = [MB.itemTypes.container];

MB.plusMinusItemTypes = [MB.itemTypes.ammo, MB.itemTypes.misc];

MB.scrollTypes = {
  sacred: "MB.ScrollTypeSacred",
  tablet: "MB.ScrollTypeTablet",
  unclean: "MB.ScrollTypeUnclean",
};

MB.weaponTypes = {
  melee: "MB.WeaponTypeMelee",
  ranged: "MB.WeaponTypeRanged",
};

// Config variables for the Scvmfactory character generator
MB.scvmFactory = {
  foodAndWaterPack: "morkborg.equipment-misc",
  foodItemName: "Dried food",
  waterItemName: "Waterskin",

  characterCreationPack: "morkborg.random-tables",
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

  // modules wanting to add more character classes to the generator should append uuids to this list
  classUuids: [
    // classless adventurer
    "Compendium.morkborg.class-classless-adventurer.p693pMIVYXMSRl8S",
    // cursed skinwalker
    "Compendium.morkborg.class-cursed-skinwalker.ZuSWpDI76OliQUrE",
    // dead god's prophet
    "Compendium.morkborg.class-dead-gods-prophet.BNOhaA4ebt6Bzx4E",
    // esoteric hermit
    "Compendium.morkborg.class-esoteric-hermit.ifSBk6ORiHgq3Xhr",
    // fanged deserter
    "Compendium.morkborg.class-fanged-deserter.2hjl45o4vXOgRgfq",
    // forlorn philosopher
    "Compendium.morkborg.class-forlorn-philosopher.L9Vwzbx5o0OMdJm0",
    // gutterborn scum
    "Compendium.morkborg.class-gutterborn-scum.gAx8MWLiZcjiWQvc",
    // heretical priest
    "Compendium.morkborg.class-heretical-priest.8CTmhMvQ5BJlGD2o",
    // occult herbmaster
    "Compendium.morkborg.class-occult-herbmaster.59HKbdpBIXfiJt91",
    // pale one
    "Compendium.morkborg.class-pale-one.wLJV0VJT5I234obT",
    // sacrilegious songbird
    "Compendium.morkborg.class-sacrilegious-songbird.Y0KSTCrUAQNoBKEX",
    // wretched royalty
    "Compendium.morkborg.class-wretched-royalty.0h5xOAtzV4mm7X7D",
  ],
};

MB.brokenPack = "morkborg.random-tables";
MB.brokenTable = "Broken";

MB.wieldPowerFumbleOn = 1;
MB.wieldPowerFumblePack = "morkborg.random-tables";
MB.wieldPowerFumbleTable = "Arcane Catastrophes";

MB.wieldPowerCritOn = 20;
MB.wieldPowerCritPack = null;
MB.wieldPowerCritTable = null;
