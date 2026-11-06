import { ChevronRight, EllipsisVertical } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, type MenuItem } from '@/components/Menu/Menu';
import styles from './DataTable.module.css';

/*
  The list tables on Formulär and Företag. Each row: a "more actions" menu first (visible
  without scrolling sideways), the name as a link, the page's own columns, and a chevron.
  A click anywhere on the row opens it; keyboard users use the name link.
*/

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  /** Id of the heading that names the table. */
  labelledBy: string;
  rows: T[];
  rowKey: (row: T) => string;
  /** Where the name link, the chevron and a click on the row go. */
  rowHref: (row: T) => string;
  /** Header of the name column, e.g. "Formulär". */
  nameHeader: string;
  name: (row: T) => string;
  /** A second line under the name. */
  nameDetail?: (row: T) => ReactNode;
  /** The columns after the name. */
  columns: DataTableColumn<T>[];
  /** Hidden header of the menu column, e.g. "Åtgärder". */
  menuHeader: string;
  /** Names the menu button, e.g. `Fler åtgärder för ${row.name}`. */
  menuLabel: (row: T) => string;
  menuItems: (row: T) => MenuItem[];
  /** Keys of rows to highlight briefly, e.g. when the user came from Översikt. */
  highlighted?: string[];
  /** Extra class for a row, e.g. the form that was just saved. */
  rowClassName?: (row: T) => string | undefined;
}

export function DataTable<T>({
  labelledBy,
  rows,
  rowKey,
  rowHref,
  nameHeader,
  name,
  nameDetail,
  columns,
  menuHeader,
  menuLabel,
  menuItems,
  highlighted = [],
  rowClassName,
}: DataTableProps<T>) {
  const navigate = useNavigate();

  // A click anywhere on a row opens it, except on its own links, buttons and menu
  function openRow(event: MouseEvent<HTMLTableRowElement>, row: T) {
    if ((event.target as HTMLElement).closest('a, button, [role="menu"]')) return;
    navigate(rowHref(row));
  }

  return (
    // Scrolls sideways on narrow screens instead of squeezing the columns
    <div className={styles.wrap}>
      <table className={styles.table} aria-labelledby={labelledBy}>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">{menuHeader}</span>
            </th>
            <th scope="col">{nameHeader}</th>
            {columns.map((column) => (
              <th key={column.header} scope="col">
                {column.header}
              </th>
            ))}
            <td aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                className={[styles.row, highlighted.includes(key) && styles.highlight, rowClassName?.(row)]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) => openRow(e, row)}
              >
                <td className={styles.menuCell}>
                  <Menu
                    label={menuLabel(row)}
                    iconOnly
                    icon={EllipsisVertical}
                    size="sm"
                    align="start"
                    items={menuItems(row)}
                  />
                </td>
                <th scope="row" className={styles.name}>
                  <Link to={rowHref(row)} className={styles.nameLink}>
                    {name(row)}
                  </Link>
                  {nameDetail && <span className={styles.sub}>{nameDetail(row)}</span>}
                </th>
                {columns.map((column) => (
                  <td key={column.header} className={column.className}>
                    {column.cell(row)}
                  </td>
                ))}
                <td className={styles.chevronCell}>
                  {/* The name link already opens the row; this is the same for mouse users */}
                  <Link to={rowHref(row)} className={styles.chevron} tabIndex={-1} aria-hidden="true">
                    <ChevronRight size={20} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
