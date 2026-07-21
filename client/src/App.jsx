import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Crops from './pages/Crops';
import Livestock from './pages/Livestock';
import InventoryPage from './pages/Inventory';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Workers from './pages/Workers';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import InvestorView from './pages/InvestorView';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Legal from './pages/Legal';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const ALL_ROLES = ['owner', 'manager', 'admin', 'investor'];
const OPERATIONAL_ROLES = ['owner', 'manager', 'admin'];
const OVERSIGHT_ROLES = ['owner', 'admin', 'investor'];
const INVESTOR_FACING_ROLES = ['owner', 'admin', 'investor'];

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={ALL_ROLES}><Dashboard /></ProtectedRoute>
      } />
      <Route path="/farms" element={
        <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}><Farms /></ProtectedRoute>
      } />
      <Route path="/crops" element={
        <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}><Crops /></ProtectedRoute>
      } />
      <Route path="/livestock" element={
        <ProtectedRoute allowedRoles={ALL_ROLES}><Livestock /></ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}><InventoryPage /></ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}><Sales /></ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}><Expenses /></ProtectedRoute>
      } />
      <Route path="/workers" element={
        <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}><Workers /></ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute allowedRoles={ALL_ROLES}><Customers /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={OVERSIGHT_ROLES}><Reports /></ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={OVERSIGHT_ROLES}><Analytics /></ProtectedRoute>
      } />
      <Route path="/investor-view" element={
        <ProtectedRoute allowedRoles={INVESTOR_FACING_ROLES}><InvestorView /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={ALL_ROLES}><Settings /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/" element={<Landing />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;