import { resolve } from 'node:path';
import handlebars from 'vite-plugin-handlebars';
import { title } from 'process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import findPages from './find-pages';
import * as icons from '@mdi/js';
import { exit } from 'node:process';

const catFiles = readdirSync(resolve(import.meta.dirname, 'public', 'cats'));

/**
 * Map of context necessary for specific html pages. Only needs to be used if data cannot be stored in the relative context.json file
 */
const contextMap = {
  '/index.html': {
    catFiles,
  },
};

/**
 *
 * @param {string} path
 * @returns {any}
 */
function retrieveContext(path) {
  const baseContext = contextMap[path] || {};
  const contextPath = resolve(
    import.meta.dirname,
    ...path.split('/'),
    '..',
    'context.json',
  );

  if (existsSync(contextPath)) {
    try {
      const data = readFileSync(contextPath).toString();
      const jsonData = JSON.parse(data);
      return { ...jsonData, ...baseContext };
    } catch (e) {
      console.error(`Failed to read: ${contextPath}`);
      console.error(e);
      exit(1);
    }
  }

  return baseContext;
}

export default {
  plugins: [
    handlebars({
      partialDirectory: resolve(import.meta.dirname, 'src', 'partials'),
      helpers: {
        json: (ctx) => {
          return JSON.stringify(ctx);
        },
        mdiIcon: (ctx) => {
          return icons[ctx] || '';
        },
      },
      context(path) {
        const pageContext = retrieveContext(path);
        return pageContext;
      },
    }),
  ],
  build: {
    rolldownOptions: {
      input: findPages(),
    },
  },
};
