import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ClientLogin from './pages/ClientLogin';
import ClientApp from './pages/ClientApp';
import AdminSetup from './pages/AdminSetup';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import UIDesigner from './pages/UIDesigner';

export default function App() {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setIsInitialized(data.initialized))
      .catch(err => console.error('Failed to fetch status', err));
  }, []);

  if (isInitialized === null) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={isInitialized ? <ClientLogin /> : <Navigate to="/setup" replace />} />
        <Route path="/app" element={<ClientApp />} />

        {/* Admin Routes */}
        <Route path="/setup" element={!isInitialized ? <AdminSetup onComplete={() => setIsInitialized(true)} /> : <Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/apps/:appId/workflow/:workflowId" element={<WorkflowEditor />} />
        <Route path="/admin/apps/:appId/design" element={<UIDesigner />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
