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
  * Equip some items on your *Treasure* tab using the little shield icon on the right, and they'll show up for use on your *Violence* tab.
  * Go kill stuff!

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
  * Initiative is handled by Foundry's Combat Tracker. All other combat rolls are handled from a Character's sheet on the *Violence* tab.
    * NOTE: There is an open dev TODO to make inventory work more like the official rules (player vs creature initiative, and being able to easily re-roll initiative each round.)
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

## Powers
  * Any scrolls in your inventory will show up on both your sheet's *Treasures* and *Powers* tabs.
  * On the *Powers* tab, use the *Wield a Power* button to make a usage attempt roll.
  * It's up to you to decide if the roll succeeds, and to manually deduct the usage from you Uses Remaining.
  * Crits and fumbles must also be manually identified and handled.
  * It's up to you to prohibit using powers when wielding zwiehand weapons or medium/heavy armor.

## Creatures
  * Creatures can be dragged out from the *Creatures* compendium folder. 
  * Any attacks or defense for a creature is handled on the attacking/defending player's *Violence* tab. The attack and armor information shown on the creature sheet is "display only", and it's up to you to manually enter that on your Violence tab during a fight.

## Followers
  * Followers work similarly to characters. They have a *Violence* tab to fight and a *Treasures* tab for inventory, equipping weapons or armor, etc.
  * Followers can be dragged out of the Followers compendium folder. Give players permission to control a Follower via the right click *Configure Permissions* context menu in the Actors Directory in the sidebar.
  * It's up to you to enforce the rule that the *Wild Wickhead* will carry up to five items for you.
  * *Poltroon the Jester* and *Hamfund the Squire* are implemented as both follower and items in the compendiums, so you can play them how you prefer.

