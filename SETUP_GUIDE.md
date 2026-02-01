# 🚀 Quick Setup Guide

## First Time Setup (5 minutes)

### 1️⃣ Install Python Dependencies
Open Command Prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

### 2️⃣ Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3️⃣ Start the Application
Double-click `start_app.bat` or run:
```bash
start_app.bat
```

Two command windows will open:
- **Backend Server** (Flask) on port 5000
- **Frontend** (React) on port 3000

Your browser will automatically open to `http://localhost:3000`

## ✅ Verification

After startup, you should see:
- Dashboard with 4 financial cards
- Pre-loaded historical data
- 3 consignees (KJ, Jross, Gerbe) with debts
- Inventory showing remaining stock

## 🔄 Daily Usage

1. Double-click `start_app.bat`
2. Wait for browser to open
3. Start managing your inventory!

## 🛑 Stopping the Application

Close both command windows (Backend and Frontend)

## 📊 Exporting Reports

Click "Download Excel Report" button in the header to generate `Vape_Business_Data.xlsx`

## 🔧 Troubleshooting

**Problem: "pip is not recognized"**
- Install Python from python.org
- Make sure "Add Python to PATH" is checked during installation

**Problem: "npm is not recognized"**
- Install Node.js from nodejs.org
- Restart Command Prompt after installation

**Problem: Port 5000 already in use**
- Close other applications using port 5000
- Or edit `app.py` line 234 to use a different port

**Problem: Frontend won't start**
- Delete `frontend/node_modules` folder
- Run `npm install` again in the frontend folder

## 💾 Data Location

All data is stored in `vape_data.json` in the root folder.

**To reset to initial state:**
1. Close the application
2. Delete `vape_data.json`
3. Restart the application

## 🎯 Next Steps

1. Explore the Dashboard
2. Try adding a new transaction
3. Check the Consignee Tracker
4. Export your first report

Enjoy managing your vape business! 💨
