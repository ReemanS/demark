# Demark

A lightweight markdown parser for React and Next.js projects.

I like to write in Markdown, and i use [Obsidian](https://obsidian.md) extensively in my day to day. This is part of the reason why I wrote this simple utility tool.

I created this to mainly be used in my web portfolio, but feel free to try it out.

## Features

- Lightweight with no dependencies
- Supports headings, bold, italic, links, images, code blocks
- Frontmatter parsing for blog metadata
- React component friendly

## Installation

Since this package isn't yet published to npm, install it locally:

```
# from your project directory
npm install file:../path/to/demark
```

or copy the demark folder into your project and install:

```
npm install file:./demark
```

## Usage

### Basic parsing

```javascript
import { parse } from "demark";

const markdown = "# Hello\n\nThis is **bold** text.";
const html = parse(markdown);
```

### With Frontmatter

```javascript
import { parseDocument } from "demark";

const markdownWithFrontmatter = `---
title: "My Blog Post"
date: "2025-01-01"
tags: ["react", "markdown"]
---

# Hello World

Your content here...`;

const { frontmatter, content } = parseDocument(markdownWithFrontmatter);
// frontmatter.title = "My Blog Post"
// content = "<h1>Hello World</h1><p>Your content here...</p>"
```

### Using with React Components

```jsx
import { parseDocument } from "demark";

function BlogPost({ markdownContent }) {
  const { frontmatter, content } = parseDocument(markdownContent);

  return (
    <article>
      <h1>{frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

## API

- `parse(markdown)` - Converts markdown to html
- `parseDocument(markdown)` - Parses frontmatter and content separately
- `createSlug(text)` - Creates URL-friendly slugs from text

## Supported Markdown

- Headings (`# ## ###`)
- Bold (`**text**`) and Italic (`_text_`)
- Links (`[text](url)`)
- Images (`![alt](src)`)
- Inline code (`` `code` ``) and code blocks
- Horizontal rules (`---`)

## Frontmatter example

```
---
title: "Post title"
date: "2025-01-01"
author: "Mr. Author"
tags: ["tag1", "tag2"]
featured: true
---
```
