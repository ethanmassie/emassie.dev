import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import links from './links.json';
import { title } from 'process';
import { readdirSync } from 'node:fs';
import findPages from './find-pages';

const catFiles = readdirSync(resolve(import.meta.dirname, 'public', 'cats'));

const contextMap = {
  '/index.html': {
    links,
    catFiles,
  },
};

export default {
  plugins: [
    handlebars({
      partialDirectory: resolve(import.meta.dirname, 'src', 'partials'),
      context(path) {
        const pageContext = contextMap[path] || {};
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
