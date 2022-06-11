/* global engine, script, print, midi */

// Master function definition.
function BehringerCmdStudio2a () {}

// Shift/mode state variables.
BehringerCmdStudio2a.delButtonState = [false, false, false, false];
BehringerCmdStudio2a.scratchButtonState = [true, true, true, true];

// Button push/release state variables.
BehringerCmdStudio2a.pitchPushed = [[false, false, false, false], [false, false, false, false]];
BehringerCmdStudio2a.delPushed = false;
BehringerCmdStudio2a.delShiftUsed = false;
BehringerCmdStudio2a.fxAssignPushed = false;
BehringerCmdStudio2a.fxAssignShiftUsed = false;
BehringerCmdStudio2a.fxAssignLastGroup = '';

BehringerCmdStudio2a.initLEDs = function () {
  // (re)Initialise any LEDs that are direcctly controlled by this script.

  // Temporary turn everything blue

  midi.sendShortMsg(0x90, 0x08, 0x00); // Assign A A
  midi.sendShortMsg(0x90, 0x09, 0x00); // Assign A B
  midi.sendShortMsg(0x90, 0x38, 0x00); // Assign B A
  midi.sendShortMsg(0x90, 0x39, 0x00); // Assign B B
  midi.sendShortMsg(0x90, 0x01, 0x00); // Cue A
  midi.sendShortMsg(0x90, 0x31, 0x00); // Cue B
  midi.sendShortMsg(0x90, 0x02, 0x00); // Play A
  midi.sendShortMsg(0x90, 0x32, 0x00); // Play B
  midi.sendShortMsg(0x90, 0x16, 0x00); // Cue A A
  midi.sendShortMsg(0x90, 0x46, 0x00); // Cue B B
  midi.sendShortMsg(0x90, 0x22, 0x00); // vinyl
  midi.sendShortMsg(0x90, 0x23, 0x00); // mode
  midi.sendShortMsg(0x90, 0x25, 0x00); // Folder
  midi.sendShortMsg(0x90, 0x26, 0x00); // File
}

BehringerCmdStudio2a.init = function () {
  // Initialise anything that might not be in the correct state.
  BehringerCmdStudio2a.initLEDs();
}

BehringerCmdStudio2a.shutdown = function () {
  // Leave the deck in a properly initialised state.
  BehringerCmdStudio2a.initLEDs();
}

// The button that enables/disables scratching
BehringerCmdStudio2a.wheelTouch = function (channel, control, value, status, group) {
  var deck = script.deckFromGroup(group);

  if (value > 0) {
    // If button down
    // if (value === 0x7F) {  // Some wheels send 0x90 on press and release, so you need to check the value
    var alpha = 1.0 / 8;
    var beta = alpha / 32;
    engine.scratchEnable(deck, 128, 33 + 1 / 3, alpha, beta);
  } else {
    // If button up
    engine.scratchDisable(deck);
  }
}

// The wheel that actually controls the scratching
BehringerCmdStudio2a.wheelTurn = function (channel, control, value, status, group) {
  // For a control that centers on 0x40 (64):
  var newValue = value - 64;

  var deck = script.deckFromGroup(group);

  // Register the movement
  if (engine.isScratching(deck)) {
    engine.scratchTick(deck, newValue); // Scratch!
  } else {
    engine.setValue(group, 'jog', newValue); // Jog.
  }
}
