(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.dung = factory());
}(this, (function () { 'use strict';

function log(...messages) {
  if (window.__DEV__) {
    console.log(...messages);
  }
}

function randomBetween(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

function getScreenSize(parent) {
  return {
    height: parent.innerHeight,
    width: parent.innerWidth
  };
}

function getIndex({ row, column, columns }) {
  return column + row * columns;
}

function getRealX({ column, blockSize, xOffset }) {
  return column * blockSize + xOffset;
}

function getRealY({ row, blockSize, yOffset }) {
  return row * blockSize + yOffset;
}

function calculateMapPlacement({
  screenWidth,
  screenHeight,
  mapWidth,
  mapHeight
}) {
  const xCenter = screenWidth / 2;
  const xOffset = xCenter - mapWidth / 2;
  const yCenter = screenWidth / 2;
  const yOffset = yCenter - mapHeight / 2;

  return {
    xOffset,
    yOffset
  };
}

function getCanvasContext(canvasElement) {
  return canvasElement.getContext('2d');
}

function setupCanvas({
  element,
  context,
  height,
  width,
  background,
  blockSize,
  fontScale
}) {
  element.height = height;
  element.width = width;

  context.fillStyle = background;
  context.font = `${blockSize * fontScale}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillRect(0, 0, width, height);
}

const CELLS = {
  GROUND: {
    letter: '•',
    color: 'grey',
    isAnimated: false,
    isPassable: true
  },
  FLOOR: {
    letter: '*',
    color: 'grey',
    isAnimated: false,
    isPassable: true
  },
  WALL: {
    letter: '#',
    color: 'darkslategray',
    isAnimated: false,
    isPassable: false
  },
  PATH: {
    letter: '/',
    color: 'grey',
    isAnimated: false,
    isPassable: true
  },
  WATER: {
    letter: '-',
    color: 'royalblue',
    isAnimated: true,
    steps: ['-', '-', '~'],
    framesPerStep: 25,
    startOnRandomStep: true,
    isPassable: false
  },
  LAVA: {
    letter: '-',
    color: 'orangered',
    isAnimated: true,
    steps: ['-', '-', '~', '˚', '-', '-', '~'],
    framesPerStep: 15,
    startOnRandomStep: true,
    isPassable: false
  },
  PLAYER: {
    letter: 'Ϙ',
    color: 'green',
    isAnimated: false,
    isPassable: true
  },
  DOOR: {
    letter: 'D',
    color: 'peru',
    hasState: true,
    isPassable: false,
    isActionable: true,
    states: {
      OPEN: {
        letter: 'O',
        isPassable: true
      },
      CLOSED: {
        letter: 'D',
        isPassable: false
      },
      LOCKED: {
        letter: 'L',
        isPassable: false
      }
    },
    defaultState: 'CLOSED'
  }
};

const WEAPON_CELLS = {
  EMPTY_ATTACK: {
    framesPerStep: 2,
    steps: ['˟', '•'],
    color: 'silver'
  }
};

class Cell {
  constructor({
    row,
    column,
    size,
    columns
  }) {
    this.row = row;
    this.column = column;
    this.size = size;
    this.index = getIndex({ row, column, columns });
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

  draw({ ctx, blockSize, xOffset, yOffset, player }) {
    const realX = getRealX({
      column: this.column,
      blockSize,
      xOffset
    });

    const realY = getRealY({
      row: this.row,
      blockSize,
      yOffset
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
      ctx.fillText(cellType.letterOptions[randomBetween(0, cellType.letterOptions.length - 1)], realX + blockSize / 2, realY + blockSize / 2);
    } else if (cellType.hasState) {
      ctx.fillText(cellType.states[this.state].letter, realX + blockSize / 2, realY + blockSize / 2);
    } else {
      ctx.fillText(letter, realX + blockSize / 2, realY + blockSize / 2);
    }

    if (hasLayer) {
      ctx.fillStyle = LAYER_CELLS[player.direction].color;
      // ctx.strokeStyle = LAYER_CELLS[player.direction].color;
      ctx.fillText(LAYER_CELLS[player.direction].letter, realX + blockSize / 2, realY + blockSize / 2);
    }

    if (window.__DEBUG__) {
      ctx.strokeRect(realX, realY, blockSize, blockSize);
    }
  }
}

class Map {
  constructor({
    parentHeight,
    parentWidth,
    mapHeight,
    mapWidth,
    blockSize
  }) {
    this.cells = [];

    this.meta = {
      blockCount: 0,
      blockSize,
      rows: 0,
      columns: 0,
      xOffset: 0,
      yOffset: 0,
      parentHeight,
      parentWidth,
      mapHeight,
      mapWidth
    };
  }

  generateCells() {
    const columns = this.meta.mapWidth / this.meta.blockSize;
    const rows = this.meta.mapHeight / this.meta.blockSize;
    const blockCount = rows * columns;

    this.meta.columns = columns;
    this.meta.rows = rows;
    this.meta.blockCount = blockCount;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        this.cells.push(new Cell({
          row: r,
          column: c,
          blockSize: this.meta.blockSize,
          columns: this.meta.columns
        }));
      }
    }

    const offset = calculateMapPlacement({
      screenHeight: this.meta.parentHeight,
      screenWidth: this.meta.parentWidth,
      mapHeight: this.meta.mapHeight,
      mapWidth: this.meta.mapWidth
    });

    this.meta.xOffset = offset.xOffset;
    this.meta.yOffset = offset.yOffset;
  }

  drawMap({ ctx, player }) {
    this.cells.forEach(cell => {
      cell.draw({
        ctx,
        blockSize: this.meta.blockSize,
        xOffset: this.meta.xOffset,
        yOffset: this.meta.yOffset,
        player
      });
    });
  }
}

class Dung {
  constructor() {
    this.canvasElement = null;
    this.canvasContext = null;

    this.screen = {
      height: 0,
      width: 0
    };

    this.options = {
      background: 'black',
      size: {
        height: 500,
        width: 400
      },
      blockSize: 25,
      fontScale: 1
    };

    this.renderMeta = {
      fpsInterval: 1000,
      then: null,
      now: null
    };

    this.player = null;
    this.map = null;
    this.levels = null; // todo, generate levels
  }

  attatch(element) {
    this.canvasElement = element;
    this.canvasContext = getCanvasContext(canvasElement);
    this.screen = getScreenSize(window);

    setupCanvas({
      element: this.canvasElement,
      context: this.canvasContext,
      height: this.screen.height,
      width: this.screen.width,
      background: this.options.background,
      blockSize: this.options.blockSize,
      fontScale: this.options.fontScale
    });

    log('attatched!');
  }

  start(fps) {
    this.map = new Map({
      parentHeight: this.screen.height,
      parentWidth: this.screen.width,
      mapHeight: this.options.size.height,
      mapWidth: this.options.size.width,
      blockSize: this.options.blockSize
    });

    this.map.generateCells();

    this.map.drawMap({
      ctx: this.canvasContext,
      player: this.player
    });
  }
}

return Dung;

})));
