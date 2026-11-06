import { Suspense, lazy } from 'react';
import App from './App';

// Developer-only component library at /library. import.meta.env.DEV is false in
// `npm run build`, so this and the page's code are left out of production.
const LibraryPage =
  import.meta.env.DEV && window.location.pathname === '/library' ? lazy(() => import('./dev/LibraryPage')) : null;

export function Root() {
  if (LibraryPage) {
    return (
      <Suspense fallback={null}>
        <LibraryPage />
      </Suspense>
    );
  }
  return <App />;
}
