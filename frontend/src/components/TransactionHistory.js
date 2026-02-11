import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionHistory.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

function TransactionHistory({ onUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('transactions'); // 'transactions' or 'audit'
  const toast = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchAuditLog();
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

  const fetchAuditLog = async () => {
    try {
      const response = await axios.get(`${API_URL}/transaction-history`);
      setAuditLog(response.data);
    } catch (error) {
      console.error('Error fetching audit log:', error);
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
      fetchAuditLog();
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete transaction');
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      'transaction_created': '📝',
      'transaction_accepted': '✅',
      'transaction_rejected': '❌',
      'transaction_deleted': '🗑️',
      'consignee_partial_payment': '💵',
      'consignee_full_payment': '💰',
      'bulk_consignment_added': '📦'
    };
    return icons[eventType] || '📋';
  };

  const getEventDescription = (event) => {
    const { event_type, details } = event;
    
    switch (event_type) {
      case 'transaction_created':
        return `${details.type} created: ${details.quantity}x ${details.flavor} @ ₱${details.price}${details.consignee ? ` (${details.consignee})` : ''}`;
      
      case 'transaction_accepted':
        return `${details.type} accepted: ${details.quantity}x ${details.flavor}${details.consignee ? ` (${details.consignee})` : ''}`;
      
      case 'transaction_rejected':
        return `${details.type} rejected: ${details.quantity}x ${details.flavor}${details.consignee ? ` (${details.consignee})` : ''}`;
      
      case 'transaction_deleted':
        return `${details.type} deleted: ${details.quantity}x ${details.flavor} (Inventory restored)`;
      
      case 'consignee_partial_payment':
        return `Partial payment from ${details.consignee}: ₱${details.amount.toFixed(2)} (Remaining: ₱${details.remaining_debt.toFixed(2)})`;
      
      case 'consignee_full_payment':
        return `Full payment from ${details.consignee}: ₱${details.amount.toFixed(2)}`;
      
      case 'bulk_consignment_added':
        return `Bulk consignment for ${details.consignee}: ${details.items_count} items (Total: ₱${details.total.toFixed(2)})`;
      
      default:
        return `${event_type}: ${JSON.stringify(details)}`;
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
      <div className="history-header">
        <h2>📜 Transaction History</h2>
        <div className="view-mode-toggle">
          <button 
            className={viewMode === 'transactions' ? 'active' : ''}
            onClick={() => setViewMode('transactions')}
          >
            📊 Transactions
          </button>
          <button 
            className={viewMode === 'audit' ? 'active' : ''}
            onClick={() => setViewMode('audit')}
          >
            🔍 Audit Log
          </button>
        </div>
      </div>

      {viewMode === 'transactions' ? (
        <>
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
        </>
      ) : (
        <div className="audit-log-view">
          {auditLog.length === 0 ? (
            <div className="empty-history">
              <p>No audit log entries found</p>
            </div>
          ) : (
            <div className="audit-log-list">
              {auditLog.map(event => (
                <div key={event.id} className="audit-log-item">
                  <div className="audit-icon">{getEventIcon(event.event_type)}</div>
                  <div className="audit-content">
                    <div className="audit-description">{getEventDescription(event)}</div>
                    <div className="audit-timestamp">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    {event.details.items_paid && event.details.items_paid.length > 0 && (
                      <div className="audit-items-detail">
                        <strong>Items paid:</strong>
                        <ul>
                          {event.details.items_paid.map((item, idx) => (
                            <li key={idx}>
                              {item.flavor} (x{item.quantity}) - ₱{item.amount.toFixed(2)} 
                              <span className={`status-${item.status}`}> [{item.status.replace('_', ' ')}]</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
