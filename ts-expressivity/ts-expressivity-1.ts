// EVERYDAY TYPES
// ==============

// Common types
// ------------

// "This is a string, this is a number..."
let hiFromNY: string = 'hola from NY!'
let arrivingYear: number = 2020
let wasAGoodYear: boolean = true
let drivingLicenseAttempts: Date[] = [
  new Date('Jun 21, 2021'),
  new Date('Aug 13, 2021'),
  new Date('Oct 6, 2021')
]
let homeCoordinates: { longitude: number, latitude: number } = {
  longitude: -73.7602,
  latitude: 41.0365
}

// "A function that accepts a string."
function greet(greetings: string) {
  console.log(greetings)
}

// "A function that returns a number."
function answerToLifeUniverseAndEverything(): number {
  return 42
}

// "The second parameter is optional."
function emphasizedGreet(greetings: string, emphasisLevel?: any) {
  emphasisLevel = emphasisLevel ?? 0
  console.log(greetings + '!'.repeat(emphasisLevel))
}

// "padLeft() may take a string or a number."
function padLeft(something: string, padding: number | string): string {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + something
  }
  return padding + something
}

// "Can emit one of these events 'started', 'stopped'"
type PlayEvent = 'started' | 'stopped'
interface PlayerEmitter {
  on(event: PlayEvent, fn?: Function): void
}

// `unknown` vs `any`
// ------------------

let aNumber: number = 1
let something: any
let noIdea: unknown

something = aNumber
something = noIdea
aNumber = something
aNumber = noIdea

// "The function accepts everything."
function log(something: any) {
  console.log(something)
}

// "I don't know what is this parameter."
function f(something: unknown) {
  console.log(something)
}

// Optional keys, `null` and `undefined`
// -------------------------------------

// "The payload can come without the field 'memberSince'"
type CustomerPayload = {
  id: number,
  name: string,
  memberSince?: Date
}
let customer: CustomerPayload = {
  id: 0,
  name: 'Salva'
}
let seniority = Date.now() - customer.memberSince

// "The value can be undefined"
type Product = {
  id: number,
  name: string,
  description: string | undefined
}
let incompleteProduct: Product = {
  id: 0,
  name: 'Amazon Echo'
}
let product: Product = {
  id: 1,
  name: 'Google Home',
  description: null
}
let anotherProduct: Product = {
  id: 1,
  name: 'Apple HomePod',
  description: undefined
}

// "The value is optional"
type BetterProduct = {
  id: number,
  name: string,
  description: null
}
let aBetterProduct: BetterProduct = {
  id: 1,
  name: 'Harman Kardon Invoke',
  description: null
}

// Type aliases
// ------------

// "I want to represent a 2D point."
let center: [number, number] = [0, 0]

// "My project is all about points, I want my own type for them."
type Point2D = [number, number]
let randomPoint: Point2D = [Math.random(), Math.random()]
