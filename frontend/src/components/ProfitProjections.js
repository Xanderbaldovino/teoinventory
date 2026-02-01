import React from 'react';
import './ProfitProjections.css';

function ProfitProjections({ dashboardData }) {
  const { financials, inventory } = dashboardData;
  
  // Constants
  const CAPITAL_INVESTMENT = 27000; // 180 units × ₱150
  const INITIAL_UNITS = 180;
  
  // Calculate remaining units
  const remainingUnits = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
  const soldUnits = INITIAL_UNITS - remainingUnits;
  
  // Current financials
  const cashOnHand = financials.cash_on_hand;
  const receivables = financials.total_receivables;
  const personalUseRecovery = financials.personal_use_recovery || 0;
  const inventoryValue = financials.inventory_value;
  
  // Current total assets
  const currentAssets = cashOnHand + receivables + personalUseRecovery + inventoryValue;
  
  // Current profit
  const currentProfit = currentAssets - CAPITAL_INVESTMENT;
  
  // Projections if we sell remaining units
  const projection280 = {
    additionalRevenue: remainingUnits * 280,
    totalAssets: cashOnHand + receivables + personalUseRecovery + (remainingUnits * 280),
    totalProfit: (cashOnHand + receivables + personalUseRecovery + (remainingUnits * 280)) - CAPITAL_INVESTMENT,
    profitPerUnit: 280 - 150
  };
  
  const projection300 = {
    additionalRevenue: remainingUnits * 300,
    totalAssets: cashOnHand + receivables + personalUseRecovery + (remainingUnits * 300),
    totalProfit: (cashOnHand + receivables + personalUseRecovery + (remainingUnits * 300)) - CAPITAL_INVESTMENT,
    profitPerUnit: 300 - 150
  };

  // ROI calculations
  const currentROI = (currentProfit / CAPITAL_INVESTMENT) * 100;
  const roi280 = (projection280.totalProfit / CAPITAL_INVESTMENT) * 100;
  const roi300 = (projection300.totalProfit / CAPITAL_INVESTMENT) * 100;

  return (
    <div className="profit-projections">
      <h2>💰 Profit Calculator</h2>
      <p className="projections-description">
        Complete profit analysis based on ₱27,000 capital investment
      </p>

      <div className="capital-section">
        <h3>💵 Capital Investment</h3>
        <div className="capital-grid">
          <div className="capital-item">
            <span className="capital-label">Initial Investment</span>
            <span className="capital-value">₱{CAPITAL_INVESTMENT.toLocaleString()}</span>
          </div>
          <div className="capital-item">
            <span className="capital-label">Initial Units</span>
            <span className="capital-value">{INITIAL_UNITS} units</span>
          </div>
          <div className="capital-item">
            <span className="capital-label">Cost per Unit</span>
            <span className="capital-value">₱150</span>
          </div>
        </div>
      </div>

      <div className="current-status">
        <h3>📊 Current Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Cash on Hand</span>
            <span className="status-value">₱{cashOnHand.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Receivables</span>
            <span className="status-value">₱{receivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Personal Use</span>
            <span className="status-value">₱{personalUseRecovery.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Inventory Value</span>
            <span className="status-value">₱{inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="current-summary">
          <div className="summary-row">
            <span>Total Assets:</span>
            <span className="summary-value">₱{currentAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Capital Investment:</span>
            <span className="summary-value">₱{CAPITAL_INVESTMENT.toLocaleString()}</span>
          </div>
          <div className="summary-row highlight">
            <span>Current Net Profit:</span>
            <span className="summary-value profit">₱{currentProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>ROI:</span>
            <span className="summary-value">{currentROI.toFixed(1)}%</span>
          </div>
        </div>

        <div className="units-info">
          <span>Units Sold/Consigned: {soldUnits} | Remaining: {remainingUnits}</span>
        </div>
      </div>

      <div className="projections-grid">
        <div className="projection-card discount">
          <div className="projection-header">
            <h3>💵 Scenario: Sell @ ₱280</h3>
            <span className="projection-label">If you sell all {remainingUnits} remaining units at discount price</span>
          </div>
          
          <div className="projection-details">
            <div className="detail-row">
              <span>Additional Revenue:</span>
              <span>₱{projection280.additionalRevenue.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Total Assets:</span>
              <span>₱{projection280.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="detail-row">
              <span>Capital Investment:</span>
              <span>₱{CAPITAL_INVESTMENT.toLocaleString()}</span>
            </div>
            <div className="detail-row highlight">
              <span>Total Net Profit:</span>
              <span>₱{projection280.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="detail-row">
              <span>ROI:</span>
              <span>{roi280.toFixed(1)}%</span>
            </div>
          </div>

          <div className="projection-footer">
            <span className="profit-per-unit">₱{projection280.profitPerUnit} profit per unit</span>
            <span className="additional-profit">+₱{(projection280.totalProfit - currentProfit).toLocaleString()} additional profit</span>
          </div>
        </div>

        <div className="projection-card standard">
          <div className="projection-header">
            <h3>💰 Scenario: Sell @ ₱300</h3>
            <span className="projection-label">If you sell all {remainingUnits} remaining units at standard price</span>
          </div>
          
          <div className="projection-details">
            <div className="detail-row">
              <span>Additional Revenue:</span>
              <span>₱{projection300.additionalRevenue.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Total Assets:</span>
              <span>₱{projection300.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="detail-row">
              <span>Capital Investment:</span>
              <span>₱{CAPITAL_INVESTMENT.toLocaleString()}</span>
            </div>
            <div className="detail-row highlight">
              <span>Total Net Profit:</span>
              <span>₱{projection300.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="detail-row">
              <span>ROI:</span>
              <span>{roi300.toFixed(1)}%</span>
            </div>
          </div>

          <div className="projection-footer">
            <span className="profit-per-unit">₱{projection300.profitPerUnit} profit per unit</span>
            <span className="additional-profit">+₱{(projection300.totalProfit - currentProfit).toLocaleString()} additional profit</span>
          </div>
        </div>
      </div>

      <div className="comparison-section">
        <h3>📊 Profit Comparison</h3>
        <div className="comparison-table">
          <div className="comparison-row header">
            <span>Scenario</span>
            <span>Total Assets</span>
            <span>Net Profit</span>
            <span>ROI</span>
          </div>
          <div className="comparison-row">
            <span>Current</span>
            <span>₱{currentAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>₱{currentProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>{currentROI.toFixed(1)}%</span>
          </div>
          <div className="comparison-row">
            <span>Sell @ ₱280</span>
            <span>₱{projection280.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="positive">₱{projection280.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>{roi280.toFixed(1)}%</span>
          </div>
          <div className="comparison-row">
            <span>Sell @ ₱300</span>
            <span>₱{projection300.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="positive">₱{projection300.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>{roi300.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="recommendation">
        <h4>💡 Analysis</h4>
        <p><strong>Capital Recovery:</strong> You've already recovered ₱{(cashOnHand + receivables + personalUseRecovery).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({((cashOnHand + receivables + personalUseRecovery) / CAPITAL_INVESTMENT * 100).toFixed(1)}% of your ₱{CAPITAL_INVESTMENT.toLocaleString()} investment)</p>
        <p><strong>Profit Difference:</strong> Selling at ₱300 instead of ₱280 gives you an extra ₱{(projection300.totalProfit - projection280.totalProfit).toLocaleString()} profit (₱{(projection300.additionalRevenue - projection280.additionalRevenue).toLocaleString()} more revenue)</p>
        <p><strong>Recommendation:</strong> Target ₱300 for popular flavors to maximize profit. Use ₱280 strategically for promotions or bulk sales.</p>
      </div>
    </div>
  );
}

export default ProfitProjections;
