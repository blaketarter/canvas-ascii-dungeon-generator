import {
  log,
  getScreenSize,
} from './utils';

import {
  getCanvasContext,
  setupCanvas,
} from './canvas';

import Map from './map';

class Dung {
  constructor() {
    this.canvasElement = null;
    this.canvasContext = null;

    this.screen = {
      height: 0,
      width: 0,
    };

    this.options = {
      background: 'black',
      size: {
        height: 500,
        width: 400,
      },
      blockSize: 25,
      fontScale: 1,
    };

    this.renderMeta = {
      fpsInterval: 1000,
      then: null,
      now: null,
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
      fontScale: this.options.fontScale,
    });

    log('attatched!');
  }

  start(fps) {
    this.map = new Map({
      parentHeight: this.screen.height,
      parentWidth: this.screen.width,
      mapHeight: this.options.size.height,
      mapWidth: this.options.size.width,
      blockSize: this.options.blockSize,
    });

    this.map.generateCells();

    this.map.drawMap({
      ctx: this.canvasContext,
      player: this.player,
    });
  }
}

export default Dung;
