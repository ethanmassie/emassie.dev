import { html } from 'lit';
import {
  findFile,
  getPath,
  type Executable,
  type ExecutableFn,
} from './filesystem';
import { map } from 'lit/directives/map.js';
import { choose } from 'lit/directives/choose.js';

export const ls: ExecutableFn = (term, fs, args) => {
  let dir = fs.cwd;
  if (args[0]) {
    const argDir = findFile(fs, args[0], 'dir', false);
    if (argDir === undefined) {
      term.printLn('No such directory ' + argDir);
      return;
    }
    dir = argDir;
  }
  const files = dir.children.sort((a, b) => a.name.localeCompare(b.name));

  term.printRichText(html`
    <ul class="ls-list">
      ${map(
        files,
        (file) => html`
          <li>
            ${choose(file.type, [
              ['exec', () => 'e'],
              ['dir', () => 'd'],
              ['text_file', () => 'f'],
            ])}
            - ${file.name}
          </li>
        `,
      )}
    </ul>
  `);
};

export const pwd: ExecutableFn = (term, fs, _args) => {
  term.printLn(getPath(fs.cwd));
};

export const cd: ExecutableFn = (term, fs, args) => {
  const target = args[0];
  if (!target) {
    term.printLn('Path required');
    return;
  }

  const file = findFile(fs, target);
  if (!file) {
    term.printLn('No such directory ' + target);
    return;
  }
  if (file?.type !== 'dir') {
    term.printLn(`${target} is not a directory`);
    return;
  }
  fs.cwd = file;

  term.printLn(getPath(fs.cwd));
};

export const clear: ExecutableFn = (term, _fs, _args) => {
  term.clear();
};

export const execNavigate = (route: string): ExecutableFn => {
  return () => {
    location.href = route;
  };
};

export const executables: Omit<Executable, 'parent'>[] = [
  {
    type: 'exec',
    name: 'ls',
    exec: ls,
  },
  {
    type: 'exec',
    name: 'pwd',
    exec: pwd,
  },
  {
    type: 'exec',
    name: 'cd',
    exec: cd,
  },
  {
    type: 'exec',
    name: 'clear',
    exec: clear,
  },
  {
    type: 'exec',
    name: 'ba-boom',
    exec: execNavigate('/app/ba-boom/'),
  },
  {
    type: 'exec',
    name: 'pyramid',
    exec: execNavigate('/app/pyramid/'),
  },
];
