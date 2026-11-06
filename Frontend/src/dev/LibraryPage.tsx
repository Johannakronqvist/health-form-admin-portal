import { useState, type ComponentType } from 'react';
import { Badge, Heading, SideNav, Text } from '@/components';
import { slug } from './library/slug';
import { ButtonDoc, MenuDoc, ModalDoc } from './library/docs/actions';
import { AvatarDoc, CardDoc, DataTableDoc, HeadingDoc, TextDoc } from './library/docs/content';
import { AlertDoc, BadgeDoc, HeartbeatDoc, SpinnerDoc, StateMessageDoc, StatusBadgeDoc } from './library/docs/feedback';
import { FieldDoc, RadioCardDoc, RadioGroupDoc, SearchFieldDoc, ToggleGroupDoc } from './library/docs/forms';
import { BreadcrumbsDoc, SideNavDoc, StepIndicatorDoc } from './library/docs/navigation';
import styles from './LibraryPage.module.css';

/*
  Developer-only component library, at /library while `npm run dev` runs.
  It's loaded from Root.tsx behind import.meta.env.DEV, so it's never part of a production build.
  To document a new component: add a <ComponentDoc> in library/docs/ and list it below.
*/

interface Group {
  title: string;
  docs: { name: string; Doc: ComponentType }[];
}

const groups: Group[] = [
  {
    title: 'Actions',
    docs: [
      { name: 'Button', Doc: ButtonDoc },
      { name: 'Menu', Doc: MenuDoc },
      { name: 'Modal', Doc: ModalDoc },
    ],
  },
  {
    title: 'Form fields',
    docs: [
      { name: 'Field', Doc: FieldDoc },
      { name: 'SearchField', Doc: SearchFieldDoc },
    ],
  },
  {
    title: 'Choices',
    docs: [
      { name: 'RadioGroup', Doc: RadioGroupDoc },
      { name: 'RadioCard', Doc: RadioCardDoc },
      { name: 'ToggleGroup', Doc: ToggleGroupDoc },
    ],
  },
  {
    title: 'Status and feedback',
    docs: [
      { name: 'Badge', Doc: BadgeDoc },
      { name: 'StatusBadge', Doc: StatusBadgeDoc },
      { name: 'Alert', Doc: AlertDoc },
      { name: 'Spinner', Doc: SpinnerDoc },
      { name: 'Heartbeat', Doc: HeartbeatDoc },
      { name: 'StateMessage', Doc: StateMessageDoc },
    ],
  },
  {
    title: 'Content and surfaces',
    docs: [
      { name: 'Heading', Doc: HeadingDoc },
      { name: 'Text', Doc: TextDoc },
      { name: 'Card', Doc: CardDoc },
      { name: 'Avatar', Doc: AvatarDoc },
      { name: 'DataTable', Doc: DataTableDoc },
    ],
  },
  {
    title: 'Navigation',
    docs: [
      { name: 'Breadcrumbs', Doc: BreadcrumbsDoc },
      { name: 'SideNav', Doc: SideNavDoc },
      { name: 'StepIndicator', Doc: StepIndicatorDoc },
    ],
  },
];

export default function LibraryPage() {
  const [currentHref, setCurrentHref] = useState(window.location.hash);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <SideNav
          label="Components"
          groups={groups.map((group) => ({
            label: group.title,
            items: group.docs.map(({ name }) => ({ href: `#${slug(name)}`, label: name })),
          }))}
          currentHref={currentHref}
          onNavigate={setCurrentHref}
        />
      </aside>

      <main className={styles.page}>
        <header className={styles.header}>
          <Badge tone="info" variant="soft">
            Development only
          </Badge>
          <Heading level={1}>Component library</Heading>
          <Text tone="muted" measure>
            The app's components in <code>src/components</code>, styled with the tokens in{' '}
            <code>src/styles/tokens.css</code>. Open <strong>Props and usage</strong> under a component for its props
            and a code example. UI text in the examples is Swedish, as in the app.
          </Text>
        </header>

        {groups.map((group) => (
          <section key={group.title} aria-labelledby={`group-${slug(group.title)}`} className={styles.group}>
            <Heading level={2} id={`group-${slug(group.title)}`} className={styles.groupTitle}>
              {group.title}
            </Heading>
            {group.docs.map(({ name, Doc }) => (
              <Doc key={name} />
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
