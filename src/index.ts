import * as path from 'path'

import * as ts from 'typescript'

import { isAtom } from './utils'

export const jotaiLabelTransformer: ts.TransformerFactory<ts.SourceFile> = (
  context,
) => {
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
          ts.isCallExpression(innerNode.initializer) &&
          isAtom(innerNode.initializer.expression)
        ) {
          const debugLabelStatement = context.factory.createExpressionStatement(
            context.factory.createBinaryExpression(
              context.factory.createPropertyAccessExpression(
                context.factory.createIdentifier(innerNode.name.getText()),
                context.factory.createIdentifier('debugLabel'),
              ),
              context.factory.createToken(ts.SyntaxKind.EqualsToken),
              context.factory.createStringLiteral(innerNode.name.getText()),
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
      isAtom(node.expression.expression)
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
        context.factory.createIdentifier(displayName),
      )

      return [variableStatement, expressionStatement, exportStatement]
    }
    return ts.visitEachChild(node, visitor, context)
  }

  return (node) => ts.visitNode(node, visitor)
}
