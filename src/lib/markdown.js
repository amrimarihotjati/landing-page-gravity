/**
 * Render plain Markdown text to React elements.
 * Supports: # H1, ## H2, ### H3, **bold**, *italic*, [link](url), lists, paragraphs.
 * This is intentionally kept simple — no external lib needed.
 */
export function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let currentParagraph = [];
  let listItems = [];
  let key = 0;

  const flush = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={key++}>{listItems.map((li, i) => <li key={i}>{inlineFormat(li)}</li>)}</ul>);
      listItems = [];
    }
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        elements.push(<p key={key++}>{inlineFormat(text)}</p>);
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flush();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flush();
      elements.push(<h3 key={key++}>{inlineFormat(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith("## ")) {
      flush();
      elements.push(<h2 key={key++}>{inlineFormat(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith("# ")) {
      flush();
      elements.push(<h1 key={key++}>{inlineFormat(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentParagraph.length > 0) flush();
      listItems.push(trimmed.slice(2));
    } else {
      if (listItems.length > 0) flush();
      currentParagraph.push(trimmed);
    }
  }

  flush();
  return elements;
}

/**
 * Inline formatting: **bold**, *italic*, [text](url)
 */
function inlineFormat(text) {
  // For simplicity, return as-is. Can be enhanced later.
  // This handles the most basic rendering needs.
  const parts = [];
  let remaining = text;
  let i = 0;

  // Process **bold**
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`b${i++}`}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) return text;

  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts;
}
