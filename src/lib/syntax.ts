import Parser from "web-tree-sitter";
import treeSitterWasm from "web-tree-sitter/tree-sitter.wasm?url";

import highlightsJs from "@app/lib/syntax/js-highlights.scm?raw";
import highlightsJson from "@app/lib/syntax/json-highlights.scm?raw";
import highlightsHtml from "@app/lib/syntax/html-highlights.scm?raw";
import highlightsC from "@app/lib/syntax/c-highlights.scm?raw";
import highlightsSvelte from "@app/lib/syntax/svelte-highlights.scm?raw";
import highlightsRust from "@app/lib/syntax/rust-highlights.scm?raw";
import treeSitterJavascript from "@app/lib/syntax/tree-sitter-javascript.wasm?url";
import treeSitterC from "@app/lib/syntax/tree-sitter-c.wasm?url";
import treeSitterHtml from "@app/lib/syntax/tree-sitter-html.wasm?url";
import treeSitterRust from "@app/lib/syntax/tree-sitter-rust.wasm?url";
import treeSitterSvelte from "@app/lib/syntax/tree-sitter-svelte.wasm?url";
import treeSitterJson from "@app/lib/syntax/tree-sitter-json.wasm?url";

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

  public async getQuery(fileExtension: string) {
    if (fileExtension === "ts") {
      await this.loadLanguage(treeSitterJavascript);
      return this.query(highlightsJs);
    } else if (fileExtension === "js") {
      await this.loadLanguage(treeSitterJavascript);
      return this.query(highlightsJs);
    } else if (fileExtension === "c") {
      await this.loadLanguage(treeSitterC);
      return this.query(highlightsC);
    } else if (fileExtension === "svelte") {
      await this.loadLanguage(treeSitterSvelte);
      return this.query(highlightsSvelte);
    } else if (fileExtension === "json") {
      await this.loadLanguage(treeSitterJson);
      return this.query(highlightsJson);
    } else if (fileExtension === "html") {
      await this.loadLanguage(treeSitterHtml);
      return this.query(highlightsHtml);
    } else if (fileExtension === "rs") {
      await this.loadLanguage(treeSitterRust);
      return this.query(highlightsRust);
    }
  }
}

// Calculate the specificity of a highlight class
// https://tree-sitter.github.io/tree-sitter/syntax-highlighting#highlight-names
function calculateSpecificity(tokenName: string) {
  return tokenName.split(".").length;
}

export function renderHTML(captures: Parser.QueryCapture[], source: string) {
  let highlightedSource: string = "";
  let currentCursor = 0;
  const matchedIds: Record<number, string> = {};

  if (captures.length > 0) {
    captures.forEach(token => {
      // If the current cursor already passed, the new token, just return early
      // We should probably do some iteration over the different layers of highlighting
      if (token.node.startIndex < currentCursor) {
        return;
      }
      // If there are two tokens with the same id,
      // and the new one is lower in specificity just return early.
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

      highlightedSource += `<span class="syntax ${token.name.replace(
        ".",
        " ",
      )}">${token.node.text}</span>`;
      currentCursor = token.node.endIndex;
    });
  } else {
    highlightedSource += source;
  }
  const lastFoundToken = captures[captures.length - 1];
  highlightedSource += source.substring(lastFoundToken.node.endIndex);
  return highlightedSource.split("\n");
}
