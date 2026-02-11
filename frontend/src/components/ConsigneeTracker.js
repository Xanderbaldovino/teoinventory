import React, { useState } from 'react';
import axios from 'axios';
import './ConsigneeTracker.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

function ConsigneeTracker({ consignees, onUpdate }) {
  const [loading, setLoading] = useState({});
  const [showPartialPayment, setShowPartialPayment] = useState({});
  const [partialAmount, setPartialAmount] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [paymentHistory, setPaymentHistory] = useState({});
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

  const handlePartialPayment = async (name) => {
    const selected = selectedItems[name] || [];
    let amount;

    if (selected.length > 0) {
      // Use selected items total
      amount = calculateSelectedTotal(name, consignees[name].items);
    } else {
      // Use manual input
      amount = parseFloat(partialAmount[name]);
      
      if (!amount || amount <= 0) {
        toast.error('Please enter a valid amount or select items');
        return;
      }
    }

    setLoading({ ...loading, [name]: true });
    try {
      const response = await axios.post(`${API_URL}/consignees/${name}/partial-pay`, {
        amount: amount,
        selected_items: selected
      });
      toast.success(response.data.message);
      setPartialAmount({ ...partialAmount, [name]: '' });
      setSelectedItems({ ...selectedItems, [name]: [] });
      setShowPartialPayment({ ...showPartialPayment, [name]: false });
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process partial payment');
    } finally {
      setLoading({ ...loading, [name]: false });
    }
  };

  const toggleItemSelection = (name, itemIndex) => {
    const current = selectedItems[name] || [];
    const newSelection = current.includes(itemIndex)
      ? current.filter(i => i !== itemIndex)
      : [...current, itemIndex];
    setSelectedItems({ ...selectedItems, [name]: newSelection });
  };

  const calculateSelectedTotal = (name, items) => {
    const selected = selectedItems[name] || [];
    return selected.reduce((total, idx) => {
      const item = items[idx];
      if (item && !item.paid) {
        const itemTotal = item.quantity * item.price;
        const partialPaid = item.partial_payment || 0;
        return total + (itemTotal - partialPaid);
      }
      return total;
    }, 0);
  };

  const togglePartialPayment = (name) => {
    setShowPartialPayment({
      ...showPartialPayment,
      [name]: !showPartialPayment[name]
    });
  };

  const fetchPaymentHistory = async (name) => {
    try {
      const response = await axios.get(`${API_URL}/consignees/${name}/payments`);
      setPaymentHistory({
        ...paymentHistory,
        [name]: response.data
      });
    } catch (error) {
      console.error('Error fetching payment history:', error);
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
                        {item.partial_payment && (
                          <span className="partial-paid">
                            (Paid: ₱{item.partial_payment.toFixed(2)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {showPartialPayment[name] && (
                    <div className="partial-payment-form">
                      <div className="select-items-section">
                        <h4>Select Items Sold:</h4>
                        <div className="items-selection-list">
                          {data.items.map((item, idx) => {
                            if (item.paid) return null;
                            const itemTotal = item.quantity * item.price;
                            const partialPaid = item.partial_payment || 0;
                            const remaining = itemTotal - partialPaid;
                            const isSelected = (selectedItems[name] || []).includes(idx);
                            
                            return (
                              <div 
                                key={idx} 
                                className={`selectable-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleItemSelection(name, idx)}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => {}}
                                />
                                <span className="item-info">
                                  {item.flavor} (x{item.quantity})
                                </span>
                                <span className="item-remaining">
                                  ₱{remaining.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {(selectedItems[name] || []).length > 0 && (
                          <div className="selected-total">
                            Payment Amount: ₱{calculateSelectedTotal(name, data.items).toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      {(selectedItems[name] || []).length === 0 && (
                        <>
                          <div className="or-divider">
                            <span>OR enter custom amount:</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter payment amount"
                            value={partialAmount[name] || ''}
                            onChange={(e) => setPartialAmount({ ...partialAmount, [name]: e.target.value })}
                            className="partial-input"
                          />
                        </>
                      )}
                      
                      <div className="partial-buttons">
                        <button 
                          className="confirm-partial-btn"
                          onClick={() => handlePartialPayment(name)}
                          disabled={loading[name]}
                        >
                          ✅ Confirm Payment
                        </button>
                        <button 
                          className="cancel-partial-btn"
                          onClick={() => {
                            togglePartialPayment(name);
                            setSelectedItems({ ...selectedItems, [name]: [] });
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="payment-actions">
                    <button 
                      className="partial-pay-btn"
                      onClick={() => togglePartialPayment(name)}
                      disabled={loading[name]}
                    >
                      💵 Partial Payment
                    </button>
                    <button 
                      className="pay-btn"
                      onClick={() => handleMarkPaid(name)}
                      disabled={loading[name]}
                    >
                      {loading[name] ? 'Processing...' : '✅ Mark as Paid'}
                    </button>
                  </div>

                  <button 
                    className="history-btn"
                    onClick={() => fetchPaymentHistory(name)}
                  >
                    📜 Payment History
                  </button>

                  {paymentHistory[name] && paymentHistory[name].length > 0 && (
                    <div className="payment-history">
                      <h4>Payment History:</h4>
                      {paymentHistory[name].map((payment, idx) => (
                        <div key={idx} className="history-item">
                          <span>{new Date(payment.timestamp).toLocaleDateString()}</span>
                          <span className="history-amount">₱{payment.amount.toFixed(2)}</span>
                          <span className="history-remaining">Remaining: ₱{payment.remaining_debt.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
