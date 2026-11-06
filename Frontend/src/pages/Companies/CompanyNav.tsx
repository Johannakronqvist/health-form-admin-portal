import { useState } from 'react';
import { NavLink } from 'react-router';
import { fetchCompanies } from '@/api/companies';
import { SearchField, Text } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import styles from './CompanyNav.module.css';

/** The company list under "Företag" in the sidebar. */
function CompanyNav() {
  const { state } = useAsync(fetchCompanies);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const companies =
    state.status === 'success'
      ? state.data.filter((c) => !query || c.name.toLowerCase().includes(query) || c.orgNumber.includes(query))
      : [];

  return (
    <div className={styles.companyNav}>
      <SearchField
        label="Sök företag"
        hideLabel
        placeholder="Sök företag"
        clearLabel="Rensa sökningen"
        value={search}
        onSearch={setSearch}
        resultCount={companies.length}
        resultLabel={(count) => (count === 1 ? '1 företag' : `${count} företag`)}
      />

      {state.status === 'error' && (
        <Text size="sm" tone="muted">
          Företagen kunde inte hämtas.
        </Text>
      )}

      {state.status === 'success' && (
        <nav aria-label="Företag">
          {companies.length === 0 ? (
            <Text size="sm" tone="muted">
              Inga företag matchar sökningen.
            </Text>
          ) : (
            <ul className={styles.list}>
              {companies.map((company) => (
                <li key={company.id}>
                  {/* NavLink sets aria-current="page" on the open company */}
                  <NavLink
                    to={`/foretag/${company.id}`}
                    className={({ isActive }) => (isActive ? `${styles.link} ${styles.current}` : styles.link)}
                  >
                    {company.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </nav>
      )}
    </div>
  );
}

export default CompanyNav;
