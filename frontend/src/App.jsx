import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import IncomeList from './pages/Income/IncomeList.jsx';
import ExpenseList from './pages/Expense/ExpenseList.jsx';
import DemandNoteList from './pages/DemandNotes/DemandNoteList.jsx';
import MonthlyReport from './pages/Reports/MonthlyReport.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import DonatePage from './pages/Public/DonatePage.jsx';
import DonationResult from './pages/Public/DonationResult.jsx';

function App() {
  return (
    <Routes>
      {/* Public donation page — no login required */}
      <Route path="/donate" element={<DonatePage />} />
      <Route path="/donate/result" element={<DonationResult />} />

      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<IncomeList />} />
        <Route path="/expense" element={<ExpenseList />} />
        <Route path="/demand-notes" element={<DemandNoteList />} />
        <Route path="/reports" element={<MonthlyReport />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
