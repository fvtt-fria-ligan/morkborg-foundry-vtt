# How to use this system

## General

This is an implementation of the MÖRK BORG rules, with limited adaptations to make things work in Foundry VTT. There are compendiums covering all the classes, items, creatures, and followers described in the MÖRK BORG book.

## Creating a character

- Create a new Actor of type _character_. By default, a new character will have the _Adventurer_ class (a fancier name for the default classless character).
- If desired, drag a different Class from the particular class compendium (e.g., "Class - Fanged Deserter") folder onto your sheet.
  - Drag out class-specific feats or attacks (like the Fanged Deserter's bite attack) from the per-class compendium folder.
- Use the RollTables in the _Character Creation_ RollTable compendium folder. E.g., for the "You are what you own" starting equipment rolls, or for various class-specific random items.
- Manually roll and update your abilities, hit points, silver, and omens.
- If buying equipment, drag items from the various _Equipment_ compendiums onto your character sheet.
- Equip some items on your _Treasure_ tab (using the little shield icon on the right of each item row), and they'll show up for use on your _Violence_ tab.
- Go kill stuff!

## The Scvmfactory

- You can also create randomly-generated characters through the built-in _Scvmfactory_.
- You can trigger random scvm generation in two ways:
  - GMs and players with "Create Actor" privileges will see a "Create Scvm" button at the top of the right sidebar _Actors Directory_ tab. This will create a new character.
  - Every character sheet has a little skull icon button to the right of the current class. This will throwaway all items and stats from the current character, and replace it with a randomly-generated scvm. **Warning**: this cannot be undone.
- Either trigger will show a dialog window, allowing you to choose which classes to include as possible random scvm fodder.
- Scvmfactory will attempt to include any Item compendium with a name that begins "Class - ". E.g., "Class - Fanged Deserter".

## Inventory

- All items in your possession show up on your _Treasures_ tab.
- Carrying capacity (encumbrance) is calculated as per the Mork Borg rules.
- Items have a _carryWeight_ field for how much they contribute to the total.
  - Most items are 1, with a few exceptions (e.g., the Wretched Royalty's Jester is an item with 0 carryWeight, since he can walk).
  - If you are encumbered (i.e., you are carrying more than your capacity), the rules for encumbrance will change color to alert you. You'll also see the effects on the DR for STR, AGI, and defense tests.
- Container space and usage is also calculated.
  - Items of type _container_ have a capacity field indicating how much they can hold. Your total item capacity is the sum of your containers' capacities.
  - Items have a _containerSpace_ field indicating how much space they take up in a container. Most items are 1.
  - Containers do not count towards your container space.
  - Equipped items do not count towards your container space.
- Misc items have a modifiable _quantity_ field. You can more easily increase or decrease this using the "+" and "-" buttons that appear in the item row, in the _Treasures_ tab.
  - You can combine quantity with carryWeight and containerSpace fields set less than zero, to allow "stacking" of items occupying less than 1 unit or occupying less than 1 slot.

## Combat

- Combat rolls are handled from the _Violence_ tab on a Character's sheet.
- Party and Individual initiative can be handled either with or without Foundry's Combat Tracker.
  - With: GameMaster has started a Combat Encounter and added players and enemies to it. Party Initiative will sort combatants ("Players go first", "Enemies go first") based on their token disposition (friendly is a player/ally, neutral or hostile is an enemy), and Individual Initiative will sort combatants within that grouping. There are also buttons on the combat tracker for party initiative (6-sided die icon) and individual initiative (regular 20-sided die icon).
  - If desired, you can repeat "Roll Party Initiative" every round. Depending on the die roll, friendlies/enemies may be reordered to show up on top.
  - Without: initiative buttons will show messages in chat, but it's up to you to track the ordering.
- To use a weapon, armor, or shield, you need to equip it. You can do so on the _Treasures_ tab. Any equippable items have a small shield icon next to their edit and delete buttons. Click the shield icon to make it turn yellow (equipped), and the item will appear on your _Violence_ tab, ready for use. Note: you can only have a single armor and single shield equipped at one time.
- Attacking
  - On the _Violence_ tab of your character sheet, click the _Attack_ button next to your weapon of choice.
  - A popup window will appear, prompting you for the DR of the attack (usually 12), as well as the target's armor damage reduction (e.g., 1d2).
  - The system will resolve your attack, calculating hit or miss, critical or fumble, damage and damage reduction. Everything will appear in a chat message "roll card".
  - Final damage can then be manually applied to the target (i.e., DM reduces the target creature's HPs on the creature sheet).
- Defending
  - On the _Violence_ tab of your character sheet, Click the _Defend_ button.
  - A popup window will appear, prompting you for the DR of the defense (usually 12) and the incoming attack damage die (e.g., 1d6).
  - The system will resolve the defense, calculating dodge or hit, critical or fumble, damage and damage reduction. Everything will appear in a chat message "roll card".
  - It's up to you to manually apply the final damage (i.e., reduce your HPs on your character sheet).
- Armor
  - Armor has both a current and a max tier. The current tier is shown on the _Violence_ tab as a radio button. The current tier radio buttons won't let you choose a current tier higher than the armor's max tier. There is a zero tier shown, in case you want to wear useless armor. You're welcome?

## Health, Status, and Resting

- It's up to you to keep track of death and infection.
- There is a _Broken_ button on the character sheet that will roll broken-ness, displaying the full result as a chat message.
- There is a _Rest_ button on the character sheet that will open a dialog window, where you can choose between short or long rest, eat or don't eat or starve, and whether you are infected.
  - Starvation and Infection will only damage you during long rests, but will prevent healing on both short and long rests.

## Powers

- Any scrolls in your inventory will show up on both your sheet's _Treasures_ and _Powers_ tabs.
- On the _Powers_ tab, use the _Wield a Power_ button to make a usage attempt roll.
  - The results of your roll vs. DR 12 will be shown as a chat message, along with any crit or fumble roll.
  - Failures cause you 1d2 damage and dizziness, also shown in the chat message.
  - It's up to you to manually roll an Arcane Catastrophe when you fumble.
- It's up to you to prohibit using powers when wielding zwiehand weapons or medium/heavy armor.

## Creatures

- Creatures can be dragged out from the _Creatures_ compendium folder.
- Any attacks or defense for a creature is handled on the attacking/defending player's _Violence_ tab. The attack and armor information shown on the creature sheet is "display only", and it's up to you to manually enter that on your Violence tab during a fight.

## Followers

- Followers work similarly to characters. They have a _Violence_ tab to fight and a _Treasures_ tab for inventory, equipping weapons or armor, etc.
- Followers can be dragged out of the Followers compendium folder. Give players permission to control a Follower via the right click _Configure Permissions_ context menu in the Actors Directory in the sidebar.
- It's up to you to enforce the rule that the _Wild Wickhead_ will carry up to five items for you.
- _Poltroon the Jester_, _Hamfund the Squire_, and _Barbarister the Incredible Horse_ are implemented as both follower and items in the compendiums, so you can play them how you prefer.

## Container Actors

- In addition to the usual _container_ Item type (e.g., the backpack), there is a _container_ Actor type. This gives you the option to represent things like the Small Wagon and Donkey as tokens on the map, store items separately inside them, etc.
- Currently drag-and-drop from anything to a container actor will duplicate the dragged/dropped item. Drag and drop to/from contain actors is _destructive_ - a drag-dropped item should get added to the dragged-from, and added to the dragged-to.
- There is a _Containers_ compendium with the Small Wagon and Donkey.

## Settings

- There are user-configurable settings for alternate font and color schemes (upper right _Game Settings_ icon button => _Configure Settings_ button => _System Settings_ tab). This can be helpful if anyone find the default fonts or colors hard to read, or if more eye-bleeding colors are desired :)
- Pratar du svenska? Check out _Configure Settings_ => _Core Settings_ => _Language Preference_ => **Svenska**.

## Adding New Custom Classes That Work With the Generator

- Create a new class item (Right side bar, Items tab/icon, Create Item button, give it a name and choose type "class"). The Class edit sheet will appear.
- Click on the Details tab.
- In the details tab, fill out the various fields:
  - Description: appears in the generated character's description textbox.
  - Silver: starting silver roll formula. E.g., 2d6*10.
  - Strength, Agility, Presence, Toughness: starting ability roll formulas. E.g., 3d6-2, 3d6, 3d6+1.
  - Weapon table: Roll formula for the weapon table. E.g., 1d6.
  - Armor table: Roll formula for the armor table. E.g., 1d4.
  - Items: A multi-line textarea that specifies what items a character of this class should automatically start with. 
    Each line is a comma-separated value of the format [compendium name],[item name].
    E.g., `morkborg.mork-borg-items,Bite Attack.`
  - Rolls: A multi-line textarea that specifies what rolls a character of this class should make. 
    Each line is a comma-separate value of the format [compendium name],[table name],[number of rolls].
    E.g., `morkborg.mork-borg-tables,Fanged Deserter Items,1`
    If the table roll result is an item, that item will be added to the character. If the table result is text, it will be added to the character     description.
- Get the Foundry UUID (universal unique identifier) for this new class item. 
  E.g., Compendium.morkborg.mork-borg-items.2hjl45o4vXOgRgfq
  An easy way to get this identifier is to drag the item into a journal page you're editing.
- Add the new class item UUID to the list of class UUIDs used by the character generator. There are a couple ways to do this.
  - Hacky but easy: Find your Foundry systems directory, and manually edit systems/morkborg/module/config.js. There's an array called "classUuids"; add the new class UUID to the list. The downside of this is your edit will get overwritten as soon as you upgrade the system.
  - The right way but more work: Create a world script that adds the class UUID to the list. Such a script would have code like this:

```
Hooks.once('init', () => {
  // add our additional classes to the scvmfactory generator
  CONFIG.MB.scvmFactory.classUuids.push(
    // shedding vicar
    "Compendium.morkborg-cult-heretic.heretic-items.UVVq3NRo9CZcbdcp"
  );
});
```

## More Third-Party Content

If you want some third-party content, be sure to check out the [MÖRK BORG Third-Party Content](https://foundryvtt.com/packages/morkborg-3p) module, also installable from within Foundry. It includes additional classes, optional feats, roll tables, etc.
