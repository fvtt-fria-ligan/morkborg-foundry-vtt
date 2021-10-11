# 1.1.0
- Added support for Feat rollMacro field.
- Changed Scvmfactory to set new random name when scvmifying existing character.
- Moved numerous scvmfactory config values into MB.scvmfactory.
- Fixed dice API error appearing in console.
- Fixed bug in weapon/feat macro drop using a non-existent item id field.

# 1.0.9
- Fixed logic for equip a weapon help text showing.

# 1.0.8
- Fixed torch quantity.
- Added support for new scroll type: Tablet of Ochre Obscurity.
- Compatibility with Foundry 0.8.9.

# 1.0.7
- Fixed party initiative button on the combat tracker.
- Marked system as compatible with Foundry 0.8.8.

# 1.0.6
- Added Party and Individual initiative buttons to character and follower sheet violence tab.
- Added new misc item icons from vil.
- Fixed 0.8.x-related issues with Party initiative and the combat tracker.
- Marked system as compatible with Foundry 0.8.7.

# 1.0.5
- Fixed several broken fields on item sheets: weapon damage die, scroll type, default item carry weight.
- Fixed armor/shield not being used in defense.
- Fixed numerous warning messages.

# 1.0.4
- Added Terribler Traits, Brokener Bodies, and Badder Habits tables.
- Added trait/body/habit rolls to Scvmfactory character generation.

# 1.0.3
- Fixed default class for new Character actors.

# 1.0.2
- Fixed description on various item sheets.

# 1.0.1
- Fixed character capacity/container calculations.
- Fixed container destructive drag-drop.

# 1.0.0
- Compatibility with Foundry 0.8.6.

# 0.3.9
- Fixed create item function on actors. 

# 0.3.8
- Fixed broken template paths.

# 0.3.7
- Added inventory plus / minus buttons to follower sheet.
- Implemented destructive drag-and-drop for container actor inventory.
- Set sensible default disposition. actor link, and vision for all actor types.
- Added "Foundry default" color scheme.
- Made minor tweaks to color styling of various Foundry UI elements, so things are visible for all color schemes.

# 0.3.6
- Implemented "container" type actors, to allow having shared containers as tokens on the map.
- Added "Containers" actor compendium pack, with Small Wagon and Donkey.
- Added Barbarister as a follower.
- Added tokens for wagon, donkey, and Barbarister.
- Lowered donkey capacity to 15.

# 0.3.5
- Implemented support for broken, as a button on the character sheet + custom roll card.

# 0.3.4
- Fixed bug when using Scvmfactory from Foundry console.

# 0.3.3
- Fixed bug when calling Scvmfactory from character sheet.

# 0.3.2
- Added checkboxes to select generated classes to Scvmfactory dialog.
- Updated Scvmfactory to include all compendiums with name prefix "class-".

# 0.3.1
- Added "Scumify" skull-button and confirmation dialog to character sheet, to allow players to re-roll their characters.
- Changed "Create Scvm" button to show for any user with permissions to create actors.
- Add minimum 1 hp and 0 power uses for newly-rolled characters.
- Fixed newly-rolled characters to have correct default disposition, actor link, and vision.
- Added cancel button to "Get Better" dialog.
- Made all weapon/armor/feat/scroll/item names hoverable and clickable, to open the item sheet.
- Changed item sheet to default to description tab.

# 0.3.0
- Added GM-visible "Create Scvm" button and character generation... AKA "The Scvmfactory".
- Added fields to Class schema to allow auto-generation.
- Populated new fields for all classes.
- Moved class-specific roll tables into separate Compendiums. E.g., "Rolls - Fanged Deserter".
- Added new roll tables for various class creation rolls. E.g., Gutterborn Scum's "Bad Birth".
- Renamed "You are What You Own" roll tables to "Starting Equipment".
- Added "All Scrolls" roll table to allow random draw of both sacred + unclean scrolls.
- Fixed typo in Rest dialog text.
- Fixed img path for Silver Crucifix in equipment roll table.
- Fixed potion and poison weights to be 0.25. I.e., 4 doses per inventory slot.
- Added Stealthy feat for Gutterborn Scum.

# 0.2.12
- Added "Get Better" button to roll Getting Better (hp, abilities, left in the debris).

# 0.2.11
- Added new Rest dialog window to select long/short rest, eat/donteat/starve, infected-or-not choices.
- Created new "Wield a Power" chat roll card, showing success/failure, damage & dizziness, etc.
- Made "Wield a Power" deduct power uses.
- Show "no power uses remaining" when attempting to use a power when <1 power uses remaining.
- Added standard-style roll cards for omens and power uses rolls.
- Changed defend dialog to default to 1d4 attack.
- Fixed typo in Palms scroll.
- Made crossbow 2-handed.

# 0.2.10
- Added back MB.PartyInitiative translation.

# 0.2.9
- Added "Roll Party Initiative" button to Combat Tracker, along with custom chat roll card.
- Added Combat Tracker sorting by player/monsters, based on party initiative roll and token disposition (friendly vs. neutral/hostile).
- Added more misc item icons from Vil!
- Added better display of target DR and "exploded" roll result for Attack and Defend chat roll cards.
- Added back accidentally deleted Bite Attack for Fanged Deserter.
- Added back accidentally deleted Hook Hand weapon.

