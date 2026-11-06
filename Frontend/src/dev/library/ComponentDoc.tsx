import type { ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import styles from './ComponentDoc.module.css';
import { slug } from './slug';

export interface PropRow {
  name: string;
  type: string;
  /** Default value, or a short note when there is none. */
  default?: string;
}

export interface ExampleRow {
  label: string;
  content: ReactNode;
}

interface ComponentDocProps {
  name: string;
  /** Path to the source, shown under the description. */
  file: string;
  examples: ExampleRow[];
  props: PropRow[];
  code: string;
}

/** One component: live examples in labelled rows, and a collapsible props table with code. */
export function ComponentDoc({ name, file, examples, props, code }: ComponentDocProps) {
  const id = slug(name);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.doc}>
      <h3 id={`${id}-title`} className={styles.name}>
        {name}
      </h3>
      <code className={styles.file}>{file}</code>

      <div className={styles.panel}>
        <dl className={styles.examples}>
          {examples.map((row) => (
            <div key={row.label} className={styles.exampleRow}>
              <dt className={styles.exampleLabel}>{row.label}</dt>
              <dd className={styles.exampleContent}>{row.content}</dd>
            </div>
          ))}
        </dl>
      </div>

      <details className={styles.panel}>
        <summary className={styles.summary}>Props and usage</summary>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.srOnly}>Props for {name}</caption>
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
              </tr>
            </thead>
            <tbody>
              {props.map((prop) => (
                <tr key={prop.name}>
                  <th scope="row">
                    <code>{prop.name}</code>
                  </th>
                  <td>
                    <code>{prop.type}</code>
                  </td>
                  <td>{prop.default ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={code} label={`Code example for ${name}`} />
      </details>
    </section>
  );
}
