import * as ts from 'typescript'

const JOTAI_LIB_NAME = 'jotai'
const JOTAI_VANILLA_NAME = 'jotai/vanilla'

export interface AtomFunctionName {
  functionNames: string[]
  library?: string | string[]
}

export interface PluginOptions {
  customAtomNames?: AtomFunctionName[]
}

function isValidAtomFunction({
  funcName,
  library: lib,
  atomNames,
}: {
  funcName: string
  library?: string
  atomNames: AtomFunctionName[]
}) {
  return atomNames.some(({ functionNames, library }) => {
    if (!library) {
      return functionNames.includes(funcName)
    }
    if (typeof library === 'string') {
      return functionNames.includes(funcName) && library === lib
    }
    return functionNames.includes(funcName) && library.includes(lib)
  })
}

export function isAtom(
  typeChecker: ts.TypeChecker,
  node: ts.Node,
  customAtomNames: PluginOptions['customAtomNames'] = [],
) {
  const atomNames = [...builtInAtomFunctionNames, ...customAtomNames]
  if (ts.isIdentifier(node)) {
    const funcName = node.text
    const relatedSymbol = typeChecker.getSymbolAtLocation(node)
    const library =
      relatedSymbol && ts.isImportSpecifier(relatedSymbol.declarations?.[0])
        ? (
            relatedSymbol.declarations?.[0].parent.parent.parent
              .moduleSpecifier as ts.StringLiteral
          ).text
        : undefined

    return isValidAtomFunction({ funcName, library, atomNames })
  }

  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
    const funcName = node.name.text
    const relatedSymbol = typeChecker.getSymbolAtLocation(node.expression)
    const library =
      relatedSymbol && ts.isImportClause(relatedSymbol.declarations?.[0])
        ? (
            relatedSymbol.declarations?.[0].parent
              .moduleSpecifier as ts.StringLiteral
          ).text
        : undefined

    return isValidAtomFunction({ funcName, library, atomNames })
  }

  return false
}

const builtInAtomFunctionNames: AtomFunctionName[] = [
  // Core
  {
    functionNames: [
      'atom',
      'atomFamily',
      'atomWithDefault',
      'atomWithObservable',
      'atomWithReducer',
      'atomWithReset',
      'atomWithStorage',
      'freezeAtom',
      'loadable',
      'selectAtom',
      'splitAtom',
      'unstable_unwrap',
    ],
    library: [
      JOTAI_LIB_NAME,
      JOTAI_VANILLA_NAME,
      `${JOTAI_LIB_NAME}/utils`,
      `${JOTAI_VANILLA_NAME}/utils`,
    ],
  },
  {
    functionNames: ['atomWithMachine'],
    library: 'jotai-xstate',
  },
  {
    functionNames: ['atomWithImmer'],
    library: 'jotai-immer',
  },
  {
    functionNames: ['atomWithProxy'],
    library: 'jotai-valtio',
  },
  {
    functionNames: ['atomWithRecoilValue'],
    library: 'jotai-recoil',
  },
  {
    functionNames: ['atomWithCache'],
    library: 'jotai-cache',
  },
  {
    functionNames: ['validateAtoms', 'atomWithValidate'],
    library: 'jotai-form',
  },
  {
    functionNames: ['focusAtom'],
    library: 'jotai-optics',
  },
  {
    functionNames: ['atomWithHash', 'atomWithLocation'],
    library: 'jotai-location',
  },
  {
    functionNames: ['atomWithStore'],
    library: ['jotai-redux', 'jotai-zustand'],
  },
  {
    functionNames: ['atomWithQuery'],
  },
  {
    functionNames: ['atomWithMutation', 'atomWithSubscription'],
    library: ['jotai-trpc', 'jotai-relay'],
  },
]
