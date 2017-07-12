import {
  log,
} from './utils';

function initMapCell({ row, column, size, columns }) {
  return {
    row,
    column,
    size,
    index: getIndex({ row, column, columns}),
    type: 'GROUND',
    animationStep: 0,
    animationStepCounter: 0,
    isAnimated: false,
    isOccupied: false,
    isPlayerOccupied: false,
    shouldRedraw: false,
    state: null,
    hasAnimatedObject: false,
    animatedObjectType: null,
  };
}

function calculateMapPlacement({
  screenWidth,
  screenHeight,
  mapWidth,
  mapHeight,
}) {
  const xCenter = screenWidth / 2;
  const xOffset = xCenter - (mapWidth / 2);
  const yCenter = screenWidth / 2;
  const yOffset = yCenter - (mapHeight / 2);

  return {
    xOffset,
    yOffset,
  };
}

class Map {
  constructor({
    parentHeight,
    parentWidth,
    mapHeight,
    mapWidth,
  }) {
    this.cells = [];

    this.meta = {
      blockCount: 0,
      blockSize: 0,
      rows: 0,
      columns: 0,
      xOffset: 0,
      yOffset: 0,
      parentHeight,
      parentWidth,
      mapHeight,
      mapWidth,
    };
  }

  generateCells({
    height,
    width,
    blockSize,
  }) {
    const columns = (width / blockSize);
    const rows = (height / blockSize);
    const blockCount = rows * columns;

    mapMeta.columns = columns;
    mapMeta.rows = rows;
    mapMeta.blockSize = blockSize;
    mapMeta.blockCount = blockCount;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        this.cells.push(
          initMapCell({
            r: row,
            column: c,
            blockSize,
            columns: this.meta.columns,
          })
        );
      }
    }

    const offset = calculateMapPlacement({
      screenHeight: this.meta.parentHeight,
      screenWidth: this.meta.parentWidth,
      mapHeight: this.meta.mapHeight,
      mapWidth: this.mapWidth,
    });

    meta.xOffset = offset.xOffset;
    meta.yOffset = offset.yOffset;

    log('map initialized', map);
    log('mapMeta', mapMeta);
  }
}

export default Map;
