# Components

All UI components for Hälsoportalen. Import them from the folder (`@/` means `src/`):

```tsx
import { Button, Field, Modal } from '@/components';
```

The generic building blocks (Button, Field, Modal ...) are adapted from
[accessible-design-system](https://johannakronqvist.com/design-system/) by Johanna Kronqvist:
same props, keyboard behaviour and ARIA, rewritten with CSS Modules and fixed tokens for this app.
The app's own components (`AppLayout`, `DataTable`, `StateMessage`, `StatusBadge`) build on them.

## Conventions

- One folder per component: `Name/Name.tsx` and `Name.module.css`. Export it from `index.ts`.
- Style only with the tokens in `src/styles/tokens.css` (`var(--text-2)`, `var(--space-2)`, `var(--radius)` ...).
  The navy sidebar uses the same tokens with the `.theme-sidebar` class.
- Keep `:focus-visible` styles and `prefers-reduced-motion` rules when you add or change a component.
- Code and comments in English, user-facing text in Swedish. Components with built-in text take it as a
  prop (`dismissLabel`, `clearLabel`, `requiredLabel` ...), so pass Swedish text from the page.
- Use a component directly for ordinary UI. Make a new component when something with Hälsoportalen
  meaning repeats, e.g. a `PublishButton` that wraps `Button` with the "save first" rule
  (like `StatusBadge` wraps `Badge`).

## Disabled buttons

1. **Prefer not disabling.** If an action needs input (e.g. "Nästa: Välj frågor" with no form type
   chosen), keep the button enabled and show what's missing next to the field when it's pressed.
2. **If it really can't be done yet** (Publicera with unsaved changes), use `disabled` +
   `focusableWhenDisabled`, and show the reason as visible text linked with `aria-describedby`
   ("Spara ändringarna innan du publicerar"). No tooltips: they fail on touch and for many
   screen-reader users.
3. **While saving**, use `loading`. It keeps the colours and focus, shows the heartbeat and blocks
   double submits.

Plain `disabled` (skipped by Tab) is for buttons that are simply irrelevant in the current state.

## Which component for which part of the designs

| Design element                                        | Component                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| Sidebar menu                                          | `SideNav` (in `AppLayout`)                                                    |
| "Formulär / Nytt formulär"                            | `Breadcrumbs` (`onNavigate` for router links)                                 |
| Wizard steps (Formulärtyp, Frågor, Granska och spara) | `StepIndicator`                                                               |
| Form type cards                                       | `RadioCard` in a `<fieldset>`                                                 |
| Nästa, Tillbaka, Avbryt, Lägg till, Kopiera formulär  | `Button` (`primary` / `secondary`, `leftIcon`)                                |
| Formulärets namn                                      | `Field` with `value` / `onChange`, and `error` for the API's 422 field errors |
| Sök fråga, Sök företag                                | `SearchField` (`onSearch`; `resultCount` + `resultLabel` announce the hits)   |
| Area filter chips (Alla, Allmän hälsa ...)            | `ToggleGroup`                                                                 |
| Quick-action cards on Översikt                        | `Card`                                                                        |
| Formulär and Företag tables, with "more actions" (5f) | `DataTable` (the row menu is a `Menu`, first in the row)                      |
| Confirm before removing                               | `Modal` with `initialFocus` on the Avbryt button                              |
| Saved, removed, errors                                | `Alert` (or `StateMessage`)                                                   |
| Saving                                                | `Button loading` + status text                                                |
| Utkast / Publicerad                                   | `StatusBadge`                                                                 |

The reorderable question list and the question bank are page parts, not shared components:
see `src/pages/Forms/CreateForm/` (`FormQuestionList`, `QuestionBank`).

See all components live at `/library` while `npm run dev` runs.
