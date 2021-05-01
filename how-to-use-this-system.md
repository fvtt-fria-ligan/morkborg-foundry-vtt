# How to use this system

## General
This is an implementation of the MÖRK BORG rules, with limited adaptations to make things work in Foundry VTT. There are compendiums covering all the classes, items, creatures, and followers described in the MÖRK BORG book.

## Creating a character
  * Create a new Actor of type *character*. By default, a new character will have the *Adventurer* class (a fancier name for the default classless character).
  * If desired, drag a different Class from the particular class compendium (e.g., "Class - Fanged Deserter") folder onto your sheet.
    * Drag out class-specific feats or attacks (like the Fanged Deserter's bite attack) from the per-class compendium folder.
  * Use the RollTables in the *Character Creation* RollTable compendium folder. E.g., for the "You are what you own" starting equipment rolls, or for various class-specific random items.
  * Manually roll and update your abilities, hit points, silver, and omens.
  * If buying equipment, drag items from the various *Equipment* compendiums onto your character sheet.
  * Equip some items on your *Treasure* tab (using the little shield icon on the right of each item row), and they'll show up for use on your *Violence* tab.
  * Go kill stuff!

## The Scvmfactory
  * You can also create randomly-generated characters through the built-in *Scvmfactory*.
  * You can trigger random scvm generation in two ways:
    * GMs and players with "Create Actor" privileges will see a "Create Scvm" button at the top of the right sidebar *Actors Directory* tab. This will create a new character.
    * Every character sheet has a little skull icon button to the right of the current class. This will throwaway all items and stats from the current character, and replace it with a randomly-generated scvm. **Warning**: you cannot be undone.
  * Either trigger will show a dialog window, allowing you to choose which classes to include as possible random scvm fodder.
  * Scvmfactory will attempt to include any Item compendium with a name that begins "Class - ". E.g., "Class - Fanged Deserter".

## Inventory
  * All items in your possession show up on your *Treasures* tab.
  * Carrying capacity (encumbrance) is calculated as per the Mork Borg rules.
  * Items have a *carryWeight* field for how much they contribute to the total.
    * Most items are 1, with a few exceptions (e.g., the Wretched Royalty's Jester is an item with 0 carryWeight, since he can walk).
    * If you are encumbered (i.e., you are carrying more than your capacity), the rules for encumbrance will change color to alert you. You'll also see the effects on the DR for STR, AGI, and defense tests.
  * Container space and usage is also calculated.
    * Items of type *container* have a capacity field indicating how much they can hold. Your total item capacity is the sum of your containers' capacities.
    * Items have a *containerSpace* field indicating how much space they take up in a container. Most items are 1.
    * Containers do not count towards your container space.
    * Equipped items do not count towards your container space.
  * Misc items have a modifiable *quantity* field. You can more easily increase or decrease this using the "+" and "-" buttons that appear in the item row, in the *Treasures* tab.
    * You can combine quantity with carryWeight and containerSpace fields set less than zero, to allow "stacking" of items occupying less than 1 unit or occupying less than 1 slot.

## Combat
  * Initiative is handled by Foundry's Combat Tracker. All other combat rolls are handled from the *Violence* tab on a Character's sheet.
  * To start a battle:
    * Create a new Encounter in the Combat Tracker right sidebar tab. (Either through the *Create Encounter* plus button, or by selecting all desired tokens, right-clicking, and choosing *Toggle Combat State*.)
    * Roll for players begin / enemies begin by clicking the "Roll Party Initiative" (six-sided die icon) button on the Combat Tracker. The d6 roll and result will be shown in chat.
    * Roll initiative for each individual in the fight, using the d20 die icon button in the Combat Tracker. (GameMasters can also use their "Roll All" button.) Combatants will be first sorted according to token disposition (friendly vs. neutral/hostile), and then their individual initiative within the friendly/enemy grouping. E.g., if the Party Initiative roll was a 5 -- "Player Characters Begin" -- then friendly combatants will be show up higher on the Combat Tracker.
    * If desired, you can repeat "Roll Party Initiative" every round. Depending on the die roll, friendlies/enemies may be reordered to show up on top.
  * To use a weapon, armor, or shield, you need to equip it. You can do so on the *Treasures* tab. Any equippable items have a small shield icon next to their edit and delete buttons. Click the shield icon to make it turn yellow (equipped), and the item will appear on your *Violence* tab, ready for use. Note: you can only have a single armor and single shield equipped at one time.
  * Attacking
    * On the *Violence* tab of your character sheet, click the *Attack* button next to your weapon of choice.
    * A popup window will appear, prompting you for the DR of the attack (usually 12), as well as the target's armor damage reduction (e.g., 1d2).
    * The system will resolve your attack, calculating hit or miss, critical or fumble, damage and damage reduction. Everything will appear in a chat message "roll card".
    * Final damage can then be manually applied to the target (i.e., DM reduces the target creature's HPs on the creature sheet).
  * Defending
    * On the *Violence* tab of your character sheet, Click the *Defend* button.
    * A popup window will appear, prompting you for the DR of the defense (usually 12) and the incoming attack damage die (e.g., 1d6).
    * The system will resolve the defense, calculating dodge or hit, critical or fumble, damage and damage reduction. Everything will appear in a chat message "roll card".
    * It's up to you to manually apply the final damage (i.e., reduce your HPs on your character sheet).
  * Armor
    * Armor has both a current and a max tier. The current tier is shown on the *Violence* tab as a radio button. The current tier radio buttons won't let you choose a current tier higher than the armor's max tier. There is a zero tier shown, in case you want to wear useless armor. You're welcome?

## Health, Status, and Resting
  * It's up to you to keep track of death and infection.
  * There is a *Broken* button on the character sheet that will roll broken-ness, displaying the full result as a chat message.
  * There is a *Rest* button on the character sheet that will open a dialog window, where you can choose between short or long rest, eat or don't eat or starve, and whether you are infected.
    * Starvation and Infection will only damage you during long rests, but will prevent healing on both short and long rests.

## Powers
  * Any scrolls in your inventory will show up on both your sheet's *Treasures* and *Powers* tabs.
  * On the *Powers* tab, use the *Wield a Power* button to make a usage attempt roll.
    * The results of your roll vs. DR 12 will be shown as a chat message, along with any crit or fumble roll.
    * Failures cause you 1d2 damage and dizziness, also shown in the chat message.
    * It's up to you to manually roll an Arcane Catastrophe when you fumble.
  * It's up to you to prohibit using powers when wielding zwiehand weapons or medium/heavy armor.

## Creatures
  * Creatures can be dragged out from the *Creatures* compendium folder. 
  * Any attacks or defense for a creature is handled on the attacking/defending player's *Violence* tab. The attack and armor information shown on the creature sheet is "display only", and it's up to you to manually enter that on your Violence tab during a fight.

## Followers
  * Followers work similarly to characters. They have a *Violence* tab to fight and a *Treasures* tab for inventory, equipping weapons or armor, etc.
  * Followers can be dragged out of the Followers compendium folder. Give players permission to control a Follower via the right click *Configure Permissions* context menu in the Actors Directory in the sidebar.
  * It's up to you to enforce the rule that the *Wild Wickhead* will carry up to five items for you.
  * *Poltroon the Jester*, *Hamfund the Squire*, and *Barbarister the Incredible Horse* are implemented as both follower and items in the compendiums, so you can play them how you prefer.

## Container Actors
  * In addition to the usual *container* Item type (e.g., the backpack), there is a *container* Actor type. This allows you to option to represent things like the Small Wagon and Donkey as tokens on the map, store items separately inside them, etc.
  * Currently drag-and-drop from anything to a container actor will duplicate the dragged/dropped item. You have to manually delete it (or decrement quantity) from the source.

## Settings
  * There are user-configurable settings for alternate font and color schemes (upper right *Game Settings* icon button => *Configure Settings* button => *System Settings* tab). This can be helpful if anyone find the default fonts or colors hard to read, or if more eye-bleeding colors are desired :)
  * Pratar du svenska? Check out *Configure Settings* => *Core Settings* => *Language Preference* => **Svenska**.

## More Third-Party Content
If you want some third-party content, be sure to check out the [MÖRK BORG Third-Party Content](https://foundryvtt.com/packages/morkborg-3p) module, also installable from within Foundry. It includes additional classes, optional feats, roll tables, etc.

