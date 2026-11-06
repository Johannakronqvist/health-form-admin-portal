import { Alert, Badge, Button, HeartbeatMark, Spinner, StateMessage, StatusBadge } from '@/components';
import { Column, Row } from '@/dev/library/layout';
import { ComponentDoc } from '@/dev/library/ComponentDoc';

const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

export function BadgeDoc() {
  return (
    <ComponentDoc
      name="Badge"
      file="src/components/Badge/Badge.tsx"
      examples={[
        {
          label: 'Soft',
          content: (
            <Row>
              {tones.map((tone) => (
                <Badge key={tone} tone={tone} variant="soft">
                  {tone}
                </Badge>
              ))}
            </Row>
          ),
        },
        {
          label: 'Solid',
          content: (
            <Row>
              {tones.map((tone) => (
                <Badge key={tone} tone={tone}>
                  {tone}
                </Badge>
              ))}
            </Row>
          ),
        },
        {
          label: 'Tag',
          content: (
            <Badge tone="accent" variant="soft" onRemove={() => {}} removeLabel="Ta bort Fysisk arbetsmiljö">
              Fysisk arbetsmiljö
            </Badge>
          ),
        },
      ]}
      props={[
        {
          name: 'tone',
          type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
          default: "'neutral'",
        },
        { name: 'variant', type: "'solid' | 'soft'", default: "'solid'" },
        { name: 'children', type: 'ReactNode' },
        { name: 'onRemove', type: '() => void', default: 'shows a remove button' },
        { name: 'removeLabel', type: 'string', default: 'required with onRemove' },
      ]}
      code={`<Badge tone="success" variant="soft">Publicerad</Badge>

<Badge tone="accent" variant="soft" onRemove={removeArea} removeLabel="Ta bort Fysisk arbetsmiljö">
  Fysisk arbetsmiljö
</Badge>`}
    />
  );
}

export function StatusBadgeDoc() {
  return (
    <ComponentDoc
      name="StatusBadge"
      file="src/components/StatusBadge/StatusBadge.tsx"
      examples={[
        {
          label: 'Status',
          content: (
            <Row>
              <StatusBadge status="draft" />
              <StatusBadge status="published" />
            </Row>
          ),
        },
      ]}
      props={[{ name: 'status', type: "'draft' | 'published'", default: 'required' }]}
      code={`<StatusBadge status={companyForm.status} />`}
    />
  );
}

export function AlertDoc() {
  return (
    <ComponentDoc
      name="Alert"
      file="src/components/Alert/Alert.tsx"
      examples={[
        {
          label: 'Tones',
          content: (
            <Column>
              <Alert tone="success" title="Formuläret är sparat">
                Det kan nu kopplas till företag.
              </Alert>
              <Alert tone="info" title="Utkastet sparas automatiskt" />
              <Alert tone="warning" title="Osparade ändringar">
                Spara innan du publicerar.
              </Alert>
              <Alert tone="danger" title="Det gick inte att spara" />
            </Column>
          ),
        },
      ]}
      props={[
        { name: 'tone', type: "'info' | 'success' | 'warning' | 'danger'", default: "'info'" },
        { name: 'title', type: 'ReactNode' },
        { name: 'children', type: 'ReactNode' },
        { name: 'live', type: "'polite' | 'assertive' | 'off'", default: 'not announced' },
        { name: 'onDismiss', type: '() => void', default: 'shows a close button' },
        { name: 'dismissLabel', type: 'string' },
      ]}
      code={`<Alert tone="success" title="Formuläret togs bort från Nordbygg AB" live="polite" />

<Alert tone="danger" title="Det gick inte att spara" live="assertive">
  Kontrollera fälten som är markerade.
</Alert>`}
    />
  );
}

export function SpinnerDoc() {
  return (
    <ComponentDoc
      name="Spinner"
      file="src/components/Spinner/Spinner.tsx"
      examples={[
        {
          label: 'Heartbeat',
          content: (
            <Row>
              <Spinner size="sm" label="Laddar" />
              <Spinner size="md" label="Laddar" />
              <Spinner size="lg" label="Hämtar formulär" labelVisible />
            </Row>
          ),
        },
        {
          label: 'Ring',
          content: (
            <Row>
              <Spinner variant="ring" size="sm" label="Laddar" />
              <Spinner variant="ring" size="md" label="Laddar" />
              <Spinner variant="ring" size="lg" label="Hämtar formulär" labelVisible />
            </Row>
          ),
        },
      ]}
      props={[
        { name: 'variant', type: "'heartbeat' | 'ring'", default: "'heartbeat'" },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'label', type: 'string', default: "'Loading'" },
        { name: 'labelVisible', type: 'boolean', default: 'false; always visible with reduced motion' },
      ]}
      code={`<Spinner label="Hämtar formulär" labelVisible />`}
    />
  );
}

export function HeartbeatDoc() {
  return (
    <ComponentDoc
      name="Heartbeat"
      file="src/components/Heartbeat/Heartbeat.tsx"
      examples={[
        { label: 'Mark', content: <HeartbeatMark /> },
        { label: 'In a loading button', content: <Button loading>Sparar</Button> },
      ]}
      props={[
        { name: 'size', type: 'number', default: '16 (height in px)' },
        { name: 'className', type: 'string' },
      ]}
      code={`<HeartbeatMark />`}
    />
  );
}

export function StateMessageDoc() {
  return (
    <ComponentDoc
      name="StateMessage"
      file="src/components/StateMessage/StateMessage.tsx"
      examples={[
        { label: 'Loading', content: <StateMessage variant="loading" message="Hämtar formulär..." /> },
        { label: 'Empty', content: <StateMessage variant="empty" message="Inga egna frågor än" /> },
        {
          label: 'Error',
          content: <StateMessage variant="error" message="Det gick inte att hämta formulären." onRetry={() => {}} />,
        },
      ]}
      props={[
        { name: 'variant', type: "'loading' | 'error' | 'empty'", default: 'required' },
        { name: 'message', type: 'string', default: 'required' },
        { name: 'onRetry', type: '() => void', default: 'shows Försök igen' },
      ]}
      code={`{state.status === 'loading' && <StateMessage variant="loading" message="Hämtar formulär..." />}
{state.status === 'error' && (
  <StateMessage variant="error" message="Det gick inte att hämta formulären." onRetry={retry} />
)}`}
    />
  );
}
