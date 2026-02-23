import { resolve, relative, dirname } from 'node:path'
import * as fs from 'node:fs/promises'
import { glob } from 'glob'
import * as rolldown from 'rolldown'
import * as vite from 'vite'
import h from 'vhtml'

const defaultConfig = {
  src: 'src',
  build: {
    bundle: 'build/.bundle',
    staged: 'build/staged',
    dist: 'build/dist',
    vite: 'build/.vite',
  }
}

const fileEndingRegex = /\.[jt]sx?$/

const createRoute = (routeTree, fileParts) => {
  if (fileParts.length === 0) {
    return routeTree
  }
  else {
    const [part, ...parts] = fileParts;
    if (part === 'index' && parts.length === 0) return {
      ...routeTree,
      ['/']: true,
    };
    return {
      ...routeTree,
      [part]: createRoute(routeTree[part] ?? {}, parts),
    };
  }
}

const generateRouteTree = (files) => files.reduce(
  (routeTree, file) => createRoute(routeTree, file.replace(/\.[jt]sx?$/, '').split('/')),
  {},
);

const importSourceCodeFile = () => ({
  name: 'vite-plugin-import-src-code',
  enforce: 'pre',
  resolveId: {
    filter: { id: /^code:/ },
    handler(source, importer) {
      return this.resolve(source.slice(`code:`.length), importer).then(
        (resolvedId) => `code:` + resolvedId.id,
      );
    },
  },
  load: {
    filter: { id: /^code:/ },
    async handler(id) {
      const file = id.slice(`code:`.length);
      const filename = relative('src', file);
      const referenceId = this.emitFile({
        type: 'asset',
        name: filename,
        source: await fs.readFile(file, 'utf-8'),
      });
      return `export default {
        filename: '${filename}',
        url: import.meta.ROLLUP_FILE_URL_${referenceId},
      };`;
    },
  },
});

export default async (config = defaultConfig) => {
  let viteConfig;
  let viteServer;

  config.src = resolve(process.cwd(), config.src);
  config.build.bundle = resolve(process.cwd(), config.build.bundle);
  config.build.staged = resolve(process.cwd(), config.build.staged);
  config.build.dist = resolve(process.cwd(), config.build.dist);
  config.build.vite = resolve(process.cwd(), config.build.vite);

  const inputs = (await glob([
    `${config.src}/**/index.js`,
    `${config.src}/**/index.jsx`,

    `${config.src}/**/index.ts`,
    `${config.src}/**/index.tsx`,
  ])).map(file => relative(config.src, file));

  const routeTree = generateRouteTree(inputs);

  console.log(routeTree)

  const viteOptions = {
    plugins: [importSourceCodeFile()],
    configFile: false,
    root: config.src,
    cacheDir: config.build.vite,
    appType: 'mpa',
    build: {
      rolldownOptions: {
        input: inputs.reduce(
          (inputs, file) => {
            return {
              ...inputs,
              [file.replace(fileEndingRegex, '')]: file,
            };
          },
          {},
        ),
      },
      emitAssets: true,
      ssr: true,
      outDir: config.build.bundle,
      emptyOutDir: true,
    },
    oxc: {
      jsxInject: 'import vhtml from \'vhtml\'',
      inject: {
        vhtml: 'vhtml',
      },
      jsx: {
        runtime: 'classic',
        pragma: 'vhtml',
        pragmaFrag: 'vhtml.Fragment',
      },
      typescript: {
        jsxPragma: 'vhtml',
        jsxPragmaFrag: 'vhtml.Fragment',
      },
    },
  };

  async function build() {
    // vite build
    this.info('bundling pages...')
    await vite.build({
      ...viteOptions,
      mode: viteConfig.mode,
    });
    this.info('...bundled pages')

    // import each generated file and populate the index.html files
    this.info('generating html...')
    await Promise.all((await glob(`${config.build.bundle}/**/index.js`)).map(async file => {
      const importUri = `${file}?${Date.now()}`;

      const { default: component } = await import(importUri)

      const rendered = h(component, {
        router: routeTree,
      })

      const outFile = relative(config.build.bundle, file).replace(fileEndingRegex, '.html');

      this.info(`generating ${outFile}...`);
      const fileLocation = `${config.build.staged}/${outFile}`
      await fs.mkdir(dirname(fileLocation), { recursive: true })
      await fs.writeFile(
        fileLocation,
        rendered,
      );
      this.info(`...generating ${outFile}`);
    }));
    this.info('...generating html')
  };

  return {
    name: 'vite-comptime',

    // run this plugin before other plugins
    enforce: 'pre',

    // configure
    async config(_, { mode, command }) {
      return {
        appType: 'mpa',
        root: config.build.staged,
        build: {
          outDir: config.build.dist,
          emptyOutDir: true,
          rolldownOptions: {
            // TODO: switch to the indexes for dev
            input: inputs.map(file => file.replace(fileEndingRegex, '.html')),
          },
        },
        resolve: {
          tsconfigPaths: true,
        },
        oxc: {
          jsxInject: 'import vhtml from \'vhtml\'',
          inject: {
            vhtml: 'vhtml',
          },
          jsx: {
            runtime: 'classic',
            pragma: 'vhtml',
            pragmaFrag: 'vhtml.Fragment',
          },
          typescript: {
            jsxPragma: 'vhtml',
            jsxPragmaFrag: 'vhtml.Fragment',
          },
        },
        experimental: {
          bundledDev: true,
        },
      };
    },

    async configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async buildStart() {
      await build.call(this);;
    },

    async configureServer(server) {
      viteServer = server;
      server.watcher.add(config.src)
    },

    async watchChange(id, { event }) {
      if (id.startsWith(config.src) && viteServer)
        await viteServer.restart()
    },

    // resolve output html imports back to `src`
    resolveId: {
      handler(source, importer) {
        if (!importer) return null;
        if (!importer.startsWith(config.build.staged)) return null;
        if (!(source.startsWith('/') || source.startsWith('./'))) return null;

        return source.startsWith('/')
        ? `${config.src}${source}`
        : resolve(resolve(config.src, relative(config.build.staged, importer)), source);
      },
    },
  }
}
