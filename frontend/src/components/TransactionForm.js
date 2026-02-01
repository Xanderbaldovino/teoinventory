import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionForm.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

const FLAVORS = [
  "Black Currant", "Matcha", "Watermelon", "Bubblegum", "Mango", "Grapes",
  "Lemon Cola", "Mixed Berries", "Blueberry", "Strawberry", "Banana", "Yakult"
];

function TransactionForm({ onSuccess }) {
  const toast = useToast();
  const [priceSettings, setPriceSettings] = useState({
    price_standard: 300,
    price_discount: 280,
    price_consignment: 250,
    price_personal: 150
  });

  const TRANSACTION_TYPES = {
    'Direct Sale': { price: priceSettings.price_standard, requiresConsignee: false },
    'Discount Sale': { price: priceSettings.price_discount, requiresConsignee: false },
    'Consignment': { price: priceSettings.price_consignment, requiresConsignee: true },
    'Personal Use': { price: priceSettings.price_personal, requiresConsignee: false }
  };

  const [formData, setFormData] = useState({
    type: 'Direct Sale',
    flavor: FLAVORS[0],
    quantity: 1,
    price: priceSettings.price_standard,
    consignee: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch pricing settings
    axios.get(`${API_URL}/settings`)
      .then(response => {
        setPriceSettings({
          price_standard: response.data.price_standard,
          price_discount: response.data.price_discount,
          price_consignment: response.data.price_consignment,
          price_personal: response.data.price_personal
        });
        setFormData(prev => ({
          ...prev,
          price: response.data.price_standard
        }));
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const typeConfig = TRANSACTION_TYPES[type];
    setFormData({
      ...formData,
      type,
      price: typeConfig.price,
      consignee: typeConfig.requiresConsignee ? formData.consignee : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.quantity < 1) {
      setError('Quantity must be at least 1');
      setLoading(false);
      return;
    }

    const typeConfig = TRANSACTION_TYPES[formData.type];
    if (typeConfig.requiresConsignee && !formData.consignee.trim()) {
      setError('Consignee name is required for consignment transactions');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/transactions`, formData);
      toast.success('✅ Transaction created and pending approval!');
      setFormData({
        type: 'Direct Sale',
        flavor: FLAVORS[0],
        quantity: 1,
        price: priceSettings.price_standard,
        consignee: ''
      });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const requiresConsignee = TRANSACTION_TYPES[formData.type].requiresConsignee;

  return (
    <div className="transaction-form-container">
      <div className="form-card">
        <h2>➕ Add New Transaction</h2>
        
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transaction Type</label>
            <select 
              value={formData.type} 
              onChange={handleTypeChange}
              className="form-control"
            >
              {Object.keys(TRANSACTION_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Flavor</label>
            <select 
              value={formData.flavor} 
              onChange={(e) => setFormData({...formData, flavor: e.target.value})}
              className="form-control"
            >
              {FLAVORS.map(flavor => (
                <option key={flavor} value={flavor}>{flavor}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Price per Unit (₱)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
              className="form-control"
            />
          </div>

          {requiresConsignee && (
            <div className="form-group">
              <label>Consignee Name *</label>
              <input 
                type="text" 
                value={formData.consignee}
                onChange={(e) => setFormData({...formData, consignee: e.target.value})}
                className="form-control"
                placeholder="Enter consignee name"
                required
              />
            </div>
          )}

          <div className="total-preview">
            <span>Total Amount:</span>
            <span className="total-amount">₱{(formData.quantity * formData.price).toFixed(2)}</span>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : '💾 Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
