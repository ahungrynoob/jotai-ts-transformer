import * as fs from 'fs'
import * as path from 'path'

import * as ts from 'typescript'

export function compile(
  files: { [fileName: string]: string },
  getCustomTransformers: (program: ts.Program) => ts.CustomTransformers,
) {
  const outputs: { [fileName: string]: string } = {}

  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
  }

  const usedNodeModules: string[] = []

  const compilerHost: ts.CompilerHost = {
    getSourceFile(filename, languageVersion) {
      if (filename in files) {
        return ts.createSourceFile(
          filename,
          files[filename],
          ts.ScriptTarget.Latest,
        )
      }

      if (filename.indexOf('.d.ts') !== -1) {
        let libFilename = filename
        if (filename.indexOf('lib.') !== 0) {
          libFilename = 'lib.' + filename
        }
        const libPath = path.join(
          __dirname,
          '..',
          'node_modules',
          'typescript',
          'lib',
          libFilename,
        )
        if (fs.existsSync(libPath)) {
          return ts.createSourceFile(
            libFilename,
            fs.readFileSync(libPath).toString(),
            ts.ScriptTarget.Latest,
          )
        }
      }

      const nodeModuleName = filename.replace(/\.ts$/, '')
      let filepath = path.join(
        __dirname,
        '..',
        'node_modules',
        '@types',
        nodeModuleName,
        'index.d.ts',
      )
      if (fs.existsSync(filepath)) {
        usedNodeModules.push('@types/' + nodeModuleName)
        return ts.createSourceFile(
          'index.d.ts',
          fs.readFileSync(filepath).toString(),
          ts.ScriptTarget.Latest,
        )
      }
      filepath = path.join(
        __dirname,
        '..',
        'node_modules',
        nodeModuleName,
        'index.d.ts',
      )
      if (fs.existsSync(filepath)) {
        usedNodeModules.push(nodeModuleName)
        return ts.createSourceFile(
          'index.d.ts',
          fs.readFileSync(filepath).toString(),
          ts.ScriptTarget.Latest,
        )
      }
      for (const usedNodeModule of usedNodeModules) {
        filepath = path.join(
          __dirname,
          '..',
          'node_modules',
          usedNodeModule,
          filename,
        )
        if (fs.existsSync(filepath)) {
          return ts.createSourceFile(
            filename,
            fs.readFileSync(filepath).toString(),
            ts.ScriptTarget.Latest,
          )
        }
      }
      return undefined
    },
    readFile(fileName: string) {
      return fileName
    },
    fileExists(fileName: string) {
      return true
    },
    getDefaultLibFileName(options: ts.CompilerOptions) {
      return 'lib.d.ts'
    },
    writeFile: function (fileName, data, writeByteOrderMark) {
      outputs[fileName] = data
    },
    getDirectories(path: string) {
      return null as any
    },
    useCaseSensitiveFileNames: function () {
      return false
    },
    getCanonicalFileName: function (filename) {
      return filename
    },
    getCurrentDirectory: function () {
      return ''
    },
    getNewLine: function () {
      return '\n'
    },
  }

  const program = ts.createProgram(
    Object.keys(files),
    compilerOptions,
    compilerHost,
  )
  const transformers = getCustomTransformers(program)

  const writeFileCallback: ts.WriteFileCallback = (
    fileName: string,
    data: string,
  ) => {
    outputs[fileName] = data
  }

  const { diagnostics } = program.emit(
    undefined,
    writeFileCallback,
    undefined,
    false,
    transformers,
  )

  const errors = diagnostics
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    // For some reason the prop-types package gives type errors that we need to ignore
    .filter((d) => !d.file || d.file.fileName.indexOf('prop-types') === -1)

  if (errors.length) {
    throw new Error(
      errors
        .map((d) => d.file!.fileName + ' ' + d.source + ' ' + d.messageText)
        .join('\n'),
    )
  }

  return outputs
}
