import { useState } from 'react';
import { Field, RadioCard, RadioGroup, SearchField, ToggleGroup } from '@/components';
import { Columns } from '@/dev/library/layout';
import { ComponentDoc } from '@/dev/library/ComponentDoc';

function ControlledField() {
  const [name, setName] = useState('Hälsoprofil med Arbetsplatsprofil - Bygg');
  return (
    <Field
      label="Formulärets namn"
      required
      requiredLabel="(obligatoriskt)"
      value={name}
      onChange={setName}
      hint={`Value: "${name}"`}
    />
  );
}

export function FieldDoc() {
  return (
    <ComponentDoc
      name="Field"
      file="src/components/Field/Field.tsx"
      examples={[
        { label: 'Controlled', content: <ControlledField /> },
        { label: 'Error', content: <Field label="Formulärets namn" error="Formuläret måste ha ett namn" /> },
        { label: 'Disabled', content: <Field label="Formulärtyp" defaultValue="Hälsoprofil" disabled /> },
      ]}
      props={[
        { name: 'label', type: 'string', default: 'required' },
        { name: 'value', type: 'string', default: 'uncontrolled when omitted' },
        { name: 'onChange', type: '(value: string) => void' },
        { name: 'defaultValue', type: 'string' },
        { name: 'hint', type: 'string' },
        { name: 'error', type: 'string', default: 'shown in role="alert"' },
        { name: 'required', type: 'boolean', default: 'false' },
        { name: 'requiredLabel', type: 'string', default: "'(required)'" },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'type', type: 'string', default: "'text'" },
        { name: 'placeholder', type: 'string' },
        { name: 'id, name, ...', type: 'InputHTMLAttributes', default: 'passed to the <input>' },
      ]}
      code={`const [name, setName] = useState(form.name);

<Field
  label="Formulärets namn"
  required
  requiredLabel="(obligatoriskt)"
  value={name}
  onChange={setName}
  error={fieldErrors.name}
/>`}
    />
  );
}

const questions = [
  'Hur bedömer du din allmänna hälsa just nu?',
  'Lyfter du tungt i ditt arbete?',
  'Arbetar du natt eller skift?',
];

function SearchDemo() {
  const [search, setSearch] = useState('');
  const hits = questions.filter((q) => q.toLowerCase().includes(search.toLowerCase()));
  return (
    <SearchField
      label="Sök fråga"
      placeholder="Sök fråga"
      value={search}
      onSearch={setSearch}
      resultCount={hits.length}
      resultLabel={(n) => `${n} ${n === 1 ? 'fråga' : 'frågor'}`}
      clearLabel="Rensa sökningen"
    />
  );
}

