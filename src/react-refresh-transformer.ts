import * as ts from 'typescript'

import { isAtom } from './utils'
import type { PluginOptions } from './utils'

const { factory } = ts

const globalAtomCacheExpressionStatement = factory.createExpressionStatement(
  factory.createBinaryExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier('globalThis'),
      factory.createIdentifier('jotaiAtomCache'),
    ),
    factory.createToken(ts.SyntaxKind.EqualsToken),
    factory.createBinaryExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier('globalThis'),
        factory.createIdentifier('jotaiAtomCache'),
      ),
      factory.createToken(ts.SyntaxKind.BarBarToken),
      factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(
            factory.createIdentifier('cache'),
            factory.createNewExpression(
              factory.createIdentifier('Map'),
              undefined,
              [],
            ),
          ),
          factory.createMethodDeclaration(
            undefined,
            undefined,
            undefined,
            factory.createIdentifier('get'),
            undefined,
            undefined,
            [
              factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                factory.createIdentifier('name'),
                undefined,
                undefined,
                undefined,
              ),
              factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                factory.createIdentifier('inst'),
                undefined,
                undefined,
                undefined,
              ),
            ],
            undefined,
            factory.createBlock(
              [
                factory.createIfStatement(
                  factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createThis(),
                        factory.createIdentifier('cache'),
                      ),
                      factory.createIdentifier('has'),
                    ),
                    undefined,
                    [factory.createIdentifier('name')],
                  ),
                  factory.createBlock(
                    [
                      factory.createReturnStatement(
                        factory.createCallExpression(
                          factory.createPropertyAccessExpression(
                            factory.createPropertyAccessExpression(
                              factory.createThis(),
                              factory.createIdentifier('cache'),
                            ),
                            factory.createIdentifier('get'),
                          ),
                          undefined,
                          [factory.createIdentifier('name')],
                        ),
                      ),
                    ],
                    true,
                  ),
                  undefined,
                ),
                factory.createExpressionStatement(
                  factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createThis(),
                        factory.createIdentifier('cache'),
                      ),
                      factory.createIdentifier('set'),
                    ),
                    undefined,
                    [
                      factory.createIdentifier('name'),
                      factory.createIdentifier('inst'),
                    ],
                  ),
                ),
                factory.createReturnStatement(factory.createIdentifier('inst')),
              ],
              true,
            ),
          ),
        ],
        true,
      ),
    ),
  ),
)

function visitSourceFile(
  typeChecker: ts.TypeChecker,
  ctx: ts.TransformationContext,
  sourceFile: ts.SourceFile,
  options?: PluginOptions,
) {
  const { factory } = ctx
  let needInjectGlobalCache = false

  const visitor = (
    node: ts.Node,
    isSourceFileScope: boolean,
    fromSourceFileScopeVariableStatement: boolean,
  ) => {
    // sourceFile => variableStatement
    if (isSourceFileScope && ts.isVariableStatement(node)) {
      return ts.visitEachChild(node, (node) => visitor(node, false, true), ctx)
    }

    // sourceFile => VariableStatement => VariableDeclarationList
    if (
      fromSourceFileScopeVariableStatement &&
      ts.isVariableDeclarationList(node)
    ) {
      return ts.visitEachChild(node, (node) => visitor(node, false, true), ctx)
    }

    // sourceFile => VariableStatement => VariableDeclarationList => isVariableDeclaration
    if (
      fromSourceFileScopeVariableStatement &&
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isIdentifier(node.name) &&
      ts.isCallExpression(node.initializer) &&
      isAtom(typeChecker, node.initializer.expression, options?.customAtomNames)
    ) {
      needInjectGlobalCache = true
      const identifierName = node.name.text
      const atomKey = `${sourceFile.fileName}/${identifierName}`
      return factory.updateVariableDeclaration(
        node,
        node.name,
        node.exclamationToken,
        node.type,
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('globalThis'),
              factory.createIdentifier('jotaiAtomCache'),
            ),
            factory.createIdentifier('get'),
          ),
          undefined,
          [factory.createStringLiteral(atomKey), node.initializer],
        ),
      )
    }

    if (
      ts.isExportAssignment(node) &&
      ts.isCallExpression(node.expression) &&
      isAtom(typeChecker, node.expression.expression, options?.customAtomNames)
    ) {
      needInjectGlobalCache = true
      const atomKey = `${sourceFile.fileName}/defaultExport`

      return factory.updateExportAssignment(
        node,
        node.decorators,
        node.modifiers,
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('globalThis'),
              factory.createIdentifier('jotaiAtomCache'),
            ),
            factory.createIdentifier('get'),
          ),
          undefined,
          [factory.createStringLiteral(atomKey), node.expression],
        ),
      )
    }

    return ts.visitEachChild(node, (node) => visitor(node, false, false), ctx)
  }

  const transformedStatements = sourceFile.statements.map((node) =>
    ts.visitNode(node, visitor.bind(null, node, true, false)),
  )

  if (!needInjectGlobalCache) return sourceFile

  transformedStatements.unshift(globalAtomCacheExpressionStatement)

  return ctx.factory.updateSourceFile(
    sourceFile,
    ctx.factory.createNodeArray(transformedStatements),
  )
}

export const createReactRefreshTransformer = (
  program: ts.Program,
  options?: PluginOptions,
): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker()
  return (context) => (node) =>
    visitSourceFile(typeChecker, context, node, options)
}
