import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { supabase } from './lib/supabase';

import Toast from './components/Toast';
import DashLayout from './components/DashLayout';
import LoadSpinner from './components/LoadSpinner';

import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import SalesPage from './pages/SalesPage';
import RedeemPage from './pages/RedeemPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import EmailsPage from './pages/EmailsPage';
import TemplatesPage from './pages/TemplatesPage';
import AdminClientsPage from './pages/AdminClientsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

import { ink, paper } from './lib/tokens';

export default function PortalApp() {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  const [page, setPage] = useState(() => sessionStorage.getItem('xg.page') || 'overview');
  const [clientId, setClientId] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => { sessionStorage.setItem('xg.page', page); }, [page]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'admin') {
      supabase.from('clients').select('*').order('name').then(({ data }) => {
        setAllClients(data || []);
        if (data?.length && !clientId) setClientId(data[0].id);
      });
    } else if (profile.client_id) {
      setClientId(profile.client_id);
      if (profile.clients) setAllClients([profile.clients]);
    }
  }, [profile]);

  useEffect(() => {
    if (!clientId) return;
    supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).eq('client_id', clientId).eq('status', 'pending_approval')
      .then(({ count }) => setPendingCount(count || 0));
  }, [clientId, page]);

  const activeClient = allClients.find((c) => c.id === clientId);

  const handleLogin = async (email, password) => {
    await signIn(email, password);
    toast('Signed in successfully');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: paper }}>
        <LoadSpinner size={24} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} toast={toast} />
        {toasts.map((t) => <Toast key={t.id} msg={t.msg} kind={t.kind} onDone={() => removeToast(t.id)} />)}
      </>
    );
  }

  if (!profile?.client_id && profile?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: paper, flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 16, color: ink }}>Your account is pending setup.</p>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Contact xperigift to get your workspace configured.</p>
        <button onClick={signOut} style={{ fontSize: 13, color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sign out</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: paper }}>
      <DashLayout
        user={user}
        profile={profile}
        clients={allClients}
        clientId={clientId}
        setClientId={setClientId}
        page={page}
        setPage={setPage}
        onLogout={signOut}
        pendingCount={pendingCount}
      >
        {page === 'overview' && <OverviewPage clientId={clientId} clientName={activeClient?.name} pendingCount={pendingCount} setPage={setPage} />}
        {page === 'sales' && <SalesPage clientId={clientId} toast={toast} />}
        {page === 'redeem' && <RedeemPage clientId={clientId} toast={toast} user={user} />}
        {page === 'products' && <ProductsPage clientId={clientId} toast={toast} />}
        {page === 'customers' && <CustomersPage clientId={clientId} toast={toast} />}
        {page === 'emails' && <EmailsPage clientId={clientId} toast={toast} />}
        {page === 'templates' && <TemplatesPage />}
        {page === 'admin-clients' && <AdminClientsPage />}
        {page === 'admin-bookings' && <AdminBookingsPage />}
      </DashLayout>
      {toasts.map((t) => <Toast key={t.id} msg={t.msg} kind={t.kind} onDone={() => removeToast(t.id)} />)}
    </div>
  );
}
