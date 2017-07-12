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

function getScreenSize(parent) {
  return {
    height: parent.innerHeight,
    width: parent.innerWidth
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

class Map {
  constructor() {
    this.cells = [];
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

    this.map = new Map();
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
}

return Dung;

})));
