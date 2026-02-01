import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { ToastProvider } from './components/ToastContainer';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import ConsigneeTracker from './components/ConsigneeTracker';
import InventoryTable from './components/InventoryTable';
import BulkConsignment from './components/BulkConsignment';
import Settings from './components/Settings';
import PendingTransactions from './components/PendingTransactions';
import TransactionHistory from './components/TransactionHistory';
import ProfitProjections from './components/ProfitProjections';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [consignees, setConsignees] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchConsignees = async () => {
    try {
      const response = await axios.get(`${API_URL}/consignees`);
      setConsignees(response.data);
    } catch (error) {
      console.error('Error fetching consignees:', error);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/pending-transactions`);
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchConsignees(), fetchPendingCount()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Vape_Business_Data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export data');
    }
  };

  const refreshData = () => {
    fetchDashboard();
    fetchConsignees();
    fetchPendingCount();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Vape Inventory System...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1>💨 Vape Inventory & Sales Manager</h1>
            <button className="export-btn" onClick={handleExport}>
              📊 Download Excel Report
            </button>
          </div>
        </header>

      <nav className="tab-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button 
          className={activeTab === 'pending' ? 'active' : ''} 
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button 
          className={activeTab === 'transaction' ? 'active' : ''} 
          onClick={() => setActiveTab('transaction')}
        >
          ➕ New Transaction
        </button>
        <button 
          className={activeTab === 'bulk' ? 'active' : ''} 
          onClick={() => setActiveTab('bulk')}
        >
          📦 Bulk Consignment
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
        <button 
          className={activeTab === 'consignees' ? 'active' : ''} 
          onClick={() => setActiveTab('consignees')}
        >
          👥 Consignees
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''} 
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={activeTab === 'projections' ? 'active' : ''} 
          onClick={() => setActiveTab('projections')}
        >
          💰 Projections
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && dashboardData && (
          <Dashboard data={dashboardData} />
        )}
        {activeTab === 'pending' && (
          <PendingTransactions onUpdate={refreshData} />
        )}
        {activeTab === 'transaction' && (
          <TransactionForm onSuccess={refreshData} />
        )}
        {activeTab === 'bulk' && (
          <BulkConsignment onSuccess={refreshData} />
        )}
        {activeTab === 'history' && (
          <TransactionHistory onUpdate={refreshData} />
        )}
        {activeTab === 'consignees' && (
          <ConsigneeTracker consignees={consignees} onUpdate={refreshData} />
        )}
        {activeTab === 'inventory' && dashboardData && (
          <InventoryTable inventory={dashboardData.inventory} lowStock={dashboardData.low_stock} />
        )}
        {activeTab === 'projections' && dashboardData && (
          <ProfitProjections dashboardData={dashboardData} />
        )}
        {activeTab === 'settings' && (
          <Settings onUpdate={refreshData} />
        )}
      </main>
    </div>
    </ToastProvider>
  );
}

export default App;
