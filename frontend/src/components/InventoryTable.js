import React from 'react';
import './InventoryTable.css';

function InventoryTable({ inventory, lowStock }) {
  const sortedFlavors = Object.keys(inventory).sort();

  return (
    <div className="inventory-table-container">
      <h2>📦 Current Inventory</h2>
      
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Flavor</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedFlavors.map(flavor => {
              const stock = inventory[flavor];
              const isLow = lowStock.includes(flavor);
              const isOut = stock === 0;

              return (
                <tr key={flavor} className={isOut ? 'out-of-stock' : isLow ? 'low-stock' : ''}>
                  <td className="flavor-name">{flavor}</td>
                  <td className="stock-qty">
                    <span className="stock-badge">{stock} units</span>
                  </td>
                  <td className="status-cell">
                    {isOut ? (
                      <span className="status-badge out">❌ Out of Stock</span>
                    ) : isLow ? (
                      <span className="status-badge low">⚠️ Low Stock</span>
                    ) : (
                      <span className="status-badge ok">✅ OK</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="inventory-summary">
        <div className="summary-item">
          <span>Total Units:</span>
          <span className="summary-value">{Object.values(inventory).reduce((a, b) => a + b, 0)}</span>
        </div>
        <div className="summary-item">
          <span>Total Value:</span>
          <span className="summary-value">₱{(Object.values(inventory).reduce((a, b) => a + b, 0) * 150).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default InventoryTable;
