import * as ts from 'typescript'

export interface PluginOptions {
  customAtomNames?: string[]
}

export function isAtom(
  node: ts.Node,
  customAtomNames: PluginOptions['customAtomNames'] = [],
) {
  const atomNames = [...atomFunctionNames, ...customAtomNames]
  if (ts.isIdentifier(node) && atomNames.includes(node.getText())) {
    return true
  }

  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.name) &&
    atomNames.includes(node.name.getText())
  ) {
    return true
  }
  return false
}

const atomFunctionNames = [
  'abortableAtom',
  'atom',
  'atomFamily',
  'atomWithDefault',
  'atomWithHash',
  'atomWithImmer',
  'atomWithInfiniteQuery',
  'atomWithMachine',
  'atomWithMutation',
  'atomWithObservable',
  'atomWithProxy',
  'atomWithQuery',
  'atomWithReducer',
  'atomWithReset',
  'atomWithSubscription',
  'atomWithStorage',
  'atomWithStore',
  'freezeAtom',
  'loadable',
  'selectAtom',
  'splitAtom',
]
