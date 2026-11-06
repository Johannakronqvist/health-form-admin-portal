import { Copy, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button, Card, DataTable, Heading, Text } from '@/components';
import { Column, Columns, Row } from '@/dev/library/layout';
import { ComponentDoc } from '@/dev/library/ComponentDoc';

export function HeadingDoc() {
  return (
    <ComponentDoc
      name="Heading"
      file="src/components/Heading/Heading.tsx"
      examples={[
        {
          label: 'Levels',
          content: (
            <Column>
              <Heading level={4} size="2xl">
                Välkommen, Eva
              </Heading>
              <Heading level={4} size="xl">
                Senast ändrade formulär
              </Heading>
              <Heading level={4} size="lg">
                Frågebank
              </Heading>
            </Column>
          ),
        },
      ]}
      props={[
        { name: 'level', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2' },
        { name: 'size', type: "'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'", default: 'follows level' },
        { name: 'tone', type: "'default' | 'muted' | 'accent'", default: "'default'" },
      ]}
      code={`<Heading level={1}>Välkommen, Eva</Heading>
<Heading level={2} size="xl">Senast ändrade formulär</Heading>`}
    />
  );
}

export function TextDoc() {
  return (
    <ComponentDoc
      name="Text"
      file="src/components/Text/Text.tsx"
      examples={[
        {
          label: 'Variants',
          content: (
            <Column>
              <Text>Typen styr vilka standardfrågor som alltid ingår.</Text>
              <Text size="sm" tone="muted">
                Ändrad 28 okt av Eva Holm
              </Text>
              <Text tone="accent" weight="semibold">
                Visa alla formulär
              </Text>
            </Column>
          ),
        },
      ]}
      props={[
        { name: 'as', type: 'keyof JSX.IntrinsicElements', default: "'p'" },
        { name: 'size', type: "'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'", default: "'base'" },
        { name: 'tone', type: "'default' | 'muted' | 'accent'", default: "'default'" },
        { name: 'weight', type: "'regular' | 'medium' | 'semibold'", default: "'regular'" },
        { name: 'measure', type: 'boolean', default: 'false' },
      ]}
      code={`<Text size="sm" tone="muted">Ändrad {formatDate(form.updatedAt)} av {form.updatedBy}</Text>`}
    />
  );
}

export function CardDoc() {
  return (
    <ComponentDoc
      name="Card"
      file="src/components/Card/Card.tsx"
      examples={[
        {
          label: 'Variants',
          content: (
            <Columns min={220}>
              <Card title="Skapa formulär" headingLevel={4}>
                <Text size="sm" tone="muted">
                  Börja från en formulärtyp och välj frågor.
                </Text>
              </Card>
              <Card
                title="Senast ändrade formulär"
                headingLevel={4}
                footer={
                  <Button size="sm" variant="secondary">
                    Visa alla formulär
                  </Button>
                }
              >
                <Text size="sm">Nyanställning - standard</Text>
              </Card>
            </Columns>
          ),
        },
      ]}
      props={[
        { name: 'title', type: 'ReactNode' },
        { name: 'headingLevel', type: '1 | 2 | 3 | 4 | 5 | 6', default: '3' },
        { name: 'footer', type: 'ReactNode' },
        { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'as', type: 'keyof JSX.IntrinsicElements', default: "'div'" },
        { name: 'className, ...', type: 'HTMLAttributes', default: 'passed through' },
      ]}
      code={`<Card title="Skapa formulär" headingLevel={2}>
  <Text size="sm" tone="muted">Börja från en formulärtyp och välj frågor.</Text>
</Card>`}
    />
  );
}

export function AvatarDoc() {
  return (
    <ComponentDoc
      name="Avatar"
      file="src/components/Avatar/Avatar.tsx"
      examples={[
        {
          label: 'Size',
          content: (
            <Row>
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <Avatar key={size} name="Eva Holm" size={size} />
              ))}
            </Row>
          ),
        },
        {
          label: 'Tone',
          content: (
            <Row>
              {(['accent', 'neutral'] as const).map((tone) => (
                <Avatar key={tone} name="Jonas Eriksson" tone={tone} />
              ))}
            </Row>
          ),
        },
      ]}
      props={[
        { name: 'name', type: 'string', default: 'required, gives the initials' },
        { name: 'src', type: 'string' },
        { name: 'alt', type: 'string', default: "''" },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'" },
        { name: 'tone', type: "'accent' | 'neutral'", default: "'accent'" },
      ]}
      code={`<Avatar name={user.name} />`}
    />
  );
}

