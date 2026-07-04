import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import links from './links.json';
import { title } from 'process';
import { readdirSync } from 'node:fs';

const catFiles = readdirSync(resolve(import.meta.dirname, 'public', 'cats'))

const contextMap = {
  '/index.html': {
    title: 'emassie.dev | Home',
    links,
    catFiles
  },
  '/app/ba-boom/index.html': {
    title: 'emassie.dev | Ba-Boom!'
  },
  '/app/pyramid/index.html': {
    title: 'emassie.dev | Pyramid'
  },
  '/about/index.html': {
    title: 'emassie.dev | About'
  }
}

export default {
  plugins: [
    handlebars({
      partialDirectory: resolve(import.meta.dirname, 'src', 'partials'),
      context(path) {
        const pageContext = contextMap[path] || {}
        return {
          title: 'emassie.dev',
          ...pageContext
        }
      }
    })
  ],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        baBoom: resolve(import.meta.dirname, 'app/ba-boom/index.html'),
        pyramid: resolve(import.meta.dirname, 'app/pyramid/index.html'),
        terminal: resolve(import.meta.dirname, 'app/terminal/index.html'),
      },
    },
  }
}