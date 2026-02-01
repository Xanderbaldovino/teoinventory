import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionHistory.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

function TransactionHistory({ onUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data.reverse()); // Show newest first
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id, flavor, quantity) => {
    if (!window.confirm(`Delete this transaction? This will restore ${quantity} units of ${flavor} to inventory.`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      toast.success(`Transaction deleted! ${quantity} units of ${flavor} restored to inventory.`);
      fetchTransactions();
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete transaction');
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  if (loading) {
    return <div className="loading">Loading transaction history...</div>;
  }

  return (
    <div className="transaction-history">
      <h2>📜 Transaction History</h2>
      
      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({transactions.length})
        </button>
        <button 
          className={filter === 'Direct Sale' ? 'active' : ''} 
          onClick={() => setFilter('Direct Sale')}
        >
          Direct Sales
        </button>
        <button 
          className={filter === 'Consignment' ? 'active' : ''} 
          onClick={() => setFilter('Consignment')}
        >
          Consignments
        </button>
        <button 
          className={filter === 'Personal Use' ? 'active' : ''} 
          onClick={() => setFilter('Personal Use')}
        >
          Personal Use
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-history">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Flavor</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Consignee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id}>
                  <td>{new Date(txn.timestamp).toLocaleDateString()}</td>
                  <td>
                    <span className={`type-badge ${txn.type.toLowerCase().replace(' ', '-')}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td>{txn.flavor}</td>
                  <td>{txn.quantity}</td>
                  <td>₱{txn.price.toFixed(2)}</td>
                  <td className="total-col">₱{(txn.quantity * txn.price).toFixed(2)}</td>
                  <td>{txn.consignee || '-'}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(txn.id, txn.flavor, txn.quantity)}
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