# 0.2.8
- Fixed bug where agility was incorrectly used instead of presence for ranged attacks.

# 0.2.7
- Fixed bug with setting new character default adventurer class.
- Fixed omens and powers rolls not properly updating fields.

# 0.2.6
- New container and misc item icons from Vil!
- Re-added "Armored Caster" Heretical Priest feat.
- Fixed Toughness test roll bug.

# 0.2.5
- Reorganized compendiums. 
- Broke up big class items/feats into separate per-class compendiums.
- Re-did roll tables for new compendiums.
- Added "Class - " and "Equipment - " prefixes to compendium names for better sorting.

# 0.2.4
- Added quantity for misc inventory type, along with +/- buttons.
- Added weapon compendium items for arrows, bolts, and sling stones.
- Added drag-and-drop macro toolbar support for weapons, armor/shield, feats, and scrolls.
- Changed default tab on item sheets to Details (instead of Description).
- Added "Equip armor to absorb damage" message when no armor/shield equipped.
- Added "You have no Feats/Scrolls" messages when no feats/scrolls.

# 0.2.3
- New armor, follower, and item icons from vil!
- Updated compendiums to refer to all creatures by type (e.g., "Goblin") and not by first name (e.g., "Seth").
- Added tier 0 for armor, so players can wear useless armor. You're welcome?
- Fixed Dice So Nice integration so dice rolls show up for all players.
- Fixed heretical priest crucifix item to read "MʁOИҼ ՂEƧꓵƧ".
- Updated creature, follower, and item sheets to show bigger images.
- Removed now-unneeded alt name field from creature and follower sheets.
- Updated all item sheets to show item type.
- Added followers for Hamfund and Poltroon. Now you can play them as either RP-only items on a character sheet or as actual followers on the map.

# 0.2.2
- New token assets from iPwnedMSCS and Nohr!
- New weapon icon assets from vil!
- Added short and long rest buttons for hit point regain.
- Fixed adding container items to followers.
- Changed color and font scheme settings to be per-user.
- Changed settings alt-text / notes styling to be less obnoxious.

# 0.2.1
- Fixed github release workflow to include new css dir.

# 0.2.0
*NOTE:* 0.2.0 migrates a variety of world data. *PLEASE BACK UP YOUR WORLD(S) BEFORE UPGRADING!*
- Added default 12 DR for attack and defense dialogs.
- Added support for armor and encumbrance DR modifiers (strength and agility tests, defense).
- Switched to Alegreya font for default chat text, for better readability.
- Fixed You are What You Own (2) roll table.
- Fixed metal file and lockpicks roll table entry to return two objects.
- Added new "Feat" item type to represent special abilities and feats.
- Added Class Feats compendium with feats for all classes.
(Note: you have to manually drag these to the Character sheet yourself.)
- Fixed character actor creation to default token link, vision, and disposition.
- Added data migration framework.
- Added migrations to clean up numerous fields: actor hp, omens, powerUses, str/agi/pre/tou; armor tier.
- Modified hp, omens, and powerUses to be usable as token resource bars.
- Set hp as primary attribute in system.
- Switched to scss, gulp, and yarn under the hood.
- Added system settings for font and color schemes.
- Added initial color schemes (a la scvmbirther) and fonts (blackletter, legible).
- Fixed Dice So Nice integration for attack, defense, and ability tests.
- Made flail and battle axe 1h.
- Added roll tables for class-specific starting items/feats.
- Added Portable Laboratory item for Occult Herbmaster.

# 0.1.8
- Added dialog popup for attack and defend to prompt for DR and target armor / incoming attack. Last entered values are persisted for easier repeat actions.
- Updated attack and defend logic to check DR before rolling damage / soak.
- Updated attack and defend roll cards to show outcome text (e.g., "Hit", "Miss", "Dodge") as well as crit/fumbles.
- Implemented crits and fumbles for attack and defend.
- Violence tab now shows "Equip a weapon to attack" message if no weapons are equipped.
- Fixed Player Configuration dialog style for readability.

# 0.1.7
- Changed character sheet header to allow center column to expand with window.
- Changed character class name to show icon instead of "Class:" text.
- Fixed Class item sheet name text style.
- Fixed select and textfield style on Journal dialog window.
- Fixed creature and follower name textfield width.
- Added alternateName field to followers and follower sheet.
- Populated alternateName to "outcast" in follower compendium.
- Added morale button to Follower sheet.
- Added reaction and morale buttons to Creature sheet.
- Improve readability for Journal text style.
- Tweaked chat message style for readability.
- Added numbered list button to editor toolbar.
- Changed unordered (bullet) lists to ordered (number) in class and follower detail text.

# 0.1.6
- Fixed font and button color issues on Journal image tab.

# 0.1.5
- Fixed hard-to-read dark text on various system Dialogs and tabs.
- Added initial Swedish translations.

# 0.1.4
- Combined multiple Attack and Defend chat rolls into unified roll cards.
- Code cleanup (translation keys, commented-out code).
- Added CHANGELOG.md

# 0.1.3
- Updated editor and journal style.
- Fixed bug where enter on Character sheet textfield would submit Attack button.

# 0.1.2
- Use github workflow for automated release.
- Fixed omens roll on character sheet header.
- Character now gets default Class (Adventurer) at creation time.

# 0.1.1
- Fixed Module Management list item text color.

# 0.1.0
- First public release.
