import { MB } from "./config.js";

/*
 * @extends {ItemSheet}
 */
export class MBItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }

  /** @override */
  get template() {
    const path = "systems/morkborg/templates";
    // TODO: fix enum and key lookup foo
//    if ([MB.itemTypes.armor, MB.itemTypes.container, MB.itemTypes.scroll, MB.itemTypes.weapon].includes(this.item.data.type)) {
    if (this.item.data.type === 'armor' || this.item.data.type === 'container' || this.item.data.type === 'scroll' || this.item.data.type === 'weapon') {
      // specific item-type sheet
      return `${path}/${this.item.data.type}-sheet.html`;
    } else {
      // generic item sheet
      return `${path}/item-sheet.html`;
    }
  }

  /** @override */
  async getData(options) {
    const data = super.getData(options);
    data.config = CONFIG.MB;
    return data;
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