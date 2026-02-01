import React, { useState } from 'react';
import axios from 'axios';
import './ConsigneeTracker.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

function ConsigneeTracker({ consignees, onUpdate }) {
  const [loading, setLoading] = useState({});
  const toast = useToast();

  const handleMarkPaid = async (name) => {
    if (!window.confirm(`Mark all items for ${name} as paid?`)) {
      return;
    }

    setLoading({ ...loading, [name]: true });
    try {
      await axios.post(`${API_URL}/consignees/${name}/pay`);
      toast.success(`${name} marked as paid successfully!`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to mark as paid');
    } finally {
      setLoading({ ...loading, [name]: false });
    }
  };

  const consigneeNames = Object.keys(consignees);

  if (consigneeNames.length === 0) {
    return (
      <div className="consignee-tracker">
        <div className="empty-state">
          <h2>👥 No Consignees Yet</h2>
          <p>Add consignment transactions to track receivables</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consignee-tracker">
      <h2>👥 Consignee Debt Tracker</h2>
      
      <div className="consignee-grid">
        {consigneeNames.map(name => {
          const data = consignees[name];
          const hasDebt = data.total_debt > 0;

          return (
            <div key={name} className={`consignee-card ${!hasDebt ? 'paid' : ''}`}>
              <div className="consignee-header">
                <h3>{name}</h3>
                <div className="debt-amount">
                  ₱{data.total_debt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {hasDebt ? (
                <>
                  <div className="items-list">
                    {data.items.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-flavor">{item.flavor}</span>
                        <span className="item-qty">x{item.quantity}</span>
                        <span className="item-price">₱{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="pay-btn"
                    onClick={() => handleMarkPaid(name)}
                    disabled={loading[name]}
                  >
                    {loading[name] ? 'Processing...' : '✅ Mark as Paid'}
                  </button>
                </>
              ) : (
                <div className="paid-status">
                  <span className="paid-badge">✅ All Paid</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsigneeTracker;
