import {
  log,
  getIndex,
  getRealX,
  getRealY,
  randomBetween,
} from './utils';

import {
  CELLS,
  WEAPON_CELLS,
} from './constants';

class Cell {
  constructor({
    row,
    column,
    size,
    columns,
  }) {
    this.row = row;
    this.column = column;
    this.size = size;
    this.index = getIndex({ row, column, columns});
    this.type = 'GROUND';

    this.animationStep = 0;
    this.animationStepCounter = 0;
    this.isAnimated = false;

    this.isOccupied = false;
    this.isPlayerOccupied = false;

    this.shouldRedraw = false;
    this.state = null;

    this.hasAnimatedObject = false;
    this.animatedObjectType = null;
  }

  clear({ ctx, background, blockSize}) {
    const realX = getRealX({
      column: this.column,
      blockSize,
      xOffset,
    });

    const realY = getRealY({
      row: this.row,
      blockSize,
      yOffset,
    });

    ctx.fillStyle = background;
    ctx.clearRect(realX, realY, blockSize, blockSize);
    ctx.fillRect(realX - 1, realY - 1, blockSize + 2, blockSize + 2);
  }

  draw({ ctx, blockSize, xOffset, yOffset, player }) {
    const realX = getRealX({
      column: this.column,
      blockSize,
      xOffset,
    });

    const realY = getRealY({
      row: this.row,
      blockSize,
      yOffset,
    });

    let cellType = CELLS[this.type];

    const color = cellType.color;
    let letter = cellType.letter;

    let hasLayer = false;

    if (window.__DEBUG__) {
      letter = this.index;
    }

    if (this.isPlayerOccupied) {
      cellType = CELLS['PLAYER'];

      if (player.direction) {
        hasLayer = true;
      }
    }
    
    if (this.hasAnimatedObject) {
      cellType = WEAPON_CELLS[this.animatedObjectType];
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    if (cellType.letterOptions && cellType.letterOptions.length) {
      ctx.fillText(
        cellType.letterOptions[
          randomBetween(0, cellType.letterOptions.length - 1)
        ],
        realX + (blockSize / 2), realY + (blockSize / 2)
      );
    } else if (cellType.hasState) {
      ctx.fillText(cellType.states[this.state].letter, realX + (blockSize / 2), realY + (blockSize / 2));
    } else {
      ctx.fillText(letter, realX + (blockSize / 2), realY + (blockSize / 2));
    }
  
    if (hasLayer) {
      ctx.fillStyle = LAYER_CELLS[player.direction].color;
      // ctx.strokeStyle = LAYER_CELLS[player.direction].color;
      ctx.fillText(LAYER_CELLS[player.direction].letter, realX + (blockSize / 2), realY + (blockSize / 2));
    }

    if (window.__DEBUG__) {
      ctx.strokeRect(realX, realY, blockSize, blockSize);
    }
  }
}

export default Cell;
