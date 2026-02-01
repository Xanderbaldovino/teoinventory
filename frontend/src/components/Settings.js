import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';
import { useToast } from './ToastContainer';

const API_URL = 'http://localhost:5000/api';

function Settings({ onUpdate }) {
  const [settings, setSettings] = useState({
    base_cost: 150,
    price_standard: 300,
    price_discount: 280,
    price_consignment: 250,
    price_personal: 150
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: parseFloat(value) || 0
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API_URL}/settings`, settings);
      toast.success('Settings saved successfully!');
      setTimeout(() => {
        onUpdate();
      }, 1000);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>⚙️ Pricing Settings</h2>
        <p className="settings-description">
          Configure your pricing tiers. These will be used as default values when adding transactions.
        </p>

        <form onSubmit={handleSave}>
          <div className="settings-grid">
            <div className="setting-item">
              <label>
                <span className="label-icon">💰</span>
                Base Cost (Capital)
              </label>
              <div className="input-group">
                <span className="currency">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.base_cost}
                  onChange={(e) => handleChange('base_cost', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <small>Cost per unit (used for profit calculations)</small>
            </div>

            <div className="setting-item">
              <label>
                <span className="label-icon">💵</span>
                Standard Selling Price
              </label>
              <div className="input-group">
                <span className="currency">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.price_standard}
                  onChange={(e) => handleChange('price_standard', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <small>Regular retail price</small>
            </div>

            <div className="setting-item">
              <label>
                <span className="label-icon">🏷️</span>
                Discount Selling Price
              </label>
              <div className="input-group">
                <span className="currency">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.price_discount}
                  onChange={(e) => handleChange('price_discount', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <small>Discounted price for special sales</small>
            </div>

            <div className="setting-item">
              <label>
                <span className="label-icon">📋</span>
                Consignment Price
              </label>
              <div className="input-group">
                <span className="currency">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.price_consignment}
                  onChange={(e) => handleChange('price_consignment', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <small>Default price for consignment (receivable)</small>
            </div>

            <div className="setting-item">
              <label>
                <span className="label-icon">👤</span>
                Personal Use Price
              </label>
              <div className="input-group">
                <span className="currency">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={settings.price_personal}
                  onChange={(e) => handleChange('price_personal', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <small>Price for personal use (usually cost price)</small>
            </div>
          </div>

          <div className="profit-preview">
            <h3>💡 Profit Margins Preview</h3>
            <div className="margin-grid">
              <div className="margin-item">
                <span>Standard Sale:</span>
                <span className="margin-value">
                  ₱{(settings.price_standard - settings.base_cost).toFixed(2)} 
                  ({((settings.price_standard - settings.base_cost) / settings.base_cost * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="margin-item">
                <span>Discount Sale:</span>
                <span className="margin-value">
                  ₱{(settings.price_discount - settings.base_cost).toFixed(2)}
                  ({((settings.price_discount - settings.base_cost) / settings.base_cost * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="margin-item">
                <span>Consignment:</span>
                <span className="margin-value">
                  ₱{(settings.price_consignment - settings.base_cost).toFixed(2)}
                  ({((settings.price_consignment - settings.base_cost) / settings.base_cost * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
