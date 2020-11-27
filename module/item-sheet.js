/*
 * @extends {ItemSheet}
 */
export class MBItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "item"],
//      template: "systems/foundry-morkborg/templates/item-sheet.html",
      width: 520,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }

  /** @override */
  get template() {
    const path = "systems/foundry-morkborg/templates";
    // Return a single sheet for all item types.
    if (this.item.data.type === "weapon") {
      return `${path}/${this.item.data.type}-sheet.html`;
    } else {
      return `${path}/item-sheet.html`;
    }
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html` -->.
    // return `${path}/${this.item.data.type}-sheet.html`;
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