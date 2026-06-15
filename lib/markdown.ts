// Utility to parse basic Markdown syntax into Sanity Portable Text block format

export function parseMarkdownToPortableText(text: string) {
  if (!text) return [];

  // Split text by newlines into block segments
  const lines = text.split(/\n/);
  const blocks: any[] = [];

  let currentListItems: any[] = [];
  let inList = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push(...currentListItems);
      currentListItems = [];
    }
    inList = false;
  };

  const parseInlineStyles = (content: string, blockKey: string) => {
    const children: any[] = [];
    let lastIndex = 0;

    // Matches:
    // 1. Bold: **text**
    // 2. Italic: *text*
    // 3. Inline code: `code`
    // 4. Link: [text](url)
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let match;
    let childIdx = 0;

    while ((match = regex.exec(content)) !== null) {
      const matchIndex = match.index;

      // Add preceding plain text
      if (matchIndex > lastIndex) {
        children.push({
          _type: "span",
          _key: `${blockKey}-${childIdx++}`,
          text: content.substring(lastIndex, matchIndex),
          marks: [],
        });
      }

      const fullMatch = match[0];
      if (fullMatch.startsWith("**")) {
        children.push({
          _type: "span",
          _key: `${blockKey}-${childIdx++}`,
          text: match[2],
          marks: ["strong"],
        });
      } else if (fullMatch.startsWith("*")) {
        children.push({
          _type: "span",
          _key: `${blockKey}-${childIdx++}`,
          text: match[3],
          marks: ["em"],
        });
      } else if (fullMatch.startsWith("`")) {
        children.push({
          _type: "span",
          _key: `${blockKey}-${childIdx++}`,
          text: match[4],
          marks: ["code"],
        });
      } else if (fullMatch.startsWith("[")) {
        const linkKey = `link-${blockKey}-${childIdx}`;
        children.push({
          _type: "span",
          _key: `${blockKey}-${childIdx++}`,
          text: match[5],
          marks: [linkKey],
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Add trailing plain text
    if (lastIndex < content.length) {
      children.push({
        _type: "span",
        _key: `${blockKey}-${childIdx++}`,
        text: content.substring(lastIndex),
        marks: [],
      });
    }

    // Build link mark definitions
    const markDefs: any[] = [];
    regex.lastIndex = 0;
    let linkIdx = 0;
    while ((match = regex.exec(content)) !== null) {
      if (match[0].startsWith("[")) {
        markDefs.push({
          _key: `link-${blockKey}-${linkIdx}`,
          _type: "link",
          href: match[6],
        });
        linkIdx++;
      }
    }

    return { children, markDefs };
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Empty line closes active lists
      flushList();
      continue;
    }

    const blockKey = `block-${i}`;

    // 1. Heading 1
    if (line.startsWith("# ")) {
      flushList();
      const content = line.substring(2);
      const { children, markDefs } = parseInlineStyles(content, blockKey);
      blocks.push({
        _type: "block",
        _key: blockKey,
        style: "h1",
        children,
        markDefs,
      });
    }
    // 2. Heading 2
    else if (line.startsWith("## ")) {
      flushList();
      const content = line.substring(3);
      const { children, markDefs } = parseInlineStyles(content, blockKey);
      blocks.push({
        _type: "block",
        _key: blockKey,
        style: "h2",
        children,
        markDefs,
      });
    }
    // 3. Heading 3
    else if (line.startsWith("### ")) {
      flushList();
      const content = line.substring(4);
      const { children, markDefs } = parseInlineStyles(content, blockKey);
      blocks.push({
        _type: "block",
        _key: blockKey,
        style: "h3",
        children,
        markDefs,
      });
    }
    // 4. Blockquote
    else if (line.startsWith("> ")) {
      flushList();
      const content = line.substring(2);
      const { children, markDefs } = parseInlineStyles(content, blockKey);
      blocks.push({
        _type: "block",
        _key: blockKey,
        style: "blockquote",
        children,
        markDefs,
      });
    }
    // 5. Bullet lists
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      const content = line.substring(2);
      const { children, markDefs } = parseInlineStyles(content, blockKey);
      currentListItems.push({
        _type: "block",
        _key: blockKey,
        style: "normal",
        listItem: "bullet",
        level: 1,
        children,
        markDefs,
      });
    }
    // 6. Inline Image block: ![alt](src)
    else if (line.startsWith("![") && line.endsWith(")")) {
      flushList();
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (match) {
        const alt = match[1];
        const src = match[2];

        // extract reference id if it is in Sanity ID format or URL format
        let refId = src;
        if (src.includes("image-") && src.includes("-")) {
          // If src has query params or full path, extract the core ID (e.g. image-xxx-png)
          const parts = src.split("/");
          const lastPart = parts[parts.length - 1].split("?")[0];
          refId = lastPart.includes(".") ? lastPart.substring(0, lastPart.lastIndexOf(".")) : lastPart;
        }

        blocks.push({
          _type: "image",
          _key: blockKey,
          asset: {
            _type: "reference",
            _ref: refId,
          },
          alt: alt || undefined,
        });
      }
    }
    // 7. Normal paragraph
    else {
      flushList();
      const { children, markDefs } = parseInlineStyles(line, blockKey);
      blocks.push({
        _type: "block",
        _key: blockKey,
        style: "normal",
        children,
        markDefs,
      });
    }
  }

  flushList();
  return blocks;
}
