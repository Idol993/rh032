import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CaseList from '@/pages/Cases/CaseList';
import CaseDetail from '@/pages/Cases/CaseDetail';
import CaseNew from '@/pages/Cases/CaseNew';
import CaseEdit from '@/pages/Cases/CaseEdit';
import ClientList from '@/pages/Clients/ClientList';
import DocumentList from '@/pages/Documents/DocumentList';
import DocumentEditor from '@/pages/Documents/DocumentEditor';
import Finance from '@/pages/Finance/Finance';
import Invoice from '@/pages/Finance/Invoice';
import DeadlineList from '@/pages/Risk/DeadlineList';
import TicketList from '@/pages/Risk/TicketList';
import JudicialData from '@/pages/Judicial/JudicialData';
import Archive from '@/pages/Archive/Archive';
import Analytics from '@/pages/Analytics/Analytics';
import UserManagement from '@/pages/System/UserManagement';
import OperationLogs from '@/pages/System/OperationLogs';

const AppRouter: React.FC = () => {
  const { getCurrentUser } = useUserStore();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/analytics" element={<Analytics />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/cases" element={<CaseList />} />
        <Route path="/cases/new" element={<CaseNew />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/cases/:id/edit" element={<CaseEdit />} />
        <Route path="/cases/assign" element={<CaseList />} />
        
        <Route path="/clients" element={<ClientList />} />
        
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/:id" element={<DocumentEditor />} />
        
        <Route path="/finance" element={<Finance />} />
        <Route path="/finance/invoice" element={<Invoice />} />
        
        <Route path="/risk/deadlines" element={<DeadlineList />} />
        <Route path="/risk/tickets" element={<TicketList />} />
        
        <Route path="/judicial" element={<JudicialData />} />
        
        <Route path="/archive" element={<Archive />} />
        
        <Route path="/system/users" element={<UserManagement />} />
        <Route path="/system/logs" element={<OperationLogs />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
