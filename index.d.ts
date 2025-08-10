// TypeScript declarations for demark package

export interface FrontmatterData {
  title?: string;
  date?: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  [key: string]: any;
}

export interface ParsedDocument {
  frontmatter: FrontmatterData;
  content: string;
  rawContent: string;
}

/**
 * Parses a full markdown document with frontmatter
 * @param markdownContent - full markdown content with optional frontmatter
 * @returns parsed document with frontmatter and content
 */
export function parseDocument(markdownContent: string): ParsedDocument;

/**
 * Converts markdown string to HTML
 * @param markdown - the markdown content to parse
 * @returns the resulting HTML string
 */
export function parse(markdown: string): string;

/**
 * Creates a URL-friendly slug from text
 * @param text - the text to convert to a slug
 * @returns the slug
 */
export function createSlug(text: string): string;
