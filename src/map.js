import {
  log,
  calculateMapPlacement,
} from './utils';

import Cell from './cell';

class Map {
  constructor({
    parentHeight,
    parentWidth,
    mapHeight,
    mapWidth,
    blockSize,
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
      mapWidth,
    };
  }

  generateCells() {
    const columns = (this.meta.mapWidth / this.meta.blockSize);
    const rows = (this.meta.mapHeight / this.meta.blockSize);
    const blockCount = rows * columns;

    this.meta.columns = columns;
    this.meta.rows = rows;
    this.meta.blockCount = blockCount;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        this.cells.push(
          new Cell({
            row: r,
            column: c,
            blockSize: this.meta.blockSize,
            columns: this.meta.columns,
          })
        );
      }
    }

    const offset = calculateMapPlacement({
      screenHeight: this.meta.parentHeight,
      screenWidth: this.meta.parentWidth,
      mapHeight: this.meta.mapHeight,
      mapWidth: this.meta.mapWidth,
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
        player,
      });
    });
  }
}

export default Map;
