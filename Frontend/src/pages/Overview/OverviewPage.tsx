import { ChevronRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { fetchOverview } from '@/api/overview';
import type { OverviewTodo, ResponseRate } from '@/api/types';
import { Badge, Breadcrumbs, Button, Card, Heading, StateMessage, Text } from '@/components';
import type { HighlightState } from '@/lib/highlight';
import { useAsync } from '@/hooks/useAsync';
import styles from './OverviewPage.module.css';

/** Below this share of answers, a survey is shown in red. */
const LOW_RATE = 0.1;

/** What a to-do says, its status, and where it's handled. The forms to highlight there go in the link's state. */
function describeTodo(todo: OverviewTodo) {
  if (todo.type === 'drafts') {
    return {
      key: 'drafts',
      title: todo.drafts.length === 1 ? '1 utkast väntar' : `${todo.drafts.length} utkast väntar`,
      context: todo.drafts.map((d) => d.name).join(', '),
      badge: { label: 'Utkast', tone: 'warning' as const },
      linkLabel: todo.drafts.length === 1 ? `Hantera ${todo.drafts[0].name} i Formulär` : 'Hantera utkasten i Formulär',
      href: '/formular',
      highlight: todo.drafts.map((d) => d.id),
    };
  }
  return {
    key: `${todo.type}-${todo.formId}-${todo.companyId}`,
    title: todo.formName,
    context: todo.companyName,
    badge:
      todo.type === 'unpublished-changes'
        ? { label: 'Opublicerade ändringar', tone: 'warning' as const }
        : { label: 'Ej publicerad', tone: 'neutral' as const },
    linkLabel: `Hantera ${todo.formName} hos ${todo.companyName}`,
    href: `/foretag/${todo.companyId}`,
    highlight: [todo.formId],
  };
}

function RateRow({ rate }: { rate: ResponseRate }) {
  const share = rate.employeeCount > 0 ? rate.responseCount / rate.employeeCount : 0;
  const low = share < LOW_RATE;
  return (
    <li className={styles.row}>
      <span className={styles.names}>
        <span className={styles.title}>{rate.companyName}</span>
        <span className={styles.muted}>{rate.formName}</span>
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={`${styles.fill} ${low ? styles.low : ''}`} style={{ width: `${Math.min(share, 1) * 100}%` }} />
      </span>
      <span className={`${styles.count} ${low ? styles.lowText : ''}`}>
        {rate.responseCount} av {rate.employeeCount} har svarat
      </span>
    </li>
  );
}

interface OverviewPageProps {
  /** First name for "Välkommen, ...". Without it the heading is just "Välkommen". */
  userName?: string;
}

/** Översikt: what's waiting on the user, and how the surveys are going. */
function OverviewPage({ userName }: OverviewPageProps) {
  const navigate = useNavigate();
  const { state, retry } = useAsync(fetchOverview);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titles}>
          <Breadcrumbs label="Brödsmulor" items={[{ label: 'Översikt' }]} />
          <Heading level={1}>{userName ? `Välkommen, ${userName}` : 'Välkommen'}</Heading>
          <Text tone="muted">Här är det som väntar på dig.</Text>
        </div>
        <Button leftIcon={Plus} onClick={() => navigate('/formular/nytt')}>
          Skapa formulär
        </Button>
      </div>

      {state.status === 'loading' && <StateMessage variant="loading" message="Hämtar översikten" />}
      {state.status === 'error' && (
        <StateMessage variant="error" message="Översikten kunde inte hämtas." onRetry={retry} />
      )}

      {state.status === 'success' && (
        <>
          <Card as="section" aria-labelledby="todo-heading" className={styles.card}>
            <div className={styles.cardHeader}>
              <Heading level={2} id="todo-heading" size="lg">
                Att göra
              </Heading>
            </div>
            {state.data.todos.length === 0 ? (
              <Text tone="muted" className={styles.empty}>
                Inget väntar på dig just nu.
              </Text>
            ) : (
              <ul className={styles.list}>
                {state.data.todos.map(describeTodo).map((todo) => (
                  <li key={todo.key} className={styles.row}>
                    <span className={styles.title}>{todo.title}</span>
                    <span className={styles.muted}>{todo.context}</span>
                    <span className={styles.end}>
                      <Badge tone={todo.badge.tone} variant="soft">
                        {todo.badge.label}
                      </Badge>
                      {/* aria-label starts with the visible word, for voice control */}
                      <Link
                        to={todo.href}
                        state={{ highlight: todo.highlight } satisfies HighlightState}
                        className={styles.action}
                        aria-label={todo.linkLabel}
                      >
                        Hantera
                        <ChevronRight size={20} className={styles.chevron} aria-hidden="true" />
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card as="section" aria-labelledby="rates-heading" className={styles.card}>
            <div className={styles.cardHeader}>
              <Heading level={2} id="rates-heading" size="lg">
                Så går enkäterna
              </Heading>
              {state.data.responseRates.length > 0 && (
                <Text size="sm" tone="muted">
                  Lägst svarsfrekvens först
                </Text>
              )}
            </div>
            {state.data.responseRates.length === 0 ? (
              <Text tone="muted" className={styles.empty}>
                Inga enkäter är publicerade än.
              </Text>
            ) : (
              <ul className={styles.list}>
                {state.data.responseRates.map((rate) => (
                  <RateRow key={`${rate.companyId}-${rate.formId}`} rate={rate} />
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default OverviewPage;
