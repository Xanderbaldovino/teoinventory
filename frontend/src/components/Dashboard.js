import React from 'react';
import './Dashboard.css';

function Dashboard({ data }) {
  const { financials, low_stock } = data;

  return (
    <div className="dashboard">
      <div className="financial-cards">
        <div className="card cash">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3>Cash on Hand</h3>
            <p className="amount">₱{financials.cash_on_hand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="card receivables">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Total Receivables</h3>
            <p className="amount">₱{financials.total_receivables.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="card inventory">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Inventory Value</h3>
            <p className="amount">₱{financials.inventory_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="card profit">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Net Profit</h3>
            <p className="amount">₱{financials.net_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {low_stock.length > 0 && (
        <div className="alert-section">
          <div className="alert-card">
            <h3>⚠️ Low Stock Alert</h3>
            <div className="alert-items">
              {low_stock.map(flavor => (
                <span key={flavor} className="alert-badge">{flavor}</span>
              ))}
            </div>
            <p className="alert-message">These flavors have less than 3 units remaining!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
