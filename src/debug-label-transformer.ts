import * as path from 'path'

import * as ts from 'typescript'

import { isAtom } from './utils'
import type { PluginOptions } from './utils'

export const createDebugLabelTransformer = (
  program: ts.Program,
  options?: PluginOptions,
): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker()
  return (context) => {
    let filename = 'unknown'
    const visitor: ts.Visitor = (node) => {
      if (ts.isSourceFile(node)) {
        filename = node.fileName
      }

      if (ts.isVariableStatement(node)) {
        const debugLabelStatements = []
        node.declarationList.declarations.forEach((innerNode) => {
          if (
            ts.isIdentifier(innerNode.name) &&
            innerNode.initializer &&
            ts.isCallExpression(innerNode.initializer) &&
            isAtom(
              typeChecker,
              innerNode.initializer.expression,
              options?.customAtomNames,
            )
          ) {
            const debugLabelStatement =
              context.factory.createExpressionStatement(
                context.factory.createBinaryExpression(
                  context.factory.createPropertyAccessExpression(
                    context.factory.createIdentifier(innerNode.name.text),
                    context.factory.createIdentifier('debugLabel'),
                  ),
                  context.factory.createToken(ts.SyntaxKind.EqualsToken),
                  context.factory.createStringLiteral(innerNode.name.text),
                ),
              )
            debugLabelStatements.push(debugLabelStatement)
          }
        })
        return [node, ...debugLabelStatements]
      }

      if (
        ts.isExportAssignment(node) &&
        ts.isCallExpression(node.expression) &&
        isAtom(
          typeChecker,
          node.expression.expression,
          options?.customAtomNames,
        )
      ) {
        let displayName = path.basename(filename, path.extname(filename))
        // ./{module name}/index.js
        if (displayName === 'index') {
          displayName = path.basename(path.dirname(filename))
        }
        // Relies on visiting the variable declaration to add the debugLabel
        const variableStatement = context.factory.createVariableStatement(
          undefined,
          context.factory.createVariableDeclarationList(
            [
              context.factory.createVariableDeclaration(
                context.factory.createIdentifier(displayName),
                undefined,
                undefined,
                node.expression,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        )

        const expressionStatement = context.factory.createExpressionStatement(
          context.factory.createBinaryExpression(
            context.factory.createPropertyAccessExpression(
              context.factory.createIdentifier(displayName),
              context.factory.createIdentifier('debugLabel'),
            ),
            context.factory.createToken(ts.SyntaxKind.EqualsToken),
            context.factory.createStringLiteral(displayName),
          ),
        )

        const exportStatement = context.factory.createExportAssignment(
          undefined,
          undefined,
          undefined,
          context.factory.createIdentifier(displayName),
        )

        return [variableStatement, expressionStatement, exportStatement]
      }
      return ts.visitEachChild(node, visitor, context)
    }

    return (node) => ts.visitNode(node, visitor)
  }
}
