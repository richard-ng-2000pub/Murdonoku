/*
 * MURDONOKU CONFIGURATION
 * The user-uploaded SVG examples are 1600x900 (16:9).
 * Rectangle measurements below refer to this reference canvas.
 * If your future 16:9 SVG layout changes, update ONLY these rectangles.
 * x/y = top-left; w/h = width/height; keep within reference dimensions.
 * All regions use the same original SVG; nothing is cropped permanently.
 */
window.MURDONOKU_CONFIG = Object.freeze({
  referenceWidth: 1600,
  referenceHeight: 900,
  regions: {
    sudoku:   { x: 30,   y: 145, w: 510, h: 722 },
    nonogram: { x: 550,  y: 145, w: 660, h: 722 },
    murderer: { x: 1222, y: 145, w: 346, h: 722 }
  },
  /* This is a warning/keyboard deterrent, NOT actual content security. */
  discourageInspection: true
});
