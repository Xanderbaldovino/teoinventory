import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BulkConsignment.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

const FLAVORS = [
  "Black Currant", "Matcha", "Watermelon", "Bubblegum", "Mango", "Grapes",
  "Lemon Cola", "Mixed Berries", "Blueberry", "Strawberry", "Banana", "Yakult"
];

function BulkConsignment({ onSuccess }) {
  const [consignee, setConsignee] = useState('');
  const [items, setItems] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState(250);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const toast = useToast();

  useEffect(() => {
    // Fetch default consignment price from settings
    axios.get(`${API_URL}/settings`)
      .then(response => {
        setDefaultPrice(response.data.price_consignment);
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { flavor: FLAVORS[0], quantity: 1, price: defaultPrice }
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'flavor' ? value : parseFloat(value) || 0;
    setItems(newItems);
  };

  const addAllFlavors = () => {
    const allFlavorItems = FLAVORS.map(flavor => ({
      flavor,
      quantity: 1,
      price: defaultPrice
    }));
    setItems(allFlavorItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotalUnits = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!consignee.trim()) {
      setError('Consignee name is required');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/consignment/bulk`, {
        consignee: consignee.trim(),
        items
      });

      toast.success(response.data.message);
      setConsignee('');
      setItems([]);
      setError('');
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to add consignment';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-consignment-container">
      <div className="bulk-card">
        <h2>📦 Bulk Consignment</h2>
        <p className="bulk-description">
          Add multiple flavors at once for a consignee. Perfect for bulk orders!
        </p>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="consignee-input-section">
            <label>Consignee Name *</label>
            <input
              type="text"
              value={consignee}
              onChange={(e) => setConsignee(e.target.value)}
              className="form-control"
              placeholder="Enter consignee name (e.g., KJ, Jross, Gerbe)"
              required
            />
          </div>

          <div className="items-section">
            <div className="items-header">
              <h3>Items</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={addAllFlavors}
                  className="add-item-btn"
                  style={{ background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' }}
                >
                  ➕ Add All Flavors
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="add-item-btn"
                >
                  ➕ Add Item
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty-items">
                No items added yet. Click "Add Item" or "Add All Flavors" to start.
              </div>
            ) : (
              <div className="items-list">
                {items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-field">
                      <label>Flavor</label>
                      <select
                        value={item.flavor}
                        onChange={(e) => updateItem(index, 'flavor', e.target.value)}
                        className="form-control"
                      >
                        {FLAVORS.map(flavor => (
                          <option key={flavor} value={flavor}>{flavor}</option>
                        ))}
                      </select>
                    </div>

                    <div className="item-field">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div className="item-field">
                      <label>Price (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div className="item-total">
                      <label>Total</label>
                      <div className="total-value">
                        ₱{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="summary-section">
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Total Items</label>
                  <div className="value">{items.length}</div>
                </div>
                <div className="summary-item">
                  <label>Total Units</label>
                  <div className="value">{calculateTotalUnits()}</div>
                </div>
                <div className="summary-item">
                  <label>Total Amount</label>
                  <div className="value" style={{ color: '#ffc107' }}>
                    ₱{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || items.length === 0}
          >
            {loading ? 'Processing...' : '💾 Add Bulk Consignment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BulkConsignment;
