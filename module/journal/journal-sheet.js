export class MBJournalSheet extends foundry.appv1.sheets.JournalSheet {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    // classes from super: ["sheet", "journal-sheet", "journal-entry"]
    options.classes.push("morkborg");
    return options;
  }
}
