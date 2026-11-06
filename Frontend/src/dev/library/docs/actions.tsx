import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Ban,
  Copy,
  EllipsisVertical,
  Plus,
  Trash2,
  Unlink,
  Upload,
} from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Button, Menu, Modal, Text } from '@/components';
import { Row } from '@/dev/library/layout';
import { ComponentDoc } from '@/dev/library/ComponentDoc';

export function ButtonDoc() {
  const reasonId = useId();
  return (
    <ComponentDoc
      name="Button"
      file="src/components/Button/Button.tsx"
      examples={[
        {
          label: 'Hierarchy',
          content: (
            <Row>
              <Button variant="primary" rightIcon={ArrowRight}>
                Nästa: Välj frågor
              </Button>
              <Button variant="secondary">Tillbaka</Button>
              <Button variant="ghost">Avbryt</Button>
              <Button variant="danger" leftIcon={Trash2}>
                Ta bort från företaget
              </Button>
            </Row>
          ),
        },
        {
          label: 'Size',
          content: (
            <Row>
              <Button size="sm">Lägg till</Button>
              <Button size="md">Spara</Button>
              <Button size="lg">Skapa formulär</Button>
            </Row>
          ),
        },
        {
          label: 'Icons',
          content: (
            <Row>
              <Button leftIcon={Plus}>Lägg till</Button>
              <Button variant="secondary" leftIcon={Copy}>
                Kopiera formulär
              </Button>
              <Button iconOnly variant="secondary" size="sm" leftIcon={ArrowUp} ariaLabel="Flytta upp" />
              <Button iconOnly variant="secondary" size="sm" leftIcon={ArrowDown} ariaLabel="Flytta ned" />
            </Row>
          ),
        },
        {
          label: 'Disabled',
          content: (
            <Row>
              <Button disabled>Publicera</Button>
              <Button variant="secondary" disabled>
                Kopiera formulär
              </Button>
            </Row>
          ),
        },
        {
          label: 'Focusable disabled',
          content: (
            <Row>
              <Button disabled focusableWhenDisabled aria-describedby={reasonId}>
                Publicera
              </Button>
              <Text id={reasonId} size="sm" tone="muted">
                Spara ändringarna innan du publicerar
              </Text>
            </Row>
          ),
        },
        {
          label: 'Loading',
          content: (
            <Row>
              <Button loading>Sparar</Button>
              <Button variant="secondary" loading>
                Kopierar
              </Button>
            </Row>
          ),
        },
      ]}
      props={[
        { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'primary'" },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'" },
        { name: 'loading', type: 'boolean', default: 'false; keeps focus and colours, aria-busy, ignores clicks' },
        { name: 'disabled', type: 'boolean', default: 'false; native, skipped by Tab' },
        {
          name: 'focusableWhenDisabled',
          type: 'boolean',
          default: 'false; with disabled: stays in the tab order, pair with a reason via aria-describedby',
        },
        { name: 'leftIcon / rightIcon', type: 'LucideIcon' },
        { name: 'iconOnly', type: 'boolean', default: 'false; needs ariaLabel' },
        { name: 'ariaLabel', type: 'string' },
        { name: 'ref', type: 'Ref<HTMLButtonElement>', default: "e.g. for Modal's initialFocus" },
        { name: 'onClick, ...', type: 'ButtonHTMLAttributes', default: 'passed to the <button>' },
      ]}
      code={`<Button variant="primary" rightIcon={ArrowRight} onClick={goNext}>
  Nästa: Välj frågor
</Button>

<Button variant="secondary" leftIcon={Copy}>Kopiera formulär</Button>

<Button iconOnly variant="secondary" size="sm" leftIcon={ArrowUp} ariaLabel="Flytta upp" />

<Button loading={saving}>{saving ? 'Sparar' : 'Spara'}</Button>

// Can't be done yet: keep it reachable and say why
<Button
  disabled={hasUnsavedChanges}
  focusableWhenDisabled
  aria-describedby="publish-reason"
  onClick={publish}
>
  Publicera
</Button>
{hasUnsavedChanges && (
  <Text id="publish-reason" size="sm" tone="muted">Spara ändringarna innan du publicerar</Text>
)}`}
    />
  );
}

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button variant="danger" leftIcon={Trash2} onClick={() => setOpen(true)}>
        Open confirmation
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={'Ta bort "Hälsoprofil - Bygg" från Nordbygg AB?'}
        description="Formuläret är publicerat och planerat att skickas 4 nov. Utskicket ställs in. Själva formuläret finns kvar under Formulär."
        dismissLabel="Stäng"
        initialFocus={cancelRef}
        footer={
          <Row>
            <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Ta bort från företaget
            </Button>
          </Row>
        }
      />
    </>
  );
}

