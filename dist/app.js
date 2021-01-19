"use strict";
function toRadians(deg) {
    return deg * Math.PI / 180;
}
function toDeg(rad) {
    return rad / Math.PI * 180;
}
function delay(ms) {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
const calculatePos = (x, y, size = 10, padding = 0, drawer) => {
    return [
        (drawer.left + x) * size + padding,
        (drawer.top - y) * size + padding,
    ];
};
function sin(a) {
    return Math.sin(a) + 1 - 1;
}
function cos(a) {
    return Math.cos(a) + 1 - 1;
}
class CTXObject {
    constructor() {
        this.type = "CTXObject";
        this.payload = {
            id: Date.now().toString()
        };
        this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;
    }
    render({ ctx, padding, size, drawer }) {
        throw new Error("Render method is not relized!");
    }
}
class ComplexNumber extends CTXObject {
    constructor(real, imagine, showTitle = false) {
        super();
        this.real = real;
        this.imagine = imagine;
        this.showTitle = showTitle;
        this.center = new Circle(this, 0.05, true);
        this.left = this.center.left - this.center.radius;
        this.right = this.center.right - this.center.radius;
        this.top = this.center.top - this.center.radius;
        this.bottom = this.center.bottom - this.center.radius;
    }
    render({ ctx, padding, size, drawer }) {
        return this.center;
    }
}
class ShapesArray extends CTXObject {
    constructor(objects) {
        super();
        this.objects = objects;
        this.left = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.left)));
        this.left = this.left > 0 ? this.left : 1;
        this.right = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.right)));
        this.right = this.right > 0 ? this.right : 1;
        this.top = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.top)));
        this.top = this.top > 0 ? this.top : 1;
        this.bottom = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.bottom)));
        this.bottom = this.bottom > 0 ? this.bottom : 1;
    }
    render(config) {
        for (let obj of this.objects) {
            if (obj.type === "CTXObject") {
                config.drawer.callBackAfterRenderLoop = () => { };
                let ctxObject = obj.render(config);
                config.drawer.callBackAfterRenderLoop();
                let type = ctxObject === null || ctxObject === void 0 ? void 0 : ctxObject.type;
                while (type === "CTXObject") {
                    config.drawer.callBackAfterRenderLoop = () => { };
                    ctxObject = ctxObject.render(config);
                    config.drawer.callBackAfterRenderLoop();
                    type = ctxObject === null || ctxObject === void 0 ? void 0 : ctxObject.type;
                }
            }
            else {
                throw new Error("Expexting for CTXObject exemplar");
            }
        }
    }
}
class Colorize extends CTXObject {
    constructor(CTXObject, color) {
        super();
        this.CTXObject = CTXObject;
        this.color = color;
        this.left = this.CTXObject.left;
        this.right = this.CTXObject.right;
        this.top = this.CTXObject.top;
        this.bottom = this.CTXObject.bottom;
    }
    render(config) {
        const oldFillStyle = config.ctx.fillStyle;
        const oldStrokeStyle = config.ctx.strokeStyle;
        config.ctx.fillStyle = this.color;
        config.ctx.strokeStyle = this.color;
        let renderResult = this.CTXObject.render(config);
        config.drawer.callBackAfterRenderLoop();
        config.drawer.callBackAfterRenderLoop = () => { };
        while ((renderResult === null || renderResult === void 0 ? void 0 : renderResult.type) === "CTXObject") {
            renderResult = renderResult.render(config);
            config.drawer.callBackAfterRenderLoop();
            config.drawer.callBackAfterRenderLoop = () => { };
        }
        config.ctx.fillStyle = oldFillStyle;
        config.ctx.strokeStyle = oldStrokeStyle;
    }
}
class CTXText extends CTXObject {
    constructor(text, complextPoint, textSize = 10) {
        super();
        this.text = text;
        this.complextPoint = complextPoint;
        this.textSize = textSize;
    }
    render({ ctx, padding, size, drawer }) {
        const temp = ctx.font;
        ctx.font = this.textSize + "px sans-serif";
        const [x, y] = calculatePos(this.complextPoint.real, this.complextPoint.imagine, size, padding, drawer);
        ctx.fillText(this.text, x + this.textSize / 2, y + this.textSize);
        return false;
    }
}
class Circle extends CTXObject {
    constructor(center, radius, fill = false) {
        super();
        this.center = center;
        this.radius = radius;
        this.fill = fill;
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
    render({ ctx, padding, size, drawer }) {
        ctx.beginPath();
        const [x, y] = calculatePos(this.center.real, this.center.imagine, size, padding, drawer);
        ctx.arc(x, y, this.radius * size, 0, 2 * Math.PI);
        this.fill ? ctx.fill() : ctx.stroke();
        if (this.fill) {
            return new Colorize(new Circle(this.center, this.radius), "#000");
        }
    }
}
class Sector extends Circle {
    constructor(center, radius, fill = false, startAngle, endAngle) {
        super(center, radius, fill);
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        console.log(this);
        this.startAngle = toRadians(this.startAngle);
        this.endAngle = toRadians(this.endAngle);
    }
    render({ ctx, padding, size, drawer }) {
        ctx.beginPath();
        const [x, y] = calculatePos(this.center.real, this.center.imagine, size, padding, drawer);
        ctx.arc(x, y, this.radius * size, this.startAngle, this.endAngle);
        this.fill ? ctx.fill() : ctx.stroke();
        if (this.fill) {
            // return new 
        }
    }
}
class Ellipse extends CTXObject {
    constructor(focus1, focus2, vertex, coVertex) {
        super();
        this.focus1 = focus1;
        this.focus2 = focus2;
        this.vertex = vertex;
        this.coVertex = coVertex;
        this.center = new ComplexNumber(0, 0);
        this.center.real = (this.focus1.real + this.focus2.real) / 2;
        this.center.imagine = (this.focus1.imagine + this.focus2.imagine) / 2;
        this.right = this.center.real + this.vertex > 0 ? this.center.real + this.vertex : 0;
        this.left = this.center.real - this.vertex < 0 ? Math.abs(this.center.real - this.vertex) : 0;
        this.top = this.center.imagine + this.coVertex > 0 ? this.center.imagine + this.coVertex : 0;
        this.bottom = this.center.imagine - this.coVertex < 0 ? Math.abs(this.center.imagine - this.coVertex) : 0;
    }
    render({ ctx, padding, size, drawer }) {
        ctx.beginPath();
        const [x, y] = calculatePos(this.center.real, this.center.imagine, size, padding, drawer);
        const tan = Math.abs(this.focus1.imagine - this.focus2.imagine) / Math.abs(this.focus1.real - this.focus2.real);
        const angle = (this.focus1.imagine - this.focus2.imagine) * (this.focus1.real - this.focus2.real) < 0 ? Math.atan(tan) : -Math.atan(tan);
        ctx.ellipse(x, y, this.vertex * size, this.coVertex * size, angle, 0, 2 * Math.PI);
        ctx.stroke();
        return new ShapesArray([this.focus2, new Colorize(this.focus1, '#f00')]);
    }
}
class Line extends CTXObject {
    constructor(begin, end, showEndAndBegin = false) {
        super();
        this.begin = begin;
        this.end = end;
        this.showEndAndBegin = showEndAndBegin;
        const maximal = Math.max(this.begin.real, this.end.real);
        this.right = maximal > 0 ? maximal : 1;
        const minimal = Math.min(this.begin.real, this.end.real);
        this.left = minimal < 0 ? Math.abs(minimal) : 1;
        const maximalY = Math.max(this.begin.imagine, this.end.imagine);
        this.top = maximalY > 0 ? maximalY : 1;
        const minimalY = Math.min(this.begin.real, this.end.real);
        this.bottom = minimalY < 0 ? Math.abs(minimalY) : 1;
    }
    render({ ctx, size, padding, drawer }) {
        ctx.beginPath();
        ctx.moveTo(...calculatePos(this.begin.real, this.begin.imagine, size, padding, drawer));
        ctx.lineTo(...calculatePos(this.end.real, this.end.imagine, size, padding, drawer));
        ctx.stroke();
        if (this.showEndAndBegin) {
            return new ShapesArray([this.begin, this.end]);
        }
    }
}
class Parabola extends CTXObject {
    constructor(width, a, b = 0, c = 0) {
        super();
        this.width = width;
        this.a = a;
        this.b = b;
        this.c = c;
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
    calculateY(x) {
        return this.a * Math.pow(x, 2) + this.b * x + this.c;
    }
    render(config) {
        const objects = [];
        for (let i = 1; i <= 40; i++) {
            const x = this.vertex.real - this.width / 2 + (this.width / 40) * i;
            const xPrev = this.vertex.real - this.width / 2 + (this.width / 40) * (i - 1);
            objects.push(new Line(new ComplexNumber(x, this.calculateY(x)), new ComplexNumber(xPrev, this.calculateY(xPrev))));
        }
        return new ShapesArray(objects);
    }
}
class Hiperbola extends CTXObject {
    constructor(size, a = 1, b = 0, c = 0) {
        super();
        this.size = size;
        this.a = a;
        this.b = b;
        this.c = c;
        this.right = this.size - this.c;
        this.left = this.size + this.c;
        this.top = this.size * a + this.b;
        this.bottom = this.size * a - this.b;
        // y = a/(x+c) + b
    }
    calculateY(x) {
        return this.a / (x + this.c) + this.b;
    }
    render({ ctx, size, padding, drawer }) {
        const objects = [];
        for (let i = 1; i <= 40; i++) {
            const x = this.size - this.c - (this.size / 20) * i;
            const xPrev = this.size - this.c - (this.size / 20) * (i - 1);
            if (x != -this.c && xPrev != -this.c) {
                objects.push(new Line(new ComplexNumber(x, this.calculateY(x)), new ComplexNumber(xPrev, this.calculateY(xPrev))));
            }
        }
        return new ShapesArray(objects);
    }
}
class DrawerEngine {
    constructor(objects, canvas, config) {
        this.objects = objects;
        this.canvas = canvas;
        this.padding = 70;
        this.size = 60;
        this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;
        this.drawTLineYAxis = (y, yPrev, i) => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.left * this.size + this.padding - this.size / 5, y);
            this.ctx.lineTo(this.left * this.size + this.padding + this.size / 5, y);
            this.ctx.stroke();
            this.ctx.moveTo(this.left * this.size + this.padding, yPrev);
            this.ctx.lineTo(this.left * this.size + this.padding, y);
            this.ctx.stroke();
            this.ctx.fillText(i, this.left * this.size + this.padding + this.size / 2, y);
            this.ctx.stroke();
        };
        this.ctx = this.canvas.getContext("2d");
        this.padding = config.padding;
        this.size = config.size;
        this.init();
    }
    get objectsList() {
        return [...this.objects];
    }
    appendObject(object) {
        this.objects.push(object);
        this.clear();
        this.init();
    }
    remove(object) {
        this.objects = this.objects.filter(el => el.payload.id !== object.payload.id);
        this.clear();
        this.init();
    }
    getSize() {
        return [
            this.size * (this.left + this.right) + this.padding * 2,
            this.size * (this.top + this.bottom) + this.padding * 2,
        ];
    }
    setConfig(config) {
        this.padding = config.padding;
        this.size = config.size;
        this.clear();
        this.init();
    }
    setOjects(objects) {
        this.objects = objects;
        this.clear();
        this.init();
    }
    clear() {
        const oldColor = this.ctx.fillStyle;
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.fillStyle = oldColor;
    }
    beforeInit() {
        // Цей метод можна змінити за бажанням, він викликажться кожен раз перед тим як щось почати малювати
        // ВАЖЛИВО!!! Саме перед тим як малювати, а отже сам екзеспляр класу обрахує свою ширину і висоту тоді іде виконає метод і лише тоді починає щось малювати!!!
    }
    init() {
        this.left = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.left)));
        this.left = this.left > 0 ? this.left : 1;
        this.right = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.right)));
        this.right = this.right > 0 ? this.right : 1;
        this.top = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.top)));
        this.top = this.top > 0 ? this.top : 1;
        this.bottom = Math.ceil(Math.max(...this.objects.map((ctxobj) => ctxobj.bottom)));
        this.bottom = this.bottom > 0 ? this.bottom : 1;
        this.ctx.font = Math.floor(this.size / 5) + "px sans-serif";
        this.beforeInit(); // Що це? Дивитись трохи вище!
        this.initRender(); //!!!!
        for (let i = 1; i <= this.left; i++) {
            this.drawTLineXAxis(this.padding + this.left * this.size - i * this.size, this.padding + this.left * this.size - (i - 1) * this.size, "-" + i);
        }
        for (let i = 1; i <= this.right; i++) {
            this.drawTLineXAxis(this.padding + this.left * this.size + i * this.size, this.padding + this.left * this.size + (i - 1) * this.size, i);
        }
        for (let i = 1; i <= this.top; i++) {
            this.drawTLineYAxis(this.padding + this.top * this.size - i * this.size, this.padding + this.top * this.size - (i - 1) * this.size, i + "i");
        }
        for (let i = 1; i <= this.bottom; i++) {
            this.drawTLineYAxis(this.padding + this.top * this.size + i * this.size, this.padding + this.top * this.size + (i - 1) * this.size, "-" + i + "i");
        }
    }
    callBackAfterRenderLoop() { } //цей метод можна задати у методі рендер CTXObject екзерляра, він виконається після закінчення рендеру коипоненту
    initRender() {
        for (let obj of this.objects) {
            if (obj.type === "CTXObject") {
                this.callBackAfterRenderLoop = () => { };
                let ctxObject = obj.render({
                    ctx: this.ctx,
                    padding: this.padding,
                    size: this.size,
                    drawer: this,
                });
                this.callBackAfterRenderLoop();
                let type = ctxObject === null || ctxObject === void 0 ? void 0 : ctxObject.type;
                while (type === "CTXObject") {
                    this.callBackAfterRenderLoop = () => { };
                    ctxObject = ctxObject.render({
                        ctx: this.ctx,
                        padding: this.padding,
                        size: this.size,
                        drawer: this,
                    });
                    type = ctxObject === null || ctxObject === void 0 ? void 0 : ctxObject.type;
                    this.callBackAfterRenderLoop();
                }
            }
            else {
                throw new Error("Expexting for CTXObject exemplar");
            }
        }
    }
    drawTLineXAxis(x, xPrev, i) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.top * this.size + this.padding - this.size / 5);
        this.ctx.lineTo(x, this.top * this.size + this.padding + this.size / 5);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(xPrev, this.top * this.size + this.padding);
        this.ctx.lineTo(x, this.top * this.size + this.padding);
        this.ctx.stroke();
        this.ctx.fillText(i, x, this.top * this.size + this.padding + this.size / 2);
        this.ctx.stroke();
    }
}
