import type { TerminalElement } from '../terminal';

type BaseFile = {
  name: string;
  parent: Dir | undefined;
};

export type TextFile = BaseFile & {
  type: 'text_file';
  contents: string;
};

export type ExecutableFn = (
  terminal: TerminalElement,
  fs: FileSystem,
  args: string[],
) => void;

export type Executable = BaseFile & {
  type: 'exec';
  exec: ExecutableFn;
};

export type Dir = {
  type: 'dir';
  name: string;
  parent: Dir | undefined;
  children: FsNode[];
};

export type FsNode = TextFile | Executable | Dir;

export type FileSystem = {
  root: Dir;
  cwd: Dir;
  // directories to look for executables in
  path: string[];
};

export function getPath(dir: Dir) {
  let path = [];
  let curr = dir;

  while (true) {
    path.push(curr.name);

    if (!curr.parent) {
      break;
    }

    curr = curr.parent;
  }

  return path.reverse().join('/') || '/';
}

export function addChild(dir: Dir, node: Omit<FsNode, 'parent'>): Dir {
  if (!dir.children) {
    dir.children = [];
  }

  const newChild = node as FsNode;
  newChild.parent = dir;
  dir.children.push(newChild);

  return dir;
}

export function buildDir(
  dir: Omit<Dir, 'parent'>,
  children: Omit<FsNode, 'parent'>[],
): Dir {
  children.forEach((child) => {
    addChild(dir as Dir, child);
  });

  return dir as Dir;
}

export function findChild(dir: Dir, name: string) {
  return dir.children.find((c) => c.name === name);
}

export function findRelativeFile(dir: Dir, path: string[]): FsNode | undefined {
  let currentDir = dir;
  for (let i = 0; i < path.length; i++) {
    const isLastPart = i === path.length - 1;
    const part = path[i];
    if (part === '.') {
      continue;
    }

    if (part === '..') {
      if (currentDir.parent === undefined) {
        return undefined;
      }

      currentDir = currentDir.parent;
      continue;
    }
    const child = findChild(currentDir, part);

    if (isLastPart) {
      return child;
    }

    if (!child || child.type !== 'dir') {
      return undefined;
    }

    currentDir = child as Dir;
  }

  return currentDir;
}

function findFileInPath(fs: FileSystem, name: string) {
  return fs.path.flatMap((pathDir) => {
    return findFile(fs, pathDir + '/' + name);
  })[0];
}

export function findFile(fs: FileSystem, path: string): FsNode | undefined;
export function findFile(
  fs: FileSystem,
  path: string,
  enforceType: 'dir',
  checkPath: boolean,
): Dir | undefined;
export function findFile(
  fs: FileSystem,
  path: string,
  enforceType: 'text_file',
  checkPath: boolean,
): TextFile | undefined;
export function findFile(
  fs: FileSystem,
  path: string,
  enforceType: 'exec',
  checkPath: boolean,
): Executable | undefined;
export function findFile(
  fs: FileSystem,
  path: string,
  enforceType: 'dir' | 'text_file' | 'exec' | undefined = undefined,
  checkPath = false,
): FsNode | undefined {
  const returnFile = (file: FsNode | undefined) => {
    if (file === undefined) {
      return undefined;
    }

    if (enforceType !== undefined && file.type !== enforceType) {
      return undefined;
    }

    return file;
  };

  if (path === '/') {
    return returnFile(fs.root);
  }

  if (checkPath && path.match(/\//) === null) {
    return returnFile(findFileInPath(fs, path));
  }

  const hasLeadingSlash = path.match(/^\//) !== null;
  const parts = path.split('/');
  if (hasLeadingSlash) {
    // remove leading dot or empty space
    parts.splice(0, 1);
  }

  const startDir = hasLeadingSlash ? fs.root : fs.cwd;

  return returnFile(findRelativeFile(startDir, parts));
}
