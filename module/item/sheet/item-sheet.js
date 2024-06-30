import { MB } from "../../config.js";

/*
 * @extends {ItemSheet}
 */
export class MBItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "item"],
      width: 600,
      height: 560,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/morkborg/templates/item";
    if (Object.keys(MB.itemTypeKeys).includes(this.item.type)) {
      // specific item-type sheet
      return `${path}/${this.item.type}-sheet.hbs`;
    } else {
      // generic item sheet
      return `${path}/item-sheet.hbs`;
    }
  }

  /** @override */
  async getData(options) {
    const superData = await super.getData(options);
    superData.config = CONFIG.MB;
    superData.data.system.description = await TextEditor.enrichHTML(
      superData.data.system.description
    );
    if (superData.data.scrollType) {
      superData.data.localizedScrollType = game.i18n.localize(
        MB.scrollTypes[superData.data.scrollType]
      );
    }
    return superData;
  }

  /**
   *  This is a small override to handle remembering the sheet's position.
   *  @override
   */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
