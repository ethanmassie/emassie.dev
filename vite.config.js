import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import links from './links.json';

const contextMap = {
  '/index.html': {
    title: 'emassie.dev | Home',
    links
  },
}

export default {
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src', 'partials'),
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
        app: resolve(import.meta.dirname, 'app/index.html'),
      },
    },
  }
}