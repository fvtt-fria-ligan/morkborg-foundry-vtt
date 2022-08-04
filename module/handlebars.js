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
    "systems/morkborg/templates/actor/character/feats-tab.html",
    "systems/morkborg/templates/actor/character/obituary-tab.html",
    "systems/morkborg/templates/actor/character/powers-tab.html",
    "systems/morkborg/templates/actor/character/sheet-header.html",
    "systems/morkborg/templates/actor/character/treasures-tab.html",
    "systems/morkborg/templates/actor/common/equipment-list.html",
    "systems/morkborg/templates/actor/common/violence-tab.html",
    "systems/morkborg/templates/item/common/base-fields.html",
    "systems/morkborg/templates/item/common/description-tab.html",
    "systems/morkborg/templates/item/common/quantity-field.html",
    "systems/morkborg/templates/item/common/sheet-header.html",
    "systems/morkborg/templates/item/common/sheet-tabs.html",
  ]);
};
