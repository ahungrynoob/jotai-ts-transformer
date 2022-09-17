import * as ts from 'typescript'

export function isAtom(node: ts.Node) {
  if (ts.isIdentifier(node) && atomFunctionNames.includes(node.getText())) {
    return true
  }

  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.name) &&
    atomFunctionNames.includes(node.name.getText())
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
