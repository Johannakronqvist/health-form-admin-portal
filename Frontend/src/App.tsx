import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { Building2, FileText, House } from 'lucide-react';
import { fetchStaffUser } from './api/staffUser';
import { AppLayout, type NavLinkItem } from './components/AppLayout/AppLayout';
import { useAsync } from './hooks/useAsync';
import CreateFormPage from './pages/Forms/CreateForm/CreateFormPage';
import FormsPage from './pages/Forms/FormsPage';
import OverviewPage from './pages/Overview/OverviewPage';
import CompanyNav from './pages/Companies/CompanyNav';
import CompanyPage, { CompaniesIndex } from './pages/Companies/CompanyPage';

const navItems: NavLinkItem[] = [
  { href: '/oversikt', label: 'Översikt', icon: House },
  { href: '/formular', label: 'Formulär', icon: FileText },
  { href: '/foretag', label: 'Företag', icon: Building2 },
];

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Sub-pages keep their menu item marked, e.g. /formular/nytt marks Formulär
  const currentHref = navItems.find((item) => pathname.startsWith(item.href))?.href ?? pathname;

  // The logged-in user. The sidebar and the greeting just leave the name out until it has loaded (or if it fails).
  const staffUser = useAsync(fetchStaffUser);
  const user = staffUser.state.status === 'success' ? staffUser.state.data : undefined;
  const firstName = user?.name.split(' ')[0];

  return (
    <AppLayout
      navItems={navItems}
      user={user}
      currentHref={currentHref}
      subnav={pathname.startsWith('/foretag') ? <CompanyNav /> : undefined}
      onNavigate={(href, event) => {
        event.preventDefault();
        navigate(href);
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/oversikt" replace />} />
        <Route path="/oversikt" element={<OverviewPage userName={firstName} />} />
        <Route path="/formular" element={<FormsPage />} />
        <Route path="/formular/nytt" element={<CreateFormPage />} />
        <Route path="/formular/:formId/redigera" element={<CreateFormPage />} />
        <Route path="/foretag" element={<CompaniesIndex />} />
        {/* key: a new company starts with fresh data instead of the previous one's */}
        <Route path="/foretag/:companyId" element={<CompanyPageForRoute />} />
      </Routes>
    </AppLayout>
  );
}

function CompanyPageForRoute() {
  const { companyId } = useParams();
  return <CompanyPage key={companyId} />;
}

export default App;
