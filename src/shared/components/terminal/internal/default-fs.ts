import { type Dir, buildDir, addChild, type FileSystem } from './filesystem';
import { executables } from './commands';

export function makeFS(): FileSystem {
  const root: Dir = {
    type: 'dir',
    parent: undefined,
    name: '',
    children: [],
  };

  const bin = buildDir(
    {
      type: 'dir',
      name: 'bin',
      children: [],
    },
    executables,
  );

  addChild(root, bin);

  return {
    root,
    cwd: root,
    path: ['/bin'],
  };
}
