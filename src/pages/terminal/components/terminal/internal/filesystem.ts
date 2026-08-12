import type { TerminalElement } from '../terminal';

export type FileType = 'exec' | 'dir' | 'text_file';

type BaseFile = {
  type: FileType;
  name: string;
  parent: Dir | undefined;
};

export type TextFile = BaseFile & {
  type: 'text_file';
  contents: () => string;
};

export type ExecutableResult = {
  code: number;
  msg?: string;
};

export type ExecutableFn = (
  terminal: TerminalElement,
  fs: FileSystem,
  args: string[],
) => ExecutableResult;

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

type Orphan = {
  parent: never;
};

export type OrphanTextFile = Omit<TextFile, 'parent'> & Orphan;
export type OrphanExecutable = Omit<Executable, 'parent'> & Orphan;
export type OrphanDir = Omit<Dir, 'parent'> & Orphan;
export type RootDir = OrphanDir;
export type OrphanFsNode = OrphanTextFile | OrphanExecutable | OrphanDir;

export type FileSystem = {
  root: RootDir;
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

export function addChild(dir: Dir, node: OrphanFsNode): Dir {
  if (!dir.children) {
    dir.children = [];
  }

  const newChild = node as FsNode;
  newChild.parent = dir;
  dir.children.push(newChild);

  return dir;
}

export function buildDir(name: string, children: OrphanFsNode[]): OrphanDir;
export function buildDir(
  name: string,
  children: OrphanFsNode[],
  parent?: Dir,
): Dir {
  const dir: Dir = {
    type: 'dir',
    name,
    parent,
    children: [],
  };
  children.forEach((child) => {
    addChild(dir as Dir, child);
  });

  return dir as Dir;
}

export function buildTextFile(
  name: string,
  contents: string | (() => string),
): OrphanTextFile;
export function buildTextFile(
  name: string,
  contents: string | (() => string),
  parent?: Dir,
): TextFile {
  const contentsFn = typeof contents === 'string' ? () => contents : contents;
  return {
    type: 'text_file',
    name,
    contents: contentsFn,
    parent,
  };
}

export function findChild(dir: Dir, name: string) {
  return dir.children.find((c) => c.name === name);
}

export function findRelativeFile(dir: Dir, path: string[]): FsNode | undefined {
  return path.reduce(
    (currentNode, pathPart) => {
      // found nothing or reached a non dir before the terminal point
      if (!currentNode || currentNode.type !== 'dir') {
        return undefined;
      }

      if (pathPart === '.') {
        return currentNode;
      }

      if (pathPart === '..') {
        return currentNode.parent;
      }

      return findChild(currentNode, pathPart);
    },
    dir as FsNode | undefined,
  );
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
    // remove empty space left by the leading slash
    parts.splice(0, 1);
  }

  const startDir = hasLeadingSlash ? fs.root : fs.cwd;

  return returnFile(findRelativeFile(startDir, parts));
}
