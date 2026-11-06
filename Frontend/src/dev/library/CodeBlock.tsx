import { useState, type ReactNode } from 'react';
import styles from './ComponentDoc.module.css';

/*
  Tiny JSX highlighter for the library's own examples: tag names, attribute
  names, strings and braces. It builds React nodes (never innerHTML), so the
  example text is always rendered as text.
*/
const TOKEN = /(<\/?)([A-Za-z][\w.]*)|([A-Za-z][\w-]*)(?==)|("[^"]*"|'[^']*'|`[^`]*`)|([{}])|(\/\/[^\n]*)/g;

function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(code.slice(last, start));
    const [text, bracket, tag, attr, str, brace, comment] = match;
    const key = start;
    if (tag) {
      nodes.push(bracket);
      nodes.push(
        <span key={key} className={styles.tokTag}>
          {tag}
        </span>,
      );
    } else if (attr) {
      nodes.push(
        <span key={key} className={styles.tokAttr}>
          {attr}
        </span>,
      );
    } else if (str) {
      nodes.push(
        <span key={key} className={styles.tokString}>
          {str}
        </span>,
      );
    } else if (brace) {
      nodes.push(
        <span key={key} className={styles.tokBrace}>
          {brace}
        </span>,
      );
    } else if (comment) {
      nodes.push(
        <span key={key} className={styles.tokComment}>
          {comment}
        </span>,
      );
    } else {
      nodes.push(text);
    }
    last = start + text.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

interface CodeBlockProps {
  code: string;
  label: string;
}

export function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.code}>
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className={styles.srOnly} role="status">
        {copied ? 'Code copied' : ''}
      </span>
      <pre aria-label={label} tabIndex={0}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
