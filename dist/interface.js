"use strict";
const canvas = document.querySelector("#canvas");
const colorPicker = document.querySelector("#color-picker");
let ColorPicked = "#000";
colorPicker.addEventListener("change", (e) => {
    //@ts-ignore
    ColorPicked = e.target.value;
});
const createElWithClass = (type, className) => {
    const el = document.createElement(type);
    el.classList.add(className);
    return el;
};
/*
Ellipse
bottom: 0
center: ComplexNumber {type: "CTXObject", left: 0, right: 0, top: 0, bottom: 0, …}
coVertex: undefined
focus1: ComplexNumber {type: "CTXObject", left: -0.05, right: 1, top: 1, bottom: -0.05, …}
focus2: ComplexNumber {type: "CTXObject", left: -0.05, right: 3, top: 4, bottom: -0.05, …}
left: 0
right: 4
top: 0
type: "CTXObject"
vertex: 2
*/
const drawer = new DrawerEngine([], canvas, {
    size: 60,
    padding: 70,
});
const resize = () => {
    let [minimalWidth, minimalHeight] = drawer.getSize();
    canvas.width =
        minimalWidth > window.innerWidth / 2 ? minimalWidth : window.innerWidth / 2;
    canvas.height =
        minimalHeight > (window.innerHeight / 3) * 2
            ? minimalHeight
            : (window.innerHeight / 3) * 2;
    //   console.log("resize");
};
drawer.beforeInit = resize;
drawer.init();
class Modal {
    constructor(modal, openButtonselector) {
        this.subscribers = [];
        this.inputsArray = [];
        this.selector = modal;
        const el = document.querySelector(modal);
        const openButton = document.querySelector(openButtonselector);
        const applyBtn = document.querySelector(modal + "_apply");
        const closeBtn = document.querySelector(modal + "_close");
        if (el) {
            this.el = el;
            this.applyBtn = applyBtn;
            this.closeBtn = closeBtn;
            this.openButton = openButton;
        }
        else {
            throw new Error("Selector invalid, element with same selector not exists!");
        }
        this.init();
    }
    static subscribeForAll(callback, modals) {
        for (let modal of modals) {
            modal.subscribe(callback);
        }
    }
    init() {
        this.openButton.addEventListener("click", (e) => {
            this.el.classList.remove("hidden");
        });
        this.closeBtn.addEventListener("click", (e) => {
            this.el.classList.add("hidden");
        });
        this.applyBtn.addEventListener("click", (e) => {
            this.inputsArray = [
                ...document.querySelectorAll(this.selector + " input"),
            ].map((input) => ({ name: input.getAttribute("name"), target: input }));
            const inputs = {};
            for (let input of this.inputsArray) {
                // @ts-ignore
                inputs[input.name] =
                    input.target.getAttribute("type") !== "checkbox"
                        ? input.target.value
                        : input.target.checked;
            }
            let success = true;
            const breakFunc = (message) => {
                alert(message);
                success = false;
            };
            for (let subscriber of this.subscribers) {
                subscriber(inputs, breakFunc);
            }
            if (success) {
                this.el.classList.add("hidden");
                for (let input of this.inputsArray) {
                    //@ts-ignore
                    input.target.value = "";
                    input.target.checked = false;
                }
            }
        });
    }
    subscribe(callback) {
        this.subscribers.push(callback);
    }
}
class LayersEngin {
    constructor(containerSelector) {
        this.containerSelector = containerSelector;
        this.counter = 0;
        this.layers = [];
        const container = document.querySelector(containerSelector);
        if (container) {
            this.container = container;
        }
        else {
            throw new Error("Hey!? i didn`t see any element in page with that selector bro!");
        }
    }
    add(name, onRemove, color = "#000") {
        this.counter++;
        const layerWrapper = this.container.appendChild(document.createElement("div"));
        layerWrapper.classList.add("layer");
        layerWrapper.setAttribute("data-id", this.counter.toString());
        const wrapperName = createElWithClass("div", "name-wrapper");
        const colorBlock = createElWithClass("div", "color");
        colorBlock.setAttribute("style", `background-color: ${color};`);
        wrapperName.appendChild(colorBlock);
        const spanName = createElWithClass("span", "name");
        spanName.innerText = name + " " + this.counter;
        wrapperName.appendChild(spanName);
        const buttonDelete = createElWithClass("button", "btn");
        buttonDelete.classList.add("delete");
        buttonDelete.innerText = "×";
        buttonDelete.setAttribute("data-id", this.counter.toString());
        buttonDelete.addEventListener("click", (e) => {
            //@ts-ignore
            const aditonal = this.remove(e.target.dataset.id);
            onRemove(Object.assign(Object.assign({}, aditonal), { name }));
        });
        layerWrapper.appendChild(wrapperName);
        layerWrapper.appendChild(buttonDelete);
        this.layers.push({
            id: this.counter,
            el: layerWrapper,
        });
        return this.counter;
    }
    remove(id) {
        let aditional;
        for (let leyer of this.layers) {
            if (leyer.id.toString() === id.toString()) {
                aditional = leyer;
                leyer.el.remove();
            }
        }
        this.layers = this.layers.filter((leyer) => leyer.id !== id);
        return aditional;
    }
}
const layers = new LayersEngin(".layers");
const allModals = [
    new Modal(".point-modal", ".add-point"),
    new Modal(".circle-modal", ".add-circle"),
    new Modal(".ellipse-modal", ".add-ellipse"),
    new Modal(".sector-modal", ".add-sector"),
    new Modal(".line-modal", ".add-line"),
    new Modal(".parabola-modal", ".add-parabola"),
    new Modal(".hiperbola-modal", ".add-hiperbola"),
];
const [modalPoint, modalCircle, modalEllipse, modalSector, modalLine1, modalParabola, modalHiperbola,] = allModals;
modalPoint.subscribe((data) => {
    const obj = new Colorize(new ComplexNumber(parseFloat(data.real), parseFloat(data.imagine)), ColorPicked);
    drawer.appendObject(obj);
    layers.add("Точка", (data) => {
        drawer.remove(obj);
    }, ColorPicked);
});
modalLine1.subscribe((data) => {
    const obj = new Colorize(new Line(new ComplexNumber(parseFloat(data.real1), parseFloat(data.imagine1)), new ComplexNumber(parseFloat(data.real2), parseFloat(data.imagine2)), data.showEndBegin), ColorPicked);
    drawer.appendObject(obj);
    layers.add("Лінія", (data) => {
        drawer.remove(obj);
    }, ColorPicked);
});
modalCircle.subscribe((data) => {
    const obj = new Colorize(new Circle(new ComplexNumber(parseFloat(data.real), parseFloat(data.imagine)), parseFloat(data.radius), data.fill), ColorPicked);
    drawer.appendObject(obj);
    layers.add(data.fill ? "Круг" : "Коло", (data) => {
        drawer.remove(obj);
    }, ColorPicked);
});
modalEllipse.subscribe((data, breakFunc) => {
    for (let key in data) {
        if (key !== "fill") {
            data[key] = parseFloat(data[key]);
        }
    }
    if (data.vertex < data.covertex) {
        breakFunc("Вісь повинна бути більшою за піввісь!");
    }
    else {
        const obj = new Colorize(new Ellipse(new ComplexNumber(data.real1, data.imagine1), new ComplexNumber(data.real2, data.imagine2), data.vertex, data.covertex), ColorPicked);
        drawer.appendObject(obj);
        layers.add("Еліпс", (data) => {
            drawer.remove(obj);
        }, ColorPicked);
    }
});
modalSector.subscribe((data) => {
    for (let key in data) {
        if (key !== "fill") {
            data[key] = parseFloat(data[key]);
        }
    }
    const obj = new Colorize(new Sector(new ComplexNumber(data.real, data.imagine), data.radius, false, data.startAngle, data.endAngle), ColorPicked);
    drawer.appendObject(obj);
    layers.add("Сектор", (data) => {
        drawer.remove(obj);
    }, ColorPicked);
});
modalParabola.subscribe((data) => {
    const obj = new Colorize(new Parabola(parseFloat(data.width), parseFloat(data.a), parseFloat(data.b), parseFloat(data.c)), ColorPicked);
    drawer.appendObject(obj);
    layers.add("Парабола", (data) => {
        drawer.remove(obj);
    }, ColorPicked);
});
modalHiperbola.subscribe((data) => {
    const obj = new Colorize(new Hiperbola(parseFloat(data.size), parseFloat(data.a), parseFloat(data.b), parseFloat(data.c)), ColorPicked);
    drawer.appendObject(obj);
    layers.add("Гіпербола", (data) => {
        drawer.remove(obj);
    }, ColorPicked);
});
