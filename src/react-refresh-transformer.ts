import * as path from 'path'

import * as ts from 'typescript'

import { isAtom } from './utils'
import type { PluginOptions } from './utils'

export const createReactRefreshTransformer = (
  program: ts.Program,
  options?: PluginOptions,
): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker()
  return (context) => {
    const visitor: ts.Visitor = (node) => {
      return node
    }

    return (node) => ts.visitNode(node, visitor)
  }
}
