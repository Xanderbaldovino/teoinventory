import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PendingTransactions.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

function PendingTransactions({ onUpdate }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await axios.get(`${API_URL}/pending-transactions`);
      setPending(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this transaction?')) return;

    try {
      await axios.post(`${API_URL}/pending-transactions/${id}/accept`);
      toast.success('Transaction accepted successfully!');
      fetchPending();
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept transaction');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this transaction?')) return;

    try {
      await axios.post(`${API_URL}/pending-transactions/${id}/reject`);
      toast.warning('Transaction rejected and deleted');
      fetchPending();
    } catch (error) {
      toast.error('Failed to reject transaction');
    }
  };

  if (loading) {
    return <div className="loading">Loading pending transactions...</div>;
  }

  if (pending.length === 0) {
    return (
      <div className="pending-empty">
        <h2>✅ No Pending Transactions</h2>
        <p>All transactions have been reviewed!</p>
      </div>
    );
  }

  return (
    <div className="pending-transactions">
      <h2>⏳ Pending Transactions ({pending.length})</h2>
      <p className="pending-description">Review and approve or reject transactions before they're finalized.</p>

      <div className="pending-list">
        {pending.map(txn => (
          <div key={txn.id} className="pending-card">
            <div className="pending-header">
              <span className="pending-type">{txn.type}</span>
              <span className="pending-time">{new Date(txn.timestamp).toLocaleString()}</span>
            </div>

            <div className="pending-details">
              <div className="detail-row">
                <span className="label">Flavor:</span>
                <span className="value">{txn.flavor}</span>
              </div>
              <div className="detail-row">
                <span className="label">Quantity:</span>
                <span className="value">{txn.quantity} units</span>
              </div>
              <div className="detail-row">
                <span className="label">Price:</span>
                <span className="value">₱{txn.price.toFixed(2)}</span>
              </div>
              {txn.consignee && (
                <div className="detail-row">
                  <span className="label">Consignee:</span>
                  <span className="value">{txn.consignee}</span>
                </div>
              )}
              <div className="detail-row total">
                <span className="label">Total:</span>
                <span className="value">₱{(txn.quantity * txn.price).toFixed(2)}</span>
              </div>
            </div>

            <div className="pending-actions">
              <button className="accept-btn" onClick={() => handleAccept(txn.id)}>
                ✅ Accept
              </button>
              <button className="reject-btn" onClick={() => handleReject(txn.id)}>
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingTransactions;
