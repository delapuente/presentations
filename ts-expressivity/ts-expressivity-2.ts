// COMMON PATTERNS
// ===============

// OOP goodies
// -----------

// "Something can implement the "Landmark" interface."
interface Landmark {
  longitude: number
  latitude: number
}

class City implements Landmark {
  constructor(
    public name: string,
    public longitude: number,
    public latitude: number
  ) {
  }
}
let targetCoordinates = new City('White Plains', -73.7629, 41.0340)

// "An object is a composite of "ClosedShape" and "ColoredShape"."
interface ClosedShape {
  area(): number,
  length(): number
}

interface ColoredShape {
  color: string
}

let blueUnitBox: ClosedShape & ColoredShape = {
  area() { return 1 },
  length() { return 4 },
  color: 'blue'
}

// "A class for colored boxes implementing those interfaces."
class ColoredBox implements ClosedShape, ColoredShape {
  _side: number
  _color: string

  constructor(color: string, side: number = 1) {
    this._side = side
    this._color = color
  }

  area() { return this._side * this._side }
  length() { return 4 * this._side }
  get color() { return this._color }
}
let redBox = new ColoredBox('red')

// "A listener function"
function startDrawing(this: HTMLCanvasElement) {
  const ctx = this.getContext('2d')
}
let canvas: HTMLCanvasElement = document.querySelector('canvas')!
canvas.addEventListener('click', startDrawing)

// Generics
// --------

// "A tree of arbitrary values"
type TreeNode<T> = { value: T, children: TreeNode<T>[] }
let heterogeneousTree: TreeNode<any> = {
  value: 1,
  children: [
    { value: 'a', children: [] },
    { value: true, children: [] },
  ]
}
let numberTree: TreeNode<number> = {
  value: 1,
  children: [
    { value: 2, children: [] },
    { value: 3, children: [] },
  ]
}

// "An object that emit some specific events"
class EventEmitter<E extends string> {
  _listeners: { [k in E]?: Function[] }

  constructor() {
    this._listeners = {}
  }

  on(name: E, listener: Function) {
    this._listeners[name] = this._listeners[name] ?? []
    this._listeners[name]?.push(listener)
  }

  emit(name: E, ...payload: any[]) {
    const listeners = this._listeners[name] ?? []
    listeners.forEach(listener => listener(...payload))
  }
}

type PlayerEvent = 'play' | 'stop'
class Player extends EventEmitter<PlayerEvent> {

  play() {
    this.emit('play')
    console.log('Playing now...')
  }

  stop() {
    this.emit('stop')
    console.log('Stoping now...')
  }
}

const p = new Player()
p.on('play', () => {})
p.on('resume', () => {})

// Utility types
// -------------

// "A readonly view of the tree"
class TreeInspector<T> {
  _node: TreeNode<T>

  constructor(node: TreeNode<T>) {
    this._node = node
  }

  get value(): Readonly<TreeNode<T>['value']> {
    return this._node.value
  }

  get children(): Readonly<TreeNode<T>['children']> {
    return this._node.children
  }
}

let inspector = new TreeInspector(numberTree)
let children = inspector.children