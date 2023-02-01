export const configureHandlebars = () => {
  // Handlebars helpers
  // TODO: registering a helper named "eq" breaks filepicker
  Handlebars.registerHelper("ifEq", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifGe", function (arg1, arg2, options) {
    return arg1 >= arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifGt", function (arg1, arg2, options) {
    return arg1 > arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifLe", function (arg1, arg2, options) {
    return arg1 <= arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifLt", function (arg1, arg2, options) {
    return arg1 < arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifNe", function (arg1, arg2, options) {
    // TODO: verify whether we want == or === for this equality check
    return arg1 != arg2 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("ifPrint", function (cond, v1) {
    return cond ? v1 : "";
  });
  Handlebars.registerHelper("ifPrintElse", function (cond, v1, v2) {
    return cond ? v1 : v2;
  });
  Handlebars.registerHelper("abbreviate", function (string, data) {
    const localString = "MB.Ability" + string + "Abbrev";
    const result = game.i18n.localize(localString) === localString
    ? (string.slice(0,3)).toUpperCase()
    : game.i18n.localize(localString);
    return result;
  });
  Handlebars.registerHelper("abilityLabelClass", function (string) {
    string = string.label;
    if(!["Agility", "Presence", "Strength", "Toughness"].includes(string)) {
      return "custom " + string.toLowerCase();
    };
    return string.toLowerCase();
  });
  Handlebars.registerHelper("createName", function (string) {
    return "system.abilities." + string.toLowerCase() + ".value";
  });


  // https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
  Handlebars.registerHelper("times", function (n, block) {
    let accum = "";
    for (let i = 0; i < n; i++) {
      accum += block.fn(i);
    }
    return accum;
  });

  /**
   * Formats a Roll as either the total or x + y + z = total if the roll has multiple terms.
   */
  Handlebars.registerHelper("xtotal", (roll) => {
    // collapse addition of negatives into just subtractions
    // e.g., 15 +  - 1 => 15 - 1
    // Also: apparently roll.result uses 2 spaces as separators?
    // We replace both 2- and 1-space varieties
    const result = roll.result.replace("+  -", "-").replace("+ -", "-");

    // roll.result is a string of terms. E.g., "16" or "1 + 15".
    if (result !== roll.total.toString()) {
      return `${result} = ${roll.total}`;
    } else {
      return result;
    }
  });

  loadTemplates([
    "systems/morkborg/templates/actor/character/feats-tab.hbs",
    "systems/morkborg/templates/actor/character/obituary-tab.hbs",
    "systems/morkborg/templates/actor/character/powers-tab.hbs",
    "systems/morkborg/templates/actor/character/sheet-header.hbs",
    "systems/morkborg/templates/actor/character/treasures-tab.hbs",
    "systems/morkborg/templates/actor/common/equipment-list.hbs",
    "systems/morkborg/templates/actor/common/npc-header.hbs",
    "systems/morkborg/templates/actor/common/violence-tab.hbs",
    "systems/morkborg/templates/common/description-tab.hbs",
    "systems/morkborg/templates/item/common/base-fields.hbs",
    "systems/morkborg/templates/item/common/quantity-field.hbs",
    "systems/morkborg/templates/item/common/sheet-header.hbs",
    "systems/morkborg/templates/item/common/sheet-tabs.hbs",
  ]);
};
