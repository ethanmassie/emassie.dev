import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { mkdirSync, write, writeFile } from 'node:fs';
import { exit } from 'node:process';

const { window, document } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

const args = process.argv.slice(2);
let output = args[0] || `${import.meta.dirname}/public/lb`;

const links = {
  'all-time-listens.html':
    'https://api.listenbrainz.org/1/art/grid-stats/salad_dinner/all_time/4/0/750?caption=false',
  'this-year.html':
    'https://api.listenbrainz.org/1/art/grid-stats/salad_dinner/this_year/4/0/750?caption=false',
  'this-month.html':
    'https://api.listenbrainz.org/1/art/grid-stats/salad_dinner/this_month/4/0/750?caption=false',
};

mkdirSync(output, { recursive: true });

Object.entries(links).forEach(async ([file, src]) => {
  await fetch(src)
    .then((resp) => resp.text())
    .then((text) => {
      const cleanTxt = DOMPurify.sanitize(text, {
        ADD_ATTR: ['target'],
      });

      return new Promise((resolve, reject) => {
        writeFile(`${output}/${file}`, cleanTxt, {}, (err) => {
          if (err !== null) {
            reject(err);
          }
          resolve();
        });
      });
    })
    .catch((err) => {
      console.error(err);
      exit(1);
    });
});
