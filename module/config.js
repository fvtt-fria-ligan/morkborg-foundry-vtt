// Namespace Configuration Values
export const MB = {};

MB.abilities = {
  "agility": "MB.AbilityAgility",
  "presence": "MB.AbilityPresence",
  "strength": "MB.AbilityStrength",
  "toughness": "MB.AbilityToughness"
};

// TODO: string or int, "light" or 1?
MB.armorTiers = {
  0: "MB.ArmorTierNone",
  1: "MB.ArmorTierLight",
  2: "MB.ArmorTierMedium",
  3: "MB.ArmorTierHeavy"
};

// TODO: string or int, "light" or 1?
MB.armorTierDamageReductionDie = {
  0: "1d0",
  1: "1d2",
  2: "1d4",
  3: "1d6"  
}

MB.handed = {
  1: "MB.HandedOne",
  2: "MB.HandedTwo"
};

MB.itemTypes = {
  "armor": "MB.ItemTypeArmor",
  "bounty": "MB.Bounty",
  "container": "MB.ItemTypeContainer",
  "creatureAttack": "MB.CreatureAttack",
  "misc": "MB.ItemTypeMisc",
  "scroll": "MB.ItemTypeScroll",
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