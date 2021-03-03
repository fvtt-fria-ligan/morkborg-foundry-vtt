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
