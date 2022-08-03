import { MB } from "../../config.js";
import * as editor from "../../editor.js";

/*
 * @extends {ItemSheet}
 */
export class MBItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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
      return `${path}/${this.item.type}-sheet.html`;
    } else {
      // generic item sheet
      return `${path}/item-sheet.html`;
    }
  }

  /** @override */
  async getData(options) {
    const superData = super.getData(options);
    superData.config = CONFIG.MB;
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

  /** @override */
  activateEditor(name, options = {}, initialContent = "") {
    editor.setCustomEditorOptions(options);
    super.activateEditor(name, options, initialContent);
  }
}
