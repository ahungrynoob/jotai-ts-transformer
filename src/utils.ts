import * as ts from 'typescript'

const JOTAI_LIB_NAME = 'jotai'

export interface PluginOptions {
  customAtomNames?: string[]
}

function isJotaiModule(moduleSpecifier: string) {
  return (
    moduleSpecifier === JOTAI_LIB_NAME ||
    moduleSpecifier === `${JOTAI_LIB_NAME}/utils`
  )
}

export function isAtom(
  typeChecker: ts.TypeChecker,
  node: ts.Node,
  customAtomNames: PluginOptions['customAtomNames'] = [],
) {
  const atomNames = [...atomFunctionNames, ...customAtomNames]
  if (ts.isIdentifier(node) && atomNames.includes(node.text)) {
    if (customAtomNames.includes(node.text)) return true

    const relatedSymbol = typeChecker.getSymbolAtLocation(node)
    if (
      relatedSymbol &&
      ts.isImportSpecifier(relatedSymbol.declarations?.[0]) &&
      isJotaiModule(
        (
          relatedSymbol.declarations?.[0].parent.parent.parent
            .moduleSpecifier as ts.StringLiteral
        ).text,
      )
    ) {
      return true
    }
  }

  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.name) &&
    atomNames.includes(node.name.text)
  ) {
    if (customAtomNames.includes(node.name.text)) return true

    const relatedSymbol = typeChecker.getSymbolAtLocation(node.expression)
    if (
      relatedSymbol &&
      ts.isImportClause(relatedSymbol.declarations?.[0]) &&
      isJotaiModule(
        (
          relatedSymbol.declarations?.[0].parent
            .moduleSpecifier as ts.StringLiteral
        ).text,
      )
    ) {
      return true
    }
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
