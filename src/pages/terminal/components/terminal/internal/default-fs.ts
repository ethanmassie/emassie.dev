import { buildDir, type FileSystem, buildTextFile } from './filesystem';
import { buildExec, cowSay, executables } from './commands';
import mugiTxt from './mugi.txt?raw';
import viviTxt from './vivi.txt?raw';
import blackHoleTxt from './blackhole.txt?raw';

export function makeFS(): FileSystem {
  const root = buildDir('', [
    buildDir('bin', executables),
    buildDir('dev', [
      buildTextFile('random', () => Math.random().toString()),
      buildTextFile('null', blackHoleTxt),
    ]),
    buildDir('home', [
      buildDir('emassie', [
        buildDir('Documents', [
          buildTextFile('mugi.txt', mugiTxt),
          buildTextFile('vivi.txt', viviTxt),
        ]),
        buildDir('scripts', [buildExec('cowsay', cowSay)]),
      ]),
    ]),
  ]);

  return {
    root,
    cwd: root,
    path: ['/bin'],
  };
}
