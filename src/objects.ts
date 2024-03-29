import { DrawerEngine } from './engine';

interface RenderConfig {
    ctx: any;
    padding: number;
    size: number;
    drawer: DrawerEngine;
  }
  interface ICTXPayload  {
    id: string;
  }
  function toRadians(deg: number){
    return deg * Math.PI / 180
  }
  function toDeg(rad: number){
    return rad / Math.PI * 180
  }
  
  
  function delay(ms: number): any {
    return new Promise((resolve: any, _: any) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
  
  const calculatePos = (
    x: number,
    y: number,
    size = 10,
    padding = 0,
    drawer: DrawerEngine
  ): number[] => {
    return [
      (drawer.left + x) * size + padding,
      (drawer.top - y) * size + padding,
    ];
  };
  
  function sin(a: number): number {
    return Math.sin(a) + 1 - 1;
  }
  function cos(a: number): number {
    return Math.cos(a) + 1 - 1;
  }

export class CTXObject {
    type = "CTXObject";
    public payload: ICTXPayload = {
      id: Date.now().toString()
    }
  
    left = 0;
    right = 0;
    top = 0;
    bottom = 0;
  
    render({ ctx, padding, size, drawer }: RenderConfig): any | CTXObject {
      throw new Error("Render method is not relized!");
    }
  }
  
  export class ComplexNumber extends CTXObject {
    center = new Circle(this, 0.05, true);
    constructor(
      public real: number,
      public imagine: number,
      public showTitle: boolean = false
    ) {
      super();
      this.left = this.center.left - this.center.radius;
      this.right = this.center.right - this.center.radius;
      this.top = this.center.top - this.center.radius;
      this.bottom = this.center.bottom - this.center.radius;
    }
    render({ ctx, padding, size, drawer }: RenderConfig): any | CTXObject {
      return this.center;
    }
  }
  export class ShapesArray extends CTXObject {
    constructor(public readonly objects: CTXObject[]) {
      super();
  
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
    }
    render(config: RenderConfig): void {
      for (let obj of this.objects) {
        if (obj.type === "CTXObject") {
          config.drawer.callBackAfterRenderLoop = () => {};
          let ctxObject = obj.render(config);
          config.drawer.callBackAfterRenderLoop();
          let type = ctxObject?.type;
  
          while (type === "CTXObject") {
            config.drawer.callBackAfterRenderLoop = () => {};
            ctxObject = ctxObject.render(config);
            config.drawer.callBackAfterRenderLoop();
  
            type = ctxObject?.type;
          }
        } else {
          throw new Error("Expexting for CTXObject exemplar");
        }
      }
    }
  }
  export class Colorize extends CTXObject {
    constructor(private CTXObject: CTXObject, private readonly color: string) {
      super();
  
      this.left = this.CTXObject.left;
      this.right = this.CTXObject.right;
      this.top = this.CTXObject.top;
      this.bottom = this.CTXObject.bottom;
    }
    render(config: RenderConfig) {
      const oldFillStyle = config.ctx.fillStyle;
      const oldStrokeStyle = config.ctx.strokeStyle;
  
      config.ctx.fillStyle = this.color;
      config.ctx.strokeStyle = this.color;
  
      let renderResult = this.CTXObject.render(config);
      config.drawer.callBackAfterRenderLoop();
      config.drawer.callBackAfterRenderLoop = () => {};
  
      while (renderResult?.type === "CTXObject") {
        renderResult = renderResult.render(config);
        config.drawer.callBackAfterRenderLoop();
        config.drawer.callBackAfterRenderLoop = () => {};
      }
  
      config.ctx.fillStyle = oldFillStyle;
      config.ctx.strokeStyle = oldStrokeStyle;
    }
  }
  export class CTXText extends CTXObject {
    constructor(
      private text: string,
      private complextPoint: ComplexNumber,
      private textSize: number = 10
    ) {
      super();
    }
    render({ ctx, padding, size, drawer }: RenderConfig): any | CTXObject {
      const temp = ctx.font;
      ctx.font = this.textSize + "px sans-serif";
  
      const [x, y] = calculatePos(
        this.complextPoint.real,
        this.complextPoint.imagine,
        size,
        padding,
        drawer
      );
      ctx.fillText(this.text, x + this.textSize / 2, y + this.textSize);
      return false;
    }
  }
  
  export class Circle extends CTXObject {
    constructor(
      public readonly center: ComplexNumber,
      public readonly radius: number,
      public fill: boolean = false
    ) {
      super();
  
      this.right = this.radius + this.center.real;
      this.left =
        this.center.real - this.radius < 0
          ? Math.abs(this.center.real - this.radius)
          : 0;
      this.top = this.radius + this.center.imagine;
      this.bottom =
        this.center.imagine - this.radius < 0
          ? Math.abs(this.center.imagine - this.radius)
          : 0;
    }
    render({ ctx, padding, size, drawer }: RenderConfig): any | CTXObject {
      ctx.beginPath();
      const [x, y] = calculatePos(
        this.center.real,
        this.center.imagine,
        size,
        padding,
        drawer
      );
  
      ctx.arc(x, y, this.radius * size, 0, 2 * Math.PI);
  
      this.fill ? ctx.fill() : ctx.stroke();
      if (this.fill) {
        return new Colorize(new Circle(this.center, this.radius), "#000");
      }
    }
  }
  export class Sector extends Circle{
    constructor(
      center: ComplexNumber,
      readonly radius: number,
      fill: boolean = false,
      private readonly startAngle: number,
      private readonly endAngle: number,
    ){
      super(center, radius, fill)
  
      console.log(this);
      this.startAngle = toRadians(this.startAngle) 
      this.endAngle = toRadians(this.endAngle) 
    }
    render({ ctx, padding, size, drawer }: RenderConfig): any | CTXObject {
      ctx.beginPath();
      const [x, y] = calculatePos(
        this.center.real,
        this.center.imagine,
        size,
        padding,
        drawer
      );
  
      ctx.arc(x, y, this.radius * size, this.startAngle, this.endAngle);
  
      this.fill ? ctx.fill() : ctx.stroke();
      if (this.fill) {
        // return new 
      }
    }
  }
  export class Ellipse extends CTXObject{
    private center: ComplexNumber = new ComplexNumber(0, 0)
    constructor(
      private readonly focus1: ComplexNumber,
      private readonly focus2: ComplexNumber,
      private readonly vertex: number,
      private readonly coVertex: number
    ){
      super()
      this.center.real    = (this.focus1.real + this.focus2.real)/2
      this.center.imagine = (this.focus1.imagine + this.focus2.imagine)/2
      
      this.right  = this.center.real + this.vertex > 0 ? this.center.real + this.vertex : 0
      this.left   = this.center.real - this.vertex < 0 ? Math.abs(this.center.real - this.vertex) : 0
  
      this.top    = this.center.imagine + this.coVertex > 0 ? this.center.imagine + this.coVertex : 0
      this.bottom = this.center.imagine - this.coVertex < 0 ? Math.abs(this.center.imagine - this.coVertex) : 0  
    }
    render({ ctx, padding, size, drawer }: RenderConfig): any | CTXObject{
      ctx.beginPath();
      const [x, y] = calculatePos(
        this.center.real,
        this.center.imagine,
        size,
        padding,
        drawer
      );
   
      const tan = Math.abs(this.focus1.imagine - this.focus2.imagine) / Math.abs(this.focus1.real - this.focus2.real)
      const angle =  (this.focus1.imagine - this.focus2.imagine) * (this.focus1.real - this.focus2.real) < 0 ? Math.atan( tan ) : -Math.atan( tan );
        
      ctx.ellipse(x, y, this.vertex*size, this.coVertex*size, angle ,0, 2 * Math.PI)
      ctx.stroke()
  
      return new ShapesArray([this.focus2, new Colorize(this.focus1, '#f00')])
    }
  }
  export class Line extends CTXObject {
    constructor(
      public readonly begin: ComplexNumber,
      public readonly end: ComplexNumber,
      private showEndAndBegin: boolean = false
    ) {
      super();
  
      const maximal = Math.max(this.begin.real, this.end.real);
      this.right = maximal > 0 ? maximal : 1;
  
      const minimal = Math.min(this.begin.real, this.end.real);
      this.left = minimal < 0 ? Math.abs(minimal) : 1;
  
      const maximalY = Math.max(this.begin.imagine, this.end.imagine);
      this.top = maximalY > 0 ? maximalY : 1;
  
      const minimalY = Math.min(this.begin.real, this.end.real);
      this.bottom = minimalY < 0 ? Math.abs(minimalY) : 1;
    }
    render({ ctx, size, padding, drawer }: RenderConfig): void | ShapesArray {
      ctx.beginPath();
      ctx.moveTo(
        ...calculatePos(
          this.begin.real,
          this.begin.imagine,
          size,
          padding,
          drawer
        )
      );
      ctx.lineTo(
        ...calculatePos(this.end.real, this.end.imagine, size, padding, drawer)
      );
  
      ctx.stroke();
      if (this.showEndAndBegin) {
        return new ShapesArray([this.begin, this.end]);
      }
    }
  }
  export class Parabola extends CTXObject {
    vertex: ComplexNumber;
    constructor(
      private width: number,
      private readonly a: number,
      private readonly b: number = 0,
      private readonly c: number = 0
    ) {
      super();
      const xVertex = (-1 * this.b) / (2 * this.a);
      this.vertex = new ComplexNumber(xVertex, this.calculateY(xVertex));
  
      this.right = xVertex + width / 2;
      this.left = xVertex - width / 2;
      this.top =
        this.a > 0 ? this.calculateY(xVertex + width / 2) : this.vertex.imagine;
      this.bottom =
        this.a > 0 ? this.vertex.imagine : this.calculateY(xVertex + width / 2);
  
      this.right = this.right > 0 ? this.right : 1;
      this.left = this.left < 0 ? Math.abs(this.left) : 1;
      this.top = this.top > 0 ? this.top : 1;
      this.bottom = this.bottom < 0 ? Math.abs(this.bottom) : 1;
    }
    calculateY(x: number): number {
      return this.a * x ** 2 + this.b * x + this.c;
    }
    render(config: RenderConfig): ShapesArray {
      const objects = [];
      for (let i = 1; i <= 40; i++) {
        const x = this.vertex.real - this.width / 2 + (this.width / 40) * i;
        const xPrev =
          this.vertex.real - this.width / 2 + (this.width / 40) * (i - 1);
  
        objects.push(
          new Line(
            new ComplexNumber(x, this.calculateY(x)),
            new ComplexNumber(xPrev, this.calculateY(xPrev))
          )
        );
      }
  
      return new ShapesArray(objects);
    }
  }
  export class Hiperbola extends CTXObject {
    constructor(
      private size: number,
      private a: number = 1,
      private b: number = 0,
      private c: number = 0
    ) {
      super();
      this.right = this.size - this.c;
      this.left = this.size + this.c;
  
      this.top = this.size * a + this.b;
      this.bottom = this.size * a - this.b;
      // y = a/(x+c) + b
    }
    calculateY(x: number): number {
      return this.a / (x + this.c) + this.b;
    }
    render({ ctx, size, padding, drawer }: RenderConfig): ShapesArray {
      const objects: CTXObject[] = [];
      for (let i = 1; i <= 40; i++) {
        const x = this.size - this.c - (this.size / 20) * i;
        const xPrev = this.size - this.c - (this.size / 20) * (i - 1);
  
        if (x != -this.c && xPrev != -this.c) {
          objects.push(
            new Line(
              new ComplexNumber(x, this.calculateY(x)),
              new ComplexNumber(xPrev, this.calculateY(xPrev))
            )
          );
        }
      }
      return new ShapesArray(objects);
    }
  }