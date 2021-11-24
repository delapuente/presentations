// ADVANCE TYPING
// ==============

// Literal interpolation
// ---------------------

type GetterName<AttrName extends string> = `get${Capitalize<AttrName>}`
const nameGetter: GetterName<'name'> = 'getname'
const ageGetter: GetterName<'age'> = 'getAge'

// Mapped types
// ------------

// "A set of perms from a set of capabilities."
type Capabilities = Record<string, boolean>
type Perms<C extends Capabilities> = Record<keyof C, boolean>

let deviceCapabilities = {
  openPulse: true,
  qobj: true,
  qasm3: false
}

const userPerms = {
  openPulse: false,
  qobj: false,
  qasm3: true
}

// "A set of entitlements from the combination of capabilities and perms."
type EntitlementName<K extends string> = `canUse${Capitalize<K>}`
type Entitlements<C extends Capabilities> = {
  [Key in keyof C as EntitlementName<string & Key>]: boolean
}
let userEntitlements = getEntitlements(deviceCapabilities, userPerms)
userEntitlements.openPulse
userEntitlements.canUseOpenPulse

function getEntitlements<C extends Capabilities>(
  capabilities: C,
  perms: Perms<C>
): Entitlements<C> {
  const entitlements: Record<string, boolean> = {}
  for (const [capName, value] of Object.entries(capabilities)) {
    const entName = `canUse${capitalize(capName)}`
    entitlements[entName] = perms[capName] && value
  }
  return entitlements as Entitlements<C>
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// Type predicates
// ---------------

// "A compact, lightweight representation of HTML in form of a tuple."
type TagNode = [string, HtmlNode[], object]
type TextNode = string
type HtmlNode = TagNode | TextNode

// "A function to count the nodes"
function countHtmlNodes(root: HtmlNode): number {
  return countNode(root)
}

function countNode(node: HtmlNode): number {
  if (isTextNode(node)) {
    return 1
  } else {
    const children = node[1]
    return 1 + countChildren(children)
  }
}

function isTextNode(node: HtmlNode): node is TextNode {
  return typeof node === 'string'
}

function countChildren(children: HtmlNode[]): number {
  return children
    .map(node => countNode(node))
    .reduce((v, sum) => sum + v, 0)
}