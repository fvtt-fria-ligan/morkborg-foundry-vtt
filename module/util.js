export class util {

    static activateEditor(name, options={}, initialContent="") {
      options.relative_urls = true;
      options.skin_url = "/systems/morkborg/styles/skins/mb"
      options.skin = "morkborg";
      super.activateEditor(name, options, initialContent);
    }

}