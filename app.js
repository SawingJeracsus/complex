const canvas = document.querySelector('#canvas')
const delay = (ms) => new Promise( (res, rej) => setTimeout(() => res(), ms) )
const sigmoid = (x) => 1/(1+Math.exp(-x))

function sin(a){
  return Math.sin(a) +1 -1;
}
function cos(a){
  return Math.cos(a) +1 -1;
}


const calculatePos = (x, y, size = 10, padding = 0, drawer) => {
  return [
    (x < 0 ?  drawer.left/size - Math.abs(x) :  drawer.left/size + x)*size+padding, 
    (y < 0 ?  Math.abs(y) + drawer.top/size :  drawer.top/size - y)*size + padding
  ]
}


canvas.width = window.innerWidth
canvas.height = window.innerHeight

class CTXObject {
  type = 'CTXObject'
  
  render(){
    return
  }
}

class  ComplexNumber extends CTXObject {
  constructor(real, imagine, showTitle = false) {
    super()
    this.showTitle = showTitle
    if(typeof real === 'number' && typeof imagine === 'number'){
      this.real = real;
      this.imagine = imagine
    }else{
      throw new Error('Invalid type of argument, waiting fot number')
    }
  }

  render(ctx, padding, size, drawer){
    if(!this.showTitle){
      return new Disc(this, 0.05)
    }    
    return new ShapesArray([
      new Disc(this, 0.05),
      new Text(`${Math.round(100*this.real)/100}/${Math.round(100*this.imagine)/100}i`, this, 12)
    ])
  }
  
  get right (){
    return this.real > 0 ? this.real : 0;
  }
  get left (){
    return this.real < 0 ? Math.abs(this.real) : 0;
  }

  get top (){
    return this.imagine > 0 ? this.imagine : 0;
  }
  get bottom (){
    return this.imagine < 0 ? Math.abs(this.imagine) : 0;
  }


  get value () {
    return `${this.real} + ${this.imagine}i`
  }
}
class Text extends CTXObject {
  constructor(text, complextPoint, textSize=10){
    super()
    this.text = text
    this.complextPoint = complextPoint
    this.textSize = textSize
    if(typeof complextPoint !== 'object' && complextPoint?.constructor?.name !== "ComplexNumber"){
      throw new Error("Expecting ComplexNumber class exemplar!")
    }
    for(let sight of ['left', 'right', 'top', 'bottom']){
      this[sight] = 0
    }
    
  }render(ctx, padding, size, drawer){
    const temp = ctx.font 
    ctx.font = this.textSize+"px sans-serif";

    const [x, y] = calculatePos(this.complextPoint.real, this.complextPoint.imagine, size, padding, drawer)
    ctx.fillText(this.text, x+(this.textSize/2), y+this.textSize)
    return false
  }

}
class ShapesArray extends CTXObject {
  constructor(objects){
    super()
    this.objects = objects

    for(let sight of ['left', 'right', 'top', 'bottom']){
      this[sight] = Math.max(...this.objects.map(object => object[sight]))
      if(this[sight] <= 0){
        this[sight] = 1
      }
    }
  }
  render(ctx, padding, size, drawer){
    for(let obj of this.objects){
      if(obj.type === 'CTXObject'){
        let ctxObject = obj.render(ctx, padding, size, drawer)
        let type = ctxObject?.type
        
        while(type === 'CTXObject'){
          ctxObject = ctxObject.render(ctx, padding, size, drawer)          
          type = ctxObject?.type
        }
      }else{
        throw new Error('Expexting for CTXObject exemplar')
      }
    }
  }

}
class Circle  extends CTXObject{
  constructor(center, radius, showAditinalPoints = false) {
    super()

    this.xCenter = center.real;
    this.yCenter = center.imagine

    this.radius = radius
    
    this.center = center
    this.showAditinalPoints = showAditinalPoints
  }
  didContactPoint(complextPoint){
    if(complextPoint.constructor.name !== 'ComplexNumber'){
      throw new Error('Expacting a ComplexNumber exemplar in didContactPoint method!')
      return
    }
    return this.radius === Math.sqrt( (this.xCenter-complextPoint.real)**2 + (this.yCenter-complextPoint.imagine)**2 )
  }
  get aditionalPoints() {
    let aditionalPoints = []
    if(this.radius >= Math.abs(this.xCenter)){
      const delay = Math.round(Math.sqrt(this.radius**2 - Math.abs(this.xCenter)**2)*100)/100
      aditionalPoints = [
        ...aditionalPoints,
        new ComplexNumber(0, this.yCenter + delay),
        new ComplexNumber(0, this.yCenter - delay),
      ]
    }
    if(this.radius >= Math.abs(this.yCenter)){
      const delay = Math.round(Math.sqrt(this.radius**2 - Math.abs(this.yCenter)**2)*100)/100
      aditionalPoints = [
        ...aditionalPoints,
        new ComplexNumber(this.xCenter + delay, 0),
        new ComplexNumber(this.xCenter - delay, 0),
      ]
    }

    return aditionalPoints
  }
  render(ctx, padding, size, drawer){
    ctx.beginPath();
    ctx.arc((this.xCenter < 0 ?  drawer.left/size - Math.abs(this.xCenter) :  drawer.left/size + this.xCenter)*size+padding, (this.yCenter < 0 ? Math.abs(this.yCenter) + drawer.top/size :  drawer.top/size - this.yCenter)*size + padding, this.radius*size, 0, 2 * Math.PI);
    ctx.stroke();
    if(this.showAditinalPoints){
      return new ShapesArray(this.aditionalPoints)
    }
  }
  get right (){
    return this.radius + this.xCenter;
  }
  get left (){
    return this.xCenter - this.radius < 0 ? Math.abs(this.xCenter - this.radius) : 0;
  }

  get top (){
    return this.radius + this.yCenter;
  }
  get bottom (){
    return this.yCenter - this.radius < 0 ? Math.abs(this.yCenter - this.radius) : 0;
  }


  get width (){
    return this.radius * 2
  }
  get height (){
    return this.radius * 2
  }
}


class Disc extends Circle{
  constructor(center, radius, color = '#000'){
    super(center, radius)
    this.color = color
  }

  render(ctx, padding, size, drawer){
    const lastStyle = ctx.fillStyle
    ctx.fillStyle = this.color

    ctx.beginPath();
    ctx.arc((this.xCenter < 0 ?  drawer.left/size - Math.abs(this.xCenter) :  drawer.left/size + this.xCenter)*size+padding, (this.yCenter < 0 ? Math.abs(this.yCenter) + drawer.top/size :  drawer.top/size - this.yCenter)*size + padding, this.radius*size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = lastStyle
  }

}


class Line extends CTXObject{
  constructor( begin, end ){
    super()

    this.begin = begin; 
    this.end = end
  }

  render(ctx, padding, size, drawer){
    ctx.beginPath();
    
    ctx.moveTo(...calculatePos(this.begin.real, this.begin.imagine, size, padding, drawer))
    ctx.lineTo(...calculatePos(this.end.real, this.end.imagine, size, padding, drawer))

    ctx.stroke();

    return new ShapesArray([
      new ComplexNumber(this.begin.real, this.begin.imagine),
      new ComplexNumber(this.end.real, this.end.imagine)
    ])
  }
  get right (){
    return Math.max(this.begin.real, this.end.real) > 0 ? Math.max(this.begin.real, this.end.real) : 0 
  }
  get left (){
    return Math.min(this.begin.real, this.end.real) < 0 ? -Math.min(this.begin.real, this.end.real) : 0 
  }

  get top (){
    return Math.max(this.begin.imagine, this.end.imagine) > 0 ? Math.max(this.begin.imagine, this.end.imagine) : 0 
  }
  get bottom (){
    return Math.min(this.begin.imagine, this.end.imagine) < 0 ? -Math.min(this.begin.imagine, this.end.imagine) : 0 
  }

  get length(){
    return Math.sqrt( ( (this.begin.real - this.end.real)**2 + (this.begin.imagine - this.end.imagine)**2 ) ) 
  }
}

class DrawEngine {
  #padding = 70;
  #size = 60

  constructor(objects = [], ctx) {
    this.objects = objects
    this.ctx = ctx


    this.init()
  }
  clear(){
    this.ctx.fillStyle = '#fff'
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  }
  init(){

    for(let sight of ['left', 'right', 'top', 'bottom']){
      this[sight] = Math.ceil(Math.max(...this.objects.map(object => object[sight]))*this.#size)
      if(this[sight] <= 0){
        this[sight] = this.#size
      }
    }

    this.ctx.font = Math.floor(this.#size/5)+"px sans-serif";


  const drawTLine = (xPosOfLine, xPrevPos, i) => {
    this.ctx.beginPath()
    this.ctx.moveTo(xPosOfLine, this.top + this.#padding - this.#size / 5)
    this.ctx.lineTo(xPosOfLine, this.top + this.#padding + this.#size / 5)
    
    this.ctx.stroke()
    
    this.ctx.beginPath()

    this.ctx.moveTo(xPrevPos, this.top + this.#padding)
    this.ctx.lineTo(xPosOfLine, this.top + this.#padding)
    
    this.ctx.stroke()
    
    this.ctx.fillText(i, xPosOfLine, this.top + this.#padding + this.#size/2);
    this.ctx.stroke()
  }

  const drawTLineYAxis = (yPosOfLine, yPrevPos, i) => {
    this.ctx.beginPath()
    this.ctx.moveTo(this.left + this.#padding - (this.#size / 5), yPosOfLine)
    this.ctx.lineTo(this.left + this.#padding + (this.#size / 5), yPosOfLine)

    this.ctx.stroke()

    this.ctx.moveTo(this.left + this.#padding, yPrevPos)
    this.ctx.lineTo(this.left + this.#padding, yPosOfLine)
    
    this.ctx.stroke()
    
    this.ctx.fillText(i, this.left + this.#padding + this.#size/2, yPosOfLine);
    this.ctx.stroke()
  }


  for (let i = 1; i <= (this.right === this.#size ? 1: this.right/this.#size+1); i++){
    const xPosOfLine = this.#padding + this.left + i*this.#size
    const xPrevPos = this.#padding + this.left + (i-1)*this.#size
    drawTLine(xPosOfLine, xPrevPos, i)
  }
  for (let i = 1; i <= (this.left === this.#size ? 1: this.left/this.#size+1); i++){
    const xPosOfLine = this.#padding + this.left - i*this.#size
    const xPrevPos = this.#padding + this.left - (i-1)*this.#size
    drawTLine(xPosOfLine, xPrevPos, '-'+i)
  }

  for (let i = 1; i <= (this.bottom === this.#size ? 1: this.bottom/this.#size+1); i++){    
    const yPosOfLine = this.#padding + this.top + i*this.#size
    const yPrevPos   = this.#padding + this.top + (i-1)*this.#size
    drawTLineYAxis(yPosOfLine, yPrevPos, "-"+i+'i')
  }

  for (let i = 1; i <= (this.top === this.#size ? 1: this.top/this.#size+1); i++){
    const yPosOfLine = this.#padding + this.top - i*this.#size
    const yPrevPos   = this.#padding + this.top - (i-1)*this.#size
    drawTLineYAxis(yPosOfLine, yPrevPos, i+'i')
  }


    for(let obj of this.objects){
      if(obj.type === 'CTXObject'){
        let ctxObject = obj.render(this.ctx, this.#padding, this.#size, this)
        let type = ctxObject?.type
        
        while(type === 'CTXObject'){
          ctxObject = ctxObject.render(this.ctx, this.#padding, this.#size, this)          
          type = ctxObject?.type
        }
      }else{
        throw new Error('Expexting for CTXObject exemplar')
      }
    }

    

  }
}


const drawer = new DrawEngine([
  // new Circle(
  //   new ComplexNumber(3, -2),
  //   3,
  //   true
  // ),
  // new ComplexNumber(3, -2, true),
  // new Line(
  //   new ComplexNumber(3,-2),
  //   new ComplexNumber(-4, 1)
  // ),
  // new Disc(
  //   new ComplexNumber(-1,1),
  //   1,
  //   '#f00'
  // )
], canvas.getContext('2d'))

const start = async() => {
  for(let i = 1; i <= 100; i++){
    drawer.clear()
    drawer.objects = [
      new Circle( new ComplexNumber(3, 3), 3 * (1- sigmoid(i/100*12 - 6))), 
      new Line( 
        new ComplexNumber( 10, -3),
        new ComplexNumber( 10, 6),
      )
    ]
    drawer.init()
    // console.log(Math.abs(100 * Math.sin(Math.Pi * i / 100)), Math.sin(Math.Pi * i / 100), i / 100)
    await delay(100 * sigmoid(i/100*12 - 6))

  }
}
// start()
/*
new Circle(
    new ComplexNumber(1, -1),
    1,
    true
  ),
  new Line(
    new ComplexNumber(3, 0),
    new ComplexNumber(0, -3)
  ),
  new ComplexNumber(1, -1, true),
  // new ComplexNumber(1.6, -1.8)
*/

// start()


/*
дуже круто, але не практично(

const [circle, line] = this.objects
    const centerBegin = new Line ( line.begin, circle.center ).length
    const centerEnd   = new Line ( line.end, circle.center ).length   

    if(circle.radius < centerBegin && circle.radius < centerEnd){
      //Якщо точки поза колом 
      const firstPart = (
         centerEnd**2
         - centerBegin**2
         - line.length**2
      )
      const secondPart = (
        (-1)*(2*line.length * centerBegin ) 
      )      
      
      
      
      const angle1 = Math.acos(firstPart / secondPart)
      const height = centerBegin * Math.sin(angle1)      
      
      if(Math.round(height * 1000)/1000 === Math.round(circle.radius * 1000)/1000){
        // одна точка перетину
        const distance = centerBegin * Math.cos(angle1)
        
        const angle2 = Math.atan(Math.abs(line.end.imagine - line.begin.imagine) / Math.abs(line.end.real - line.begin.real) )
        
        const imagine = Math.abs(line.end.imagine - line.begin.imagine) - distance * Math.sin(angle2);
        const real    = Math.abs(line.end.real - line.begin.real) - distance * cos(angle2);

      console.log(real, imagine);
              
      }
      if(Math.round(height * 1000)/1000 < Math.round(circle.radius * 1000)/1000){
        //дві точки перетину
        const firstPart = (
          centerBegin**2
          - centerEnd**2
          - line.length**2
       )
       const secondPart = (
         (-1)*(2*line.length * centerEnd ) 
       )

        const angle3 = Math.acos(firstPart / secondPart)

        //1 Точка
        const beta1 = Math.asin(centerBegin*sin(angle1)/circle.radius)
        const hama1 = Math.PI - beta1 - angle1
        const distance1 = Math.sqrt( circle.radius**2 + centerBegin**2 - 2*centerBegin*circle.radius*cos(hama1) )
        
        const angle4 = Math.atan(Math.abs(line.end.imagine - line.begin.imagine) / Math.abs(line.end.real - line.begin.real) )
        
        const imagine = distance1 * Math.sin(angle4);
        const real    = distance1 * cos(angle4);

        // console.log(circle.radius**2 + centerBegin**2 - 2*centerBegin*circle.radius*cos(hama1));
        console.log(angle1 * 180 / Math.PI);
        
        
      }
      
    }
*/