// TODO: Some thoughts...
// Parse source code into CST
// Query should go over the entire CST, instead of a single line.
//   So we can take into account local scope queries, folding, etc.
// Calculating the specificity of a selector is a good start.
//   Should we maybe also check on the pattern index inside a query file?

import Parser from "web-tree-sitter";
import treeSitterWasm from "web-tree-sitter/tree-sitter.wasm?url";

export class Syntax {
  #parser: Parser;

  private constructor(parser: Parser) {
    this.#parser = parser;
  }

  public static async init() {
    try {
      await Parser.init({
        locateFile() {
          return treeSitterWasm;
        },
      });
    } catch (e) {
      console.error(e);
    }
    const parser = new Parser();

    return new Syntax(parser);
  }

  public async loadLanguage(lang: string) {
    const loadedLang = await Parser.Language.load(lang);
    this.#parser.setLanguage(loadedLang);
  }

  public async parse(text: string) {
    return this.#parser.parse(text);
  }

  public query(text: string) {
    const lang = this.#parser.getLanguage();
    return lang.query(text);
  }
}

// Calculate the specificity of a highlight class
// https://tree-sitter.github.io/tree-sitter/syntax-highlighting#highlight-names
function calculateSpecificity(tokenName: string) {
  return tokenName.split(".").length;
}

export function renderHTML(
  rootNode: Parser.SyntaxNode,
  source: string,
  query: Parser.Query,
) {
  const captures = query.captures(rootNode);
  let highlightedSource: string = "";
  let currentCursor = 0;
  const matchedIds: Record<number, string> = {};

  if (captures.length > 0) {
    captures.forEach(token => {
      // TODO: Ok this is a work around for rust attributes, which are better matched by punctuations and string..
      // Will fix this before a merge
      if (token.name === "attribute") {
        return;
      }
      if (
        matchedIds[token.node.id] &&
        calculateSpecificity(token.name) <
          calculateSpecificity(matchedIds[token.node.id])
      ) {
        return;
      } else if (matchedIds[token.node.id]) {
        return;
      }
      matchedIds[token.node.id] = token.name;

      highlightedSource += source.substring(
        currentCursor,
        token.node.startIndex,
      );

      highlightedSource += `<span class="syntax-${token.name}">${token.node.text}</span>`;
      currentCursor = token.node.endIndex;
    });
  } else {
    highlightedSource += source;
  }
  const lastFoundToken = captures[captures.length - 1];
  highlightedSource += source.substring(lastFoundToken.node.endIndex);
  return highlightedSource.split("\n");
}
