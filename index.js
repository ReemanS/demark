/**
 * Demark - a simple markdown to html parser for blogs and web content
 * Perfect for React apps and Next.js projects
 */

class Demark {
  constructor() {
    // Regex patterns for different markdown elements
    // not exhaustive, i might need to support more Markdown cases
    this.patterns = {
      // frontmatter (metadata at the top)
      frontmatter: /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/,
      // headings (h1-h6)
      heading: /^(#{1,6})\s+(.+)/gm,
      // bold text
      bold: /\*\*(.*?)\*\*/g,
      // italic text
      italic: /_(.*?)_/g,
      // links
      link: /\[([^\]]+)\]\(([^)]+)\)/g,
      // images
      image: /!\[([^\]]*)\]\(([^)]+)\)/g,
      // code blocks - fixed pattern
      codeBlock: /```(\w+)?\n?([\s\S]*?)\n?```/g,
      // inline code
      inlineCode: /`([^`]+)`/g,
      // line breaks
      lineBreak: /\n\s*\n/g,
      // horizontal rules
      horizontalRule: /^---+$/gm,
    };
  }

  /**
   * parses a full markdown document with frontmatter,
   * perfect for blog posts and content pages
   * @param {string} markdownContent - full markdown content with optional frontmatter
   * @returns {object} - { frontmatter: {}, content: 'html', rawContent: 'markdown' }
   */
  parseDocument(markdownContent) {
    if (!markdownContent || typeof markdownContent !== "string") {
      return {
        frontmatter: {},
        content: "",
        rawContent: "",
      };
    }

    // extract frontmatter if it exists
    const frontmatterMatch = markdownContent.match(this.patterns.frontmatter);
    let frontmatter = {};
    let content = markdownContent;

    if (frontmatterMatch) {
      // parse the frontmatter (simple key: value format)
      frontmatter = this._parseFrontmatter(frontmatterMatch[1]);
      // remove frontmatter from content
      content = markdownContent.replace(this.patterns.frontmatter, "").trim();
    }

    // parse the markdown content to html
    const htmlContent = this.parse(content);

    return {
      frontmatter,
      content: htmlContent,
      rawContent: content,
    };
  }

  /**
   * main parsing function - converts markdown string to html
   * @param {string} markdown - the markdown content to parse
   * @returns {string} - the resulting html string
   */
  parse(markdown) {
    if (!markdown || typeof markdown !== "string") {
      return "";
    }

    let html = markdown;

    // parse headings first (h1-h6)
    html = this._parseHeadings(html);

    // parse images before links (to avoid conflicts)
    html = this._parseImages(html);

    // parse links
    html = this._parseLinks(html);

    // parse code blocks before inline code
    html = this._parseCodeBlocks(html);

    // parse inline code
    html = this._parseInlineCode(html);

    // parse bold text
    html = this._parseBold(html);

    // parse italic text
    html = this._parseItalic(html);

    // parse horizontal rules
    html = this._parseHorizontalRules(html);

    // parse paragraphs
    html = this._parseParagraphs(html);

    return html.trim();
  }

  /**
   * parses markdown headings (# ## ### etc.) into html h1-h6 tags
   * @param {string} text - text to parse
   * @returns {string} - text with headings converted to html
   */
  _parseHeadings(text) {
    return text.replace(this.patterns.heading, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content.trim()}</h${level}>`;
    });
  }

  /**
   * parses markdown bold text (**text**) into html strong tags
   * @param {string} text - text to parse
   * @returns {string} - text with bold converted to html
   */
  _parseBold(text) {
    return text.replace(this.patterns.bold, "<strong>$1</strong>");
  }

  /**
   * parses markdown italic text (_text_) into html em tags
   * @param {string} text - text to parse
   * @returns {string} - text with italics converted to html
   */
  _parseItalic(text) {
    return text.replace(this.patterns.italic, "<em>$1</em>");
  }

  /**
   * parses markdown links [text](url) into html anchor tags
   * @param {string} text - text to parse
   * @returns {string} - text with links converted to html
   */
  _parseLinks(text) {
    return text.replace(this.patterns.link, '<a href="$2">$1</a>');
  }

  /**
   * parses markdown images ![alt](src) into html img tags
   * @param {string} text - text to parse
   * @returns {string} - text with images converted to html
   */
  _parseImages(text) {
    return text.replace(this.patterns.image, '<img src="$2" alt="$1" />');
  }

  /**
   * parses markdown code blocks ```lang\ncode``` into html pre/code tags
   * @param {string} text - text to parse
   * @returns {string} - text with code blocks converted to html
   */
  _parseCodeBlocks(text) {
    return text.replace(this.patterns.codeBlock, (match, lang, code) => {
      const language = lang ? ` class="language-${lang}"` : "";
      return `<pre><code${language}>${this._escapeHtml(
        code.trim()
      )}</code></pre>`;
    });
  }

  /**
   * parses markdown inline code `code` into html code tags
   * @param {string} text - text to parse
   * @returns {string} - text with inline code converted to html
   */
  _parseInlineCode(text) {
    return text.replace(this.patterns.inlineCode, "<code>$1</code>");
  }

  /**
   * parses horizontal rules (---) into html hr tags
   * @param {string} text - text to parse
   * @returns {string} - text with horizontal rules converted to html
   */
  _parseHorizontalRules(text) {
    return text.replace(this.patterns.horizontalRule, "<hr />");
  }

  /**
   * wraps remaining text content in paragraph tags,
   * this should be called last in the parsing chain
   * @param {string} text - text to parse
   * @returns {string} - text with paragraphs wrapped in p tags
   */
  _parseParagraphs(text) {
    // split by double line breaks to get paragraphs
    const paragraphs = text.split(/\n\s*\n/);

    return paragraphs
      .map((paragraph) => {
        const trimmed = paragraph.trim();

        // skip empty paragraphs
        if (!trimmed) return "";

        // don't wrap if it's already an html element
        if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
          return trimmed;
        }

        // wrap single lines in paragraph tags
        return `<p>${trimmed}</p>`;
      })
      .filter((p) => p)
      .join("\n\n");
  }

  /**
   * escapes html characters in text to prevent rendering issues and xss
   * @param {string} text - text to escape
   * @returns {string} - escaped text
   */
  _escapeHtml(text) {
    const htmlEntities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }

  /**
   * parses frontmatter content into an object,
   * supports simple k-v (key: value and key: "value") formats
   * @param {string} frontmatterContent - the frontmatter text content
   * @returns {object} - parsed frontmatter as key-value pairs
   */
  _parseFrontmatter(frontmatterContent) {
    const frontmatter = {};
    const lines = frontmatterContent.trim().split("\n");

    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return;

      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // handle arrays [item1, item2, item3]
      if (value.startsWith("[") && value.endsWith("]")) {
        const arrayContent = value.slice(1, -1).trim();
        if (arrayContent) {
          value = arrayContent.split(",").map((item) => {
            item = item.trim();
            // remove quotes from array items
            if (
              (item.startsWith('"') && item.endsWith('"')) ||
              (item.startsWith("'") && item.endsWith("'"))
            ) {
              item = item.slice(1, -1);
            }
            return item;
          });
        } else {
          value = [];
        }
      } else {
        // remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // try to parse as number or boolean
        if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (!isNaN(value) && !isNaN(parseFloat(value)))
          value = parseFloat(value);
      }

      frontmatter[key] = value;
    });

    return frontmatter;
  }

  /**
   * utility function to create route-friendly slugs from strings,
   * useful for generating paths from blog titles
   * @param {string} text - text to convert to slug
   * @returns {string} - url-friendly slug
   */
  createSlug(text) {
    if (!text) return "";

    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special characters
      .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
  }
}

// **************
const demark = new Demark();

/**
 * convenience function for quick parsing
 * @param {string} markdown - markdown text to parse
 * @returns {string} - resulting html
 */
function parse(markdown) {
  return demark.parse(markdown);
}

/**
 * convenience function for parsing full documents with frontmatter,
 * perfect for blog posts and content management
 * @param {string} markdownContent - full markdown document
 * @returns {object} - { frontmatter, content, rawContent }
 */
function parseDocument(markdownContent) {
  return demark.parseDocument(markdownContent);
}

/**
 * utility function to create url-friendly slugs
 * @param {string} text - text to convert
 * @returns {string} - slug
 */
function createSlug(text) {
  return demark.createSlug(text);
}

export { Demark, parse, parseDocument, createSlug };
export default parse;
