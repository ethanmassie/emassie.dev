import { html } from 'lit';
import {
  findFile,
  getPath,
  type Dir,
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

export const cat: ExecutableFn = (term, fs, [path]) => {
  const file = findFile(fs, path);
  if (!file) {
    term.printLn(`No such file ${path}`);
    return;
  }

  if (file?.type !== 'text_file') {
    term.printLn('File must be a text file');
    return;
  }

  term.print(file.contents());
};

export const cowSay: ExecutableFn = (term, _fs, args) => {
  const message = args.join(' ') || 'Type your message after the command';
  term.print(String.raw`      ${'_'.repeat(message.length + 4)}
      < ${message} >
      ${'-'.repeat(message.length + 4)}
          \   ^__^
           \  (oo)\_______
              (__)\       )\/\
                  ||----w |
                  ||     ||`);
};

export const exitTerminal: ExecutableFn = () => {
  history.back();
};

export function buildExec(
  name: string,
  exec: ExecutableFn,
  parent?: Dir,
): Executable {
  return {
    type: 'exec',
    name,
    exec,
    parent,
  };
}

export const executables: Omit<Executable, 'parent'>[] = [
  buildExec('ls', ls),
  buildExec('pwd', pwd),
  buildExec('cd', cd),
  buildExec('clear', clear),
  buildExec('ba-boom', execNavigate('/app/ba-boom/')),
  buildExec('pyramid', execNavigate('/app/pyramid/')),
  buildExec('exit', exitTerminal),
  buildExec('cat', cat),
];
