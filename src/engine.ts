
import {CTXObject, ShapesArray } from './objects';

interface DrawerEngineConfig {
  size: number;
  padding: number;
}

export class DrawerEngine {
  private padding = 70;
  private size = 60;

  left = 0;
  right = 0;
  top = 0;
  bottom = 0;
  private ctx;

  constructor(
    private objects: CTXObject[],
    private canvas: any,
    config: DrawerEngineConfig
  ) {
    this.ctx = this.canvas.getContext("2d");
    this.padding = config.padding;
    this.size = config.size;
    this.init();
  }
  get objectsList(){
    return [...this.objects]
  }
  appendObject(object: CTXObject) {
    this.objects.push(object);
    this.clear();
    this.init();
  }
  remove(object: CTXObject): void{
    this.objects = this.objects.filter(el => el.payload.id !== object.payload.id)
    this.clear();
    this.init();
  }
  getSize(): number[] {
    return [
      this.size * (this.left + this.right) + this.padding * 2,
      this.size * (this.top + this.bottom) + this.padding * 2,
    ];
  }
  setConfig(config: DrawerEngineConfig) {
    this.padding = config.padding;
    this.size = config.size;
    this.clear();
    this.init();
  }
  setOjects(objects: CTXObject[]){
    this.objects = objects
    this.clear()
    this.init()
  }
  clear(): void {
    const oldColor = this.ctx.fillStyle;
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.fillStyle = oldColor;
  }
  beforeInit() {
    // Цей метод можна змінити за бажанням, він викликажться кожен раз перед тим як щось почати малювати
    // ВАЖЛИВО!!! Саме перед тим як малювати, а отже сам екзеспляр класу обрахує свою ширину і висоту тоді і де виконає метод і лише тоді починає щось малювати!!!
  }
  init(): void {
    this.left = Math.ceil(
      Math.max(...this.objects.map((ctxobj) => ctxobj.left))
    );
    this.left = this.left > 0 ? this.left : 1;

    this.right = Math.ceil(
      Math.max(...this.objects.map((ctxobj) => ctxobj.right))
    );
    this.right = this.right > 0 ? this.right : 1;

    this.top = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.top)));
    this.top = this.top > 0 ? this.top : 1;

    this.bottom = Math.ceil(
      Math.max(...this.objects.map((ctxobj) => ctxobj.bottom))
    );
    this.bottom = this.bottom > 0 ? this.bottom : 1;

    this.ctx.font = Math.floor(this.size / 5) + "px sans-serif";

    this.beforeInit(); // Що це? Дивитись трохи вище!
    this.initRender(); //!!!!

    for (let i: number = 1; i <= this.left; i++) {
      this.drawTLineXAxis(
        this.padding + this.left * this.size - i * this.size,
        this.padding + this.left * this.size - (i - 1) * this.size,
        "-" + i
      );
    }
    for (let i: number = 1; i <= this.right; i++) {
      this.drawTLineXAxis(
        this.padding + this.left * this.size + i * this.size,
        this.padding + this.left * this.size + (i - 1) * this.size,
        i
      );
    }
    for (let i: number = 1; i <= this.top; i++) {
      this.drawTLineYAxis(
        this.padding + this.top * this.size - i * this.size,
        this.padding + this.top * this.size - (i - 1) * this.size,
        i + "i"
      );
    }
    for (let i: number = 1; i <= this.bottom; i++) {
      this.drawTLineYAxis(
        this.padding + this.top * this.size + i * this.size,
        this.padding + this.top * this.size + (i - 1) * this.size,
        "-" + i + "i"
      );
    }
  }
  callBackAfterRenderLoop(): void | ShapesArray {} //цей метод можна задати у методі рендер CTXObject екзерляра, він виконається після закінчення рендеру коипоненту
  initRender(): void {
    for (let obj of this.objects) {
      if (obj.type === "CTXObject") {
        this.callBackAfterRenderLoop = (): void | ShapesArray => {};
        let ctxObject = obj.render({
          ctx: this.ctx,
          padding: this.padding,
          size: this.size,
          drawer: this,
        });
        this.callBackAfterRenderLoop();
        let type = ctxObject?.type;

        while (type === "CTXObject") {
          this.callBackAfterRenderLoop = (): void | ShapesArray => {};
          ctxObject = ctxObject.render({
            ctx: this.ctx,
            padding: this.padding,
            size: this.size,
            drawer: this,
          });
          type = ctxObject?.type;
          this.callBackAfterRenderLoop();
        }
      } else {
        throw new Error("Expexting for CTXObject exemplar");
      }
    }
  }

  drawTLineXAxis(x: number, xPrev: number, i: string | number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x, this.top * this.size + this.padding - this.size / 5);
    this.ctx.lineTo(x, this.top * this.size + this.padding + this.size / 5);

    this.ctx.stroke();

    this.ctx.beginPath();

    this.ctx.moveTo(xPrev, this.top * this.size + this.padding);
    this.ctx.lineTo(x, this.top * this.size + this.padding);

    this.ctx.stroke();

    this.ctx.fillText(
      i,
      x,
      this.top * this.size + this.padding + this.size / 2
    );
    this.ctx.stroke();
  }
  drawTLineYAxis = (y: number, yPrev: number, i: number | string) => {
    this.ctx.beginPath();
    this.ctx.moveTo(this.left * this.size + this.padding - this.size / 5, y);
    this.ctx.lineTo(this.left * this.size + this.padding + this.size / 5, y);

    this.ctx.stroke();

    this.ctx.moveTo(this.left * this.size + this.padding, yPrev);
    this.ctx.lineTo(this.left * this.size + this.padding, y);

    this.ctx.stroke();

    this.ctx.fillText(
      i,
      this.left * this.size + this.padding + this.size / 2,
      y
    );
    this.ctx.stroke();
  };
}
