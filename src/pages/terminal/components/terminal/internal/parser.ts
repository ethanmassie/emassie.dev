const QUOTE = '"';
const PIPE = '|';
const SPACE = ' ';

const READ_MODE = 0;
const WORD_MODE = 1;
const QUOTE_MODE = 2;
type TokenMode = typeof READ_MODE | typeof WORD_MODE | typeof QUOTE_MODE;

export type Literal = {
  type: 'literal';
  value: string;
};

type Pipe = {
  type: 'pipe';
};

export type Assignment = {
  type: 'assignment';
  variable: string;
  value: string;
};

export type Replacement = {
  type: 'replacement';
  variable: string;
};

export type Token = Literal | Pipe | Assignment | Replacement;

function tokenizeWord(word: string): Token {
  if (word === PIPE) {
    return { type: 'pipe' };
  }

  const assignmentCheck = word.match(/([a-zA-Z_\?]+)\=(.+)/);
  if (assignmentCheck !== null) {
    const [, variable, value] = assignmentCheck;
    return {
      type: 'assignment',
      variable,
      value,
    };
  }

  const variableCheck = word.match(/^\$([a-zA-Z_\?]+)$/);
  if (variableCheck !== null) {
    const [, variable] = variableCheck;
    return {
      type: 'replacement',
      variable,
    };
  }

  return {
    type: 'literal',
    value: word,
  };
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let mode: TokenMode = READ_MODE;
  let acc: string[] = [];

  for (let ch of input) {
    switch (mode) {
      case READ_MODE: {
        if (ch === QUOTE) {
          mode = QUOTE_MODE;
          continue;
        }

        if (ch === SPACE) {
          continue;
        }

        mode = WORD_MODE;
        acc.push(ch);
        break;
      }
      case WORD_MODE: {
        if (ch === SPACE) {
          const word = acc.join('');
          tokens.push(tokenizeWord(word));
          acc = [];
          mode = READ_MODE;
          continue;
        }

        acc.push(ch);
        break;
      }
      case QUOTE_MODE: {
        if (ch === QUOTE) {
          tokens.push({
            type: 'literal',
            value: acc.join(''),
          });
          acc = [];
          mode = READ_MODE;
          continue;
        }

        acc.push(ch);
        break;
      }
    }
  }

  if (mode === QUOTE_MODE) {
    throw new Error('Unclosed quote');
  }

  if (mode === WORD_MODE && acc.length !== 0) {
    tokens.push(tokenizeWord(acc.join('')));
  }

  return tokens;
}

export function parseTerminalInput(input: string): Token[][] {
  const tokens = tokenize(input);

  const segments: Token[][] = [];
  let currentSegment: Token[] = [];
  tokens.forEach((token) => {
    if (token.type === 'pipe') {
      segments.push(currentSegment);
      currentSegment = [];
      return;
    }

    currentSegment.push(token);
  });

  if (currentSegment.length !== 0) {
    segments.push(currentSegment);
  }

  return segments;
}
