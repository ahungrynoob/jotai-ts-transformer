import { createReactRefreshTransformer, AtomFunctionName } from '../src'

import { compile } from './compile'

const transform = (
  code: string,
  fileName = 'unknown.ts',
  customAtomNames?: AtomFunctionName[],
) =>
  compile({ [fileName]: code }, (program) => ({
    before: [createReactRefreshTransformer(program, { customAtomNames })],
  }))[fileName.replace('.ts', '.js')]

it('Should add a cache for a single atom', () => {
  expect(
    transform(
      `
  import {atom} from 'jotai';
  const countAtom = atom(0);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    import { atom } from 'jotai';
    const countAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/countAtom\\", atom(0));
    "
  `)
})

it('Should add a cache for multiple atoms', () => {
  expect(
    transform(
      `
  import {atom} from 'jotai/vanilla';
  const countAtom = atom(0);
  const doubleAtom = atom((get) => get(countAtom) * 2);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    import { atom } from 'jotai/vanilla';
    const countAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/countAtom\\", atom(0));
    const doubleAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/doubleAtom\\", atom((get) => get(countAtom) * 2));
    "
  `)
})

it('Should add a cache for multiple exported atoms', () => {
  expect(
    transform(
      `
  import {atom} from 'jotai';
  export const countAtom = atom(0);
  export const doubleAtom = atom((get) => get(countAtom) * 2);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    import { atom } from 'jotai';
    export const countAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/countAtom\\", atom(0));
    export const doubleAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/doubleAtom\\", atom((get) => get(countAtom) * 2));
    "
  `)
})

it('Should add a cache for a default exported atom', () => {
  expect(
    transform(
      `
  import {atom} from 'jotai';
  export default atom(0);`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    import { atom } from 'jotai';
    export default globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/defaultExport\\", atom(0));
    "
  `)
})

it('Should add a cache for mixed exports of atoms', () => {
  expect(
    transform(
      `
  import {atom} from 'jotai';
  export const countAtom = atom(0);
  export default atom((get) => get(countAtom) * 2);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    import { atom } from 'jotai';
    export const countAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/countAtom\\", atom(0));
    export default globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/defaultExport\\", atom((get) => get(countAtom) * 2));
    "
  `)
})

it('Should handle atoms returned from functions', () => {
  expect(
    transform(
      `
      import {atom} from 'jotai';
      function createAtom(label) {
        const anAtom = atom(0);
        anAtom.debugLabel = label;
        return anAtom;
      }
      
      const countAtom = atom(0);
      const countAtom2 = createAtom("countAtom2");
      const countAtom3 = createAtom("countAtom3");`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    import { atom } from 'jotai';
    function createAtom(label) {
        const anAtom = atom(0);
        anAtom.debugLabel = label;
        return anAtom;
    }
    const countAtom = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/countAtom\\", atom(0));
    const countAtom2 = createAtom(\\"countAtom2\\");
    const countAtom3 = createAtom(\\"countAtom3\\");
    "
  `)
})

it('Should handle custom atom names', () => {
  expect(
    transform(
      `const mySpecialThing = myCustomAtom(0);`,
      '/src/atoms/index.ts',
      [{ functionNames: ['myCustomAtom'] }],
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
        cache: new Map(),
        get(name, inst) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }
            this.cache.set(name, inst);
            return inst;
        }
    };
    const mySpecialThing = globalThis.jotaiAtomCache.get(\\"/src/atoms/index.ts/mySpecialThing\\", myCustomAtom(0));
    "
  `)
})
