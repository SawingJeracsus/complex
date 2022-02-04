import {DrawerEngine} from './engine'
import { Line, Circle, Colorize, ComplexNumber, Ellipse, Sector, Parabola, Hiperbola } from './objects'

const canvas: HTMLCanvasElement = document.querySelector("#canvas");
const colorPicker: HTMLElement = document.querySelector("#color-picker");
let ColorPicked = "#000";
colorPicker.addEventListener("change", (e) => {
  //@ts-ignore
  ColorPicked = e.target.value;
});
const createElWithClass = (type: string, className: string) => {
  const el = document.createElement(type);
  el.classList.add(className);
  return el;
}; 2

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
  el: HTMLElement;
  private closeBtn: HTMLElement;
  private applyBtn: HTMLElement;
  private openButton: HTMLElement;
  private subscribers: Function[] = [];
  private inputsArray: any[] = [];
  selector;

  constructor(modal: string, openButtonselector: string) {
    this.selector = modal;
    const el: HTMLElement = document.querySelector(modal);
    const openButton: HTMLElement = document.querySelector(openButtonselector);
    const applyBtn: HTMLElement = document.querySelector(modal + "_apply");
    const closeBtn: HTMLElement = document.querySelector(modal + "_close");

    if (el) {
      this.el = el;
      this.applyBtn = applyBtn;
      this.closeBtn = closeBtn;
      this.openButton = openButton;
    } else {
      throw new Error(
        "Selector invalid, element with same selector not exists!"
      );
    }

    this.init();
  }
  static subscribeForAll(callback: Function, modals: Modal[]) {
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
      const breakFunc = (message: string) => {
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

  subscribe(callback: Function): void {
    this.subscribers.push(callback);
  }
}

interface ILayer {
  id: number | string;
  el: HTMLElement;
}
class LayersEngin {
  private container: HTMLElement;
  private counter: number = 0;

  private layers: ILayer[] = [];

  constructor(public containerSelector: string) {
    const container: HTMLElement = document.querySelector(containerSelector);
    if (container) {
      this.container = container;
    } else {
      throw new Error(
        "Hey!? i didn`t see any element in page with that selector bro!"
      );
    }
  }
  add(name: string, onRemove: Function, color = "#000"): number | string {
    this.counter++;
    const layerWrapper = this.container.appendChild(
      document.createElement("div")
    );
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
      onRemove({ ...aditonal, name });
    });

    layerWrapper.appendChild(wrapperName);
    layerWrapper.appendChild(buttonDelete);
    this.layers.push({
      id: this.counter,
      el: layerWrapper,
    });

    return this.counter;
  }

  remove(id: number | string): null | ILayer {
    let aditional: null | ILayer;

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
const [
  modalPoint,
  modalCircle,
  modalEllipse,
  modalSector,
  modalLine1,
  modalParabola,
  modalHiperbola,
] = allModals;

modalPoint.subscribe((data: any) => {
  const obj = new Colorize(
    new ComplexNumber(parseFloat(data.real), parseFloat(data.imagine)),
    ColorPicked
  );
  drawer.appendObject(obj);

  layers.add(
    "Точка",
    (data: any) => {
      drawer.remove(obj);
    },
    ColorPicked
  );
});

modalLine1.subscribe((data: any) => {
  const obj = new Colorize(
    new Line(
      new ComplexNumber(parseFloat(data.real1), parseFloat(data.imagine1)),
      new ComplexNumber(parseFloat(data.real2), parseFloat(data.imagine2)),
      data.showEndBegin
    ),
    ColorPicked
  );
  drawer.appendObject(obj);
  layers.add(
    "Лінія",
    (data: any) => {
      drawer.remove(obj);
    },
    ColorPicked
  );
});
modalCircle.subscribe((data: any) => {
  const obj = new Colorize(
    new Circle(
      new ComplexNumber(parseFloat(data.real), parseFloat(data.imagine)),
      parseFloat(data.radius),
      data.fill
    ),
    ColorPicked
  );

  drawer.appendObject(obj);
  layers.add(
    data.fill ? "Круг" : "Коло",
    (data: any) => {
      drawer.remove(obj);
    },
    ColorPicked
  );
});

modalEllipse.subscribe((data: any, breakFunc: Function) => {
  for (let key in data) {
    if (key !== "fill") {
      data[key] = parseFloat(data[key]);
    }
  }
  if (data.vertex < data.covertex) {
    breakFunc("Вісь повинна бути більшою за піввісь!");
  } else {
    const obj = new Colorize(
      new Ellipse(
        new ComplexNumber(data.real1, data.imagine1),
        new ComplexNumber(data.real2, data.imagine2),
        data.vertex,
        data.covertex
      ),
      ColorPicked
    );
    drawer.appendObject(obj);
    layers.add(
      "Еліпс",
      (data: any) => {
        drawer.remove(obj);
      },
      ColorPicked
    );
  }
});
modalSector.subscribe((data: any) => {
  for (let key in data) {
    if (key !== "fill") {
      data[key] = parseFloat(data[key]);
    }
  }
  const obj = new Colorize(
    new Sector(
      new ComplexNumber(data.real, data.imagine),
      data.radius,
      false,
      data.startAngle,
      data.endAngle
    ),
    ColorPicked
  );
  drawer.appendObject(obj);
  layers.add(
    "Сектор",
    (data: any) => {
      drawer.remove(obj);
    },
    ColorPicked
  );
});
modalParabola.subscribe((data: any) => {
  const obj = new Colorize(
    new Parabola(
      parseFloat(data.width),
      parseFloat(data.a),
      parseFloat(data.b),
      parseFloat(data.c)
    ),
    ColorPicked
  );
  drawer.appendObject(obj);
  layers.add(
    "Парабола",
    (data: any) => {
      drawer.remove(obj);
    },
    ColorPicked
  );
});
modalHiperbola.subscribe((data: any) => {
  const obj = new Colorize(
    new Hiperbola(
      parseFloat(data.size),
      parseFloat(data.a),
      parseFloat(data.b),
      parseFloat(data.c)
    ),
    ColorPicked
  );
  drawer.appendObject(obj);
  layers.add(
    "Гіпербола",
    (data: any) => {
      drawer.remove(obj);
    },
    ColorPicked
  );
});
