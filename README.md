# 💨 Vape Inventory & Sales Manager

A production-ready local web application for managing vape inventory, sales, and consignments.

## 🚀 Features

- **Real-time Dashboard** with financial metrics (Cash, Receivables, Inventory Value, Net Profit)
- **Transaction Management** (Direct Sales, Discount Sales, Consignments, Personal Use)
- **Bulk Consignment** - Add multiple flavors at once for a consignee
- **Consignee Tracking** with debt management and payment marking
- **Configurable Pricing** - Set your own pricing tiers in Settings
- **Low Stock Alerts** for inventory below 3 units
- **Excel Export** with detailed reports (Inventory, Financials, Consignees)
- **Dark Mode UI** with cyberpunk aesthetic
- **Mobile Responsive** design

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## 🛠️ Installation & Setup

### Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 3: Start the Application

**Option A: Using the startup script (Windows)**
```bash
start_app.bat
```

**Option B: Manual startup**

Terminal 1 - Start Backend:
```bash
python app.py
```

Terminal 2 - Start Frontend:
```bash
cd frontend
npm start
```

The application will open automatically at `http://localhost:3000`

## 📊 Initial Data

The application comes pre-loaded with:
- **12 Flavors**: Black Currant, Matcha, Watermelon, Bubblegum, Mango, Grapes, Lemon Cola, Mixed Berries, Blueberry, Strawberry, Banana, Yakult
- **Initial Stock**: 15 units per flavor (180 total)
- **Historical Transactions**: Pre-processed sales and consignments
- **3 Consignees**: KJ, Jross, Gerbe

## 💰 Pricing Tiers

- **Standard Sale**: ₱300
- **Discount Sale**: ₱280
- **Consignment**: ₱250 (Receivable)
- **Personal Use**: ₱150 (Cost recovery)

## 🎯 Usage

### Dashboard
View real-time financial metrics and low stock alerts.

### Add Transaction
1. Click "New Transaction" tab
2. Select transaction type
3. Choose flavor and quantity
4. Enter consignee name (if consignment)
5. Submit transaction

### Bulk Consignment (NEW!)
1. Click "Bulk Consignment" tab
2. Enter consignee name
3. Click "Add All Flavors" or add items individually
4. Adjust quantities and prices per item
5. Submit bulk consignment

### Consignee Tracker
- View all consignees and their debts
- Mark payments as received
- Track individual items per consignee

### Inventory
- View current stock levels
- See status indicators (OK, Low Stock, Out of Stock)
- Monitor total inventory value

### Settings (NEW!)
- Configure pricing tiers (Standard, Discount, Consignment, Personal)
- Set base cost for profit calculations
- View profit margin previews
- Changes apply to new transactions

### Export Reports
Click "Download Excel Report" to generate a comprehensive Excel file with:
- Sheet 1: Inventory breakdown
- Sheet 2: Financial summary
- Sheet 3: Consignee details

## 🗄️ Database

Data is stored in `vape_data.json` in the root directory. To reset to initial state, delete this file and restart the backend.

## 🔧 API Endpoints

- `GET /api/dashboard` - Get dashboard data
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `GET /api/consignees` - Get consignee summary
- `POST /api/consignees/<name>/pay` - Mark consignee as paid
- `POST /api/consignment/bulk` - Add bulk consignment (NEW!)
- `GET /api/settings` - Get pricing settings (NEW!)
- `PUT /api/settings` - Update pricing settings (NEW!)
- `GET /api/export` - Download Excel report
- `POST /api/reset` - Reset database to initial state

## 🎨 Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React.js
- **Database**: JSON file (SQLite-ready architecture)
- **Export**: Pandas + XlsxWriter
- **Styling**: Custom CSS with dark mode theme

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari

## 🐛 Troubleshooting

**Port already in use:**
- Backend: Change port in `app.py` (line: `app.run(debug=True, port=5000)`)
- Frontend: Set `PORT=3001` in frontend/.env

**CORS errors:**
- Ensure backend is running on port 5000
- Check Flask-CORS is installed

**Excel export fails:**
- Verify pandas and xlsxwriter are installed
- Check write permissions in the directory

## 📄 License

This is a proprietary business application.

## 👨‍💻 Support

For issues or questions, contact the development team.
