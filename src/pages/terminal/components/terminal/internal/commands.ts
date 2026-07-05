import {
  findFile,
  getPath,
  type Dir,
  type Executable,
  type ExecutableFn,
  type ExecutableResult,
  type FileType,
} from './filesystem';

function showFileType(type: FileType) {
  switch (type) {
    case 'exec':
      return 'x';
    case 'dir':
      return 'd';
    case 'text_file':
      return 'f';
    default:
      return '?';
  }
}

function success(msg?: string): ExecutableResult {
  return {
    code: 0,
    msg,
  };
}

function error(msg?: string, code = 1): ExecutableResult {
  return {
    code,
    msg,
  };
}

export const ls: ExecutableFn = (_term, fs, args) => {
  let dir = fs.cwd;
  if (args[0]) {
    const argDir = findFile(fs, args[0], 'dir', false);
    if (argDir === undefined) {
      return error('No such directory ' + argDir);
    }
    dir = argDir;
  }
  const files = dir.children.sort((a, b) => a.name.localeCompare(b.name));

  return success(
    files.map((f) => `${showFileType(f.type)} - ${f.name}`).join('\n'),
  );
};

export const pwd: ExecutableFn = (_term, fs, _args) => {
  return success(getPath(fs.cwd));
};

export const cd: ExecutableFn = (_term, fs, args) => {
  const target = args[0];
  if (!target) {
    return error('Path required');
  }

  const file = findFile(fs, target);
  if (!file) {
    return error('No such directory ' + target);
  }
  if (file?.type !== 'dir') {
    return error(`${target} is not a directory`);
  }
  fs.cwd = file;

  return success(getPath(fs.cwd));
};

export const clear: ExecutableFn = (term, _fs, _args) => {
  term.clear();
  return success();
};

export const execNavigate = (route: string): ExecutableFn => {
  return () => {
    location.href = route;
    return success();
  };
};

export const cat: ExecutableFn = (_term, fs, [path]) => {
  const file = findFile(fs, path);
  if (!file) {
    return error(`No such file ${path}`);
  }

  if (file?.type !== 'text_file') {
    return error('File must be a text file');
  }

  return success(file.contents());
};

export const cowSay: ExecutableFn = (_term, _fs, args) => {
  const message = args.join(' ') || 'Type your message after the command';
  return success(String.raw`      ${'_'.repeat(message.length + 4)}
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
  return success();
};

export const echo: ExecutableFn = (_term, _fs, args) => {
  return success(args.join(' '));
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
  buildExec('echo', echo),
];