const exampleForms = [
  {
    id: 'form-1',
    name: 'Hälsoprofil med Arbetsplatsprofil - Bygg',
    type: 'Hälsoprofil med Arbetsplatsprofil',
    saved: true,
  },
  { id: 'form-5', name: 'Hälsoprofil - IT', type: 'Hälsoprofil', saved: false },
];

export function DataTableDoc() {
  return (
    <ComponentDoc
      name="DataTable"
      file="src/components/DataTable/DataTable.tsx"
      examples={[
        {
          label: 'Rows',
          content: (
            <DataTable
              labelledBy="datatable-title"
              rows={exampleForms}
              rowKey={(form) => form.id}
              // Stays on this page; in the app it opens the form
              rowHref={() => '#datatable'}
              menuHeader="Åtgärder"
              menuLabel={(form) => `Fler åtgärder för ${form.name}`}
              menuItems={() => [
                { value: 'copy', label: 'Kopiera formulär', icon: Copy },
                { separator: true },
                { value: 'delete', label: 'Ta bort formulär', icon: Trash2, destructive: true },
              ]}
              nameHeader="Formulär"
              name={(form) => form.name}
              nameDetail={(form) => (form.saved ? 'Används av 2 företag' : 'Används inte än')}
              columns={[
                { header: 'Formulärtyp', cell: (form) => form.type },
                {
                  header: 'Status',
                  cell: (form) => (
                    <Badge tone={form.saved ? 'success' : 'warning'} variant="soft">
                      {form.saved ? 'Sparad' : 'Utkast'}
                    </Badge>
                  ),
                },
              ]}
            />
          ),
        },
      ]}
      props={[
        { name: 'labelledBy', type: 'string', default: 'required, id of the heading that names the table' },
        { name: 'rows / rowKey', type: 'T[] / (row) => string', default: 'required' },
        { name: 'rowHref', type: '(row) => string', default: 'name link, chevron and row click' },
        { name: 'nameHeader / name', type: 'string / (row) => string', default: 'required' },
        { name: 'nameDetail', type: '(row) => ReactNode', default: 'a second line under the name' },
        { name: 'columns', type: '{ header, cell: (row) => ReactNode, className? }[]', default: 'required' },
        { name: 'menuHeader', type: 'string', default: "required, hidden header, e.g. 'Åtgärder'" },
        { name: 'menuLabel / menuItems', type: '(row) => string / (row) => MenuItem[]', default: 'required' },
        { name: 'highlighted', type: 'string[]', default: 'row keys to highlight briefly' },
        { name: 'rowClassName', type: '(row) => string | undefined' },
      ]}
      code={`<DataTable
  labelledBy="all-forms-heading"
  rows={forms}
  rowKey={(form) => form.id}
  rowHref={(form) => \`/formular/\${form.id}/redigera\`}
  menuHeader="Åtgärder"
  menuLabel={(form) => \`Fler åtgärder för \${form.name}\`}
  menuItems={(form) => [{ value: 'copy', label: 'Kopiera formulär', onSelect: () => copy(form) }]}
  nameHeader="Formulär"
  name={(form) => form.name}
  columns={[{ header: 'Formulärtyp', cell: (form) => form.formTypeName }]}
/>`}
    />
  );
}