export function ModalDoc() {
  return (
    <ComponentDoc
      name="Modal"
      file="src/components/Modal/Modal.tsx"
      examples={[{ label: 'Confirmation', content: <ConfirmDemo /> }]}
      props={[
        { name: 'open', type: 'boolean', default: 'required' },
        { name: 'onClose', type: '() => void', default: 'required, also called on Escape' },
        { name: 'title', type: 'string', default: 'required, names the dialog' },
        { name: 'eyebrow', type: 'ReactNode', default: 'shown above the title, e.g. badges' },
        { name: 'description', type: 'ReactNode' },
        { name: 'children', type: 'ReactNode' },
        { name: 'footer', type: 'ReactNode' },
        { name: 'initialFocus', type: 'RefObject<HTMLElement | null>', default: 'first focusable element' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'dismissLabel', type: 'string', default: "'Close'" },
        { name: 'showDismiss', type: 'boolean', default: 'true' },
        { name: 'dismissOnBackdrop', type: 'boolean', default: 'true' },
        { name: 'headingLevel', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2' },
      ]}
      code={`const cancelRef = useRef<HTMLButtonElement>(null);

<Modal
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title={\`Ta bort "\${form.name}" från \${company.name}?\`}
  description="Själva formuläret finns kvar under Formulär."
  dismissLabel="Stäng"
  initialFocus={cancelRef}
  footer={
    <Row>
      <Button ref={cancelRef} variant="secondary" onClick={() => setConfirmOpen(false)}>
        Avbryt
      </Button>
      <Button variant="danger" onClick={removeLink}>Ta bort från företaget</Button>
    </Row>
  }
/>`}
    />
  );
}

export function MenuDoc() {
  return (
    <ComponentDoc
      name="Menu"
      file="src/components/Menu/Menu.tsx"
      examples={[
        {
          label: 'More actions (icon only)',
          content: (
            <Menu
              label="Fler åtgärder för Nyanställning"
              iconOnly
              icon={EllipsisVertical}
              size="sm"
              items={[
                { value: 'publish-changes', label: 'Publicera ändringar', icon: Upload },
                { value: 'unpublish', label: 'Avpublicera', icon: Ban },
                { separator: true },
                { value: 'unlink', label: 'Koppla bort formulär', icon: Unlink, destructive: true },
              ]}
            />
          ),
        },
        {
          label: 'Text trigger',
          content: (
            <Menu
              label="Exportera"
              items={[
                { value: 'pdf', label: 'Som PDF' },
                { value: 'csv', label: 'Som CSV', disabled: true },
              ]}
            />
          ),
        },
      ]}
      props={[
        { name: 'label', type: 'string', default: 'required; the aria-label when iconOnly' },
        { name: 'items', type: 'MenuItem[]', default: '[]' },
        { name: 'iconOnly', type: 'boolean', default: 'false; needs icon' },
        { name: 'icon', type: 'LucideIcon' },
        { name: 'align', type: "'start' | 'end'", default: "'start'" },
        { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'secondary'" },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'showChevron', type: 'boolean', default: 'true; text trigger only' },
        {
          name: 'MenuItem',
          type: '{ value, label, icon, disabled, destructive, onSelect, separator }',
          default: 'separator: true draws a divider',
        },
      ]}
      code={`<Menu
  label={\`Fler åtgärder för \${form.name}\`}
  iconOnly
  icon={EllipsisVertical}
  size="sm"
  align="end"
  items={[
    { value: 'unpublish', label: 'Avpublicera', icon: Ban, onSelect: () => askToUnpublish(form) },
    { separator: true },
    { value: 'unlink', label: 'Koppla bort formulär', icon: Unlink, destructive: true, onSelect: () => askToUnlink(form) },
  ]}
/>`}
    />
  );
}