export function SearchFieldDoc() {
  return (
    <ComponentDoc
      name="SearchField"
      file="src/components/SearchField/SearchField.tsx"
      examples={[{ label: 'With results', content: <SearchDemo /> }]}
      props={[
        { name: 'label', type: 'string', default: "'Search'" },
        { name: 'onSearch', type: '(value: string) => void', default: 'on every change' },
        { name: 'value', type: 'string', default: 'uncontrolled when omitted' },
        { name: 'defaultValue', type: 'string', default: "''" },
        { name: 'placeholder', type: 'string', default: "'Search...'" },
        { name: 'resultCount', type: 'number', default: 'announced when it changes' },
        { name: 'resultLabel', type: '(count: number) => string', default: "'N results'" },
        { name: 'clearLabel', type: 'string', default: "'Clear search'" },
        { name: 'hideLabel', type: 'boolean', default: 'false' },
        { name: 'hint', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
      ]}
      code={`<SearchField
  label="Sök fråga"
  placeholder="Sök fråga"
  value={search}
  onSearch={setSearch}
  resultCount={hits.length}
  resultLabel={(n) => \`\${n} \${n === 1 ? 'fråga' : 'frågor'}\`}
  clearLabel="Rensa sökningen"
/>`}
    />
  );
}

export function RadioGroupDoc() {
  return (
    <ComponentDoc
      name="RadioGroup"
      file="src/components/RadioGroup/RadioGroup.tsx"
      examples={[
        {
          label: 'Default',
          content: (
            <RadioGroup
              label="Hur bedömer du din allmänna hälsa?"
              name="general-health"
              options={[
                { value: 'good', label: 'Bra' },
                { value: 'fair', label: 'Varken bra eller dålig' },
                { value: 'poor', label: 'Dålig' },
              ]}
              defaultValue="good"
            />
          ),
        },
        {
          label: 'Size and weight',
          content: (
            <RadioGroup
              label="Använder du tobak eller nikotin?"
              name="tobacco"
              size="sm"
              options={[
                { value: 'no', label: 'Nej' },
                { value: 'sometimes', label: 'Ibland' },
                { value: 'daily', label: 'Dagligen' },
              ]}
            />
          ),
        },
      ]}
      props={[
        { name: 'label', type: 'string', default: 'required, becomes the <legend>' },
        { name: 'name', type: 'string', default: 'required' },
        { name: 'options', type: '{ value: string; label: string }[]', default: '[]' },
        { name: 'value / onChange', type: 'string / (value: string) => void', default: 'uncontrolled when omitted' },
        { name: 'defaultValue', type: 'string' },
        { name: 'disabled', type: 'boolean', default: 'false' },
        { name: 'size', type: "'sm' | 'md'", default: "'md'" },
        { name: 'weight', type: "'regular' | 'medium'", default: "'regular'" },
      ]}
      code={`<RadioGroup
  label={question.label}
  name={question.questionId}
  options={question.options ?? []}
/>`}
    />
  );
}

function RadioCardDemo() {
  const [type, setType] = useState('health-profile-workplace');
  const options = [
    {
      id: 'health-profile',
      name: 'Hälsoprofil',
      description: 'Livsstil, hälsa och välbefinnande, följs av ett hälsosamtal.',
    },
    { id: 'health-screening', name: 'Hälsoscreening', description: 'Kortare kontroll av hälsa och riskfaktorer.' },
    {
      id: 'health-profile-workplace',
      name: 'Hälsoprofil med Arbetsplatsprofil',
      description: 'Hälsoprofil och arbetsmiljö i samma formulär.',
    },
  ];
  return (
    <fieldset style={{ margin: 0, padding: 0, border: 'none', width: '100%' }} aria-label="Formulärtyp">
      <Columns min={260}>
        {options.map((o) => (
          <RadioCard
            key={o.id}
            name="demo-form-type"
            value={o.id}
            title={o.name}
            description={o.description}
            checked={type === o.id}
            onChange={setType}
          />
        ))}
      </Columns>
    </fieldset>
  );
}

export function RadioCardDoc() {
  return (
    <ComponentDoc
      name="RadioCard"
      file="src/components/RadioCard/RadioCard.tsx"
      examples={[{ label: 'Form type', content: <RadioCardDemo /> }]}
      props={[
        { name: 'name', type: 'string', default: 'required, the same for every card in the group' },
        { name: 'value', type: 'string', default: 'required' },
        { name: 'title', type: 'string', default: "required, the radio's name" },
        { name: 'description', type: 'string', default: 'read after the title' },
        { name: 'checked / onChange', type: 'boolean / (value: string) => void', default: 'uncontrolled when omitted' },
        { name: 'defaultChecked', type: 'boolean' },
      ]}
      code={`// The fieldset names the group; the page lays the cards out in a grid
<fieldset aria-labelledby="step-heading">
  {formTypes.map((type) => (
    <RadioCard
      key={type.id}
      name="formType"
      value={type.id}
      title={type.name}
      description={type.description}
      checked={formTypeId === type.id}
      onChange={setFormTypeId}
    />
  ))}
</fieldset>`}
    />
  );
}

export function ToggleGroupDoc() {
  return (
    <ComponentDoc
      name="ToggleGroup"
      file="src/components/ToggleGroup/ToggleGroup.tsx"
      examples={[
        {
          label: 'Area filter',
          content: (
            <ToggleGroup
              label="Filtrera på område"
              options={[
                { value: 'all', label: 'Alla 28' },
                { value: 'general-health', label: 'Allmän hälsa 4' },
                { value: 'medication', label: 'Läkemedel 3' },
                { value: 'lifestyle', label: 'Livsstil 6' },
              ]}
            />
          ),
        },
        {
          label: 'Small',
          content: (
            <ToggleGroup
              label="Visa"
              size="sm"
              options={[
                { value: 'all', label: 'Alla' },
                { value: 'draft', label: 'Utkast' },
                { value: 'published', label: 'Publicerade' },
              ]}
            />
          ),
        },
      ]}
      props={[
        { name: 'label', type: 'string', default: 'required' },
        { name: 'options', type: '{ value; label?; icon?; ariaLabel? }[]', default: '[]' },
        { name: 'defaultValue', type: 'T', default: 'first option' },
        { name: 'onChange', type: '(value: T) => void' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
        { name: 'hideLabel', type: 'boolean', default: 'true' },
      ]}
      code={`<ToggleGroup
  label="Filtrera på område"
  options={areas.map((a) => ({ value: a.id, label: \`\${a.label} \${a.questionCount}\` }))}
  onChange={setArea}
/>`}
    />
  );
}
