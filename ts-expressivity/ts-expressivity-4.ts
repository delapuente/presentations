// LIMITS OF EXPRESSIVITY
// ======================

// "The intentional 'null' version of a possibly incomplete payload"
type Nullable<T> = T | null
type Intentional<T> = {
  [Key in keyof T]-?:
    any | undefined extends T[Key] ? Exclude<T[Key], undefined> | null : T[Key]
}

type CharacterPayload = {
  name: string,
  last?: string,
  profession?: string
}

let john: Intentional<CharacterPayload> = {
  name: 'John',
  last: null,
  profession: null
}

// "The type of constructables"
function create<I extends new (...args: any) => any>(
  ctor: I,
  ...args: ConstructorParameters<I>
): InstanceType<I> {
  return new ctor(...args)
}

create<typeof TreeInspector>(TreeInspector, 3)
let ti = create<typeof TreeInspector>(TreeInspector, numberTree)

function create2<I>(
  ctor: typeof I,
  ...args: ConstructorParameters<typeof I>
): I {
  return new ctor(...args)
}

function create3<T extends new ( ...args: any) => any>(ctor: T) {
  return function(
    ...args: ConstructorParameters<typeof ctor>
  ): InstanceType<T> {
    return new ctor(...args)
  }
}

create3(TreeInspector)(3)
let ti3 = create3(TreeInspector)(numberTree)

class Creator<T extends new ( ...args: any) => any> {
  _ctor: T

  constructor(ctor: T) {
    this._ctor = ctor
  }

  create(...args: ConstructorParameters<T>): InstanceType<T> {
    return new this._ctor(...args)
  }
}

new Creator(TreeInspector).create(3)
let ti4 = new Creator(TreeInspector).create(numberTree)