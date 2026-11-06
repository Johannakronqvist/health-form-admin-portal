import { Building2, FileText, House } from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs, SideNav, StepIndicator } from '@/components';
import { Column } from '@/dev/library/layout';
import { ComponentDoc } from '@/dev/library/ComponentDoc';
import styles from './docs.module.css';

export function BreadcrumbsDoc() {
  return (
    <ComponentDoc
      name="Breadcrumbs"
      file="src/components/Breadcrumbs/Breadcrumbs.tsx"
      examples={[
        {
          label: 'Create form',
          content: (
            <Breadcrumbs
              label="Brödsmulor"
              items={[{ label: 'Formulär', href: '#breadcrumbs' }, { label: 'Nytt formulär' }]}
            />
          ),
        },
      ]}
      props={[
        { name: 'items', type: '{ label: string; href?: string }[]', default: '[]' },
        { name: 'label', type: 'string', default: "'Breadcrumb'" },
        { name: 'onNavigate', type: '(href: string, event: MouseEvent) => void', default: 'plain links' },
      ]}
      code={`<Breadcrumbs
  label="Brödsmulor"
  items={[{ label: 'Formulär', href: '/formular' }, { label: 'Nytt formulär' }]}
  onNavigate={(href, event) => {
    event.preventDefault();
    navigate(href);
  }}
/>`}
    />
  );
}

const demoItems = [
  { href: '#oversikt', label: 'Översikt', icon: House },
  { href: '#formular', label: 'Formulär', icon: FileText },
  { href: '#foretag', label: 'Företag', icon: Building2 },
];

interface SideNavDemoProps {
  /** Give the items their `icon`. */
  itemIcons?: boolean;
  collapsed?: boolean;
}

/** On the navy sidebar background, as in the app. */
function SideNavDemo({ itemIcons = false, collapsed = false }: SideNavDemoProps) {
  const [current, setCurrent] = useState('#formular');
  const items = itemIcons ? demoItems : demoItems.map(({ href, label }) => ({ href, label }));
  return (
    <div className={`theme-sidebar ${styles.navDemo} ${collapsed ? styles.navDemoCollapsed : ''}`}>
      <SideNav
        label="Exempelmeny"
        groups={[{ label: 'Meny', items }]}
        currentHref={current}
        collapsed={collapsed}
        onNavigate={(href, event) => {
          event.preventDefault();
          setCurrent(href);
        }}
      />
    </div>
  );
}

export function SideNavDoc() {
  return (
    <ComponentDoc
      name="SideNav"
      file="src/components/SideNav/SideNav.tsx"
      examples={[
        { label: 'Text only', content: <SideNavDemo /> },
        { label: 'With icons (icon on each item)', content: <SideNavDemo itemIcons /> },
        { label: 'Collapsed (needs item icons)', content: <SideNavDemo itemIcons collapsed /> },
      ]}
      props={[
        {
          name: 'groups',
          type: '{ label?: string; items: { href; label; icon? }[] }[]',
          default: "[]; an item's icon shows before its label, on every item",
        },
        { name: 'currentHref', type: 'string' },
        { name: 'onNavigate', type: '(href: string, event: MouseEvent) => void' },
        { name: 'label', type: 'string', default: "'Sections'" },
        { name: 'headingLevel', type: '1 | 2 | 3 | 4 | 5 | 6', default: 'group names without a heading' },
        { name: 'collapsed', type: 'boolean', default: 'false; icons only, names kept for screen readers' },
      ]}
      code={`// icon is optional on each item and shows before the label
const navItems = [
  { href: '/oversikt', label: 'Översikt', icon: House },
  { href: '/formular', label: 'Formulär', icon: FileText },
];

<SideNav
  label="Huvudmeny"
  groups={[{ label: 'Meny', items: navItems }]}
  currentHref={currentHref}
  onNavigate={(href, event) => {
    event.preventDefault();
    navigate(href);
  }}
/>`}
    />
  );
}

const wizardSteps = ['Formulärtyp', 'Frågor', 'Granska och spara'];

export function StepIndicatorDoc() {
  return (
    <ComponentDoc
      name="StepIndicator"
      file="src/components/StepIndicator/StepIndicator.tsx"
      examples={[
        {
          label: 'Create form',
          content: (
            <Column>
              <StepIndicator steps={wizardSteps} current={0} label="Steg" doneLabel="klar" />
              <StepIndicator steps={wizardSteps} current={1} label="Steg" doneLabel="klar" />
              <StepIndicator steps={wizardSteps} current={2} label="Steg" doneLabel="klar" />
            </Column>
          ),
        },
      ]}
      props={[
        { name: 'steps', type: 'string[]', default: 'required' },
        { name: 'current', type: 'number', default: 'required, 0-based' },
        { name: 'label', type: 'string', default: "'Steps'" },
        { name: 'doneLabel', type: 'string', default: "'completed'; hidden text after finished steps" },
      ]}
      code={`<StepIndicator
  steps={['Formulärtyp', 'Frågor', 'Granska och spara']}
  current={stepNumber - 1}
  label="Steg"
  doneLabel="klar"
/>`}
    />
  );
}
