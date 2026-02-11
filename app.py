from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime
import pandas as pd
from decimal import Decimal, ROUND_HALF_UP

app = Flask(__name__)
CORS(app)

DB_FILE = 'vape_data.json'

# Constants
FLAVORS = [
    "Black Currant", "Matcha", "Watermelon", "Bubblegum", "Mango", "Grapes",
    "Lemon Cola", "Mixed Berries", "Blueberry", "Strawberry", "Banana", "Yakult"
]
INITIAL_STOCK = 15

# Default pricing (can be overridden in settings)
DEFAULT_SETTINGS = {
    'base_cost': 150,
    'price_standard': 300,
    'price_discount': 280,
    'price_consignment': 250,
    'price_personal': 150
}

def round_currency(value):
    """Round to 2 decimal places"""
    return float(Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))

def initialize_database():
    """Initialize database with starting state and historical transactions"""
    data = {
        'inventory': {flavor: INITIAL_STOCK for flavor in FLAVORS},
        'transactions': [],
        'pending_transactions': [],
        'consignees': {},
        'settings': DEFAULT_SETTINGS.copy()
    }
    
    # Get pricing from settings
    BASE_COST = data['settings']['base_cost']
    PRICE_STANDARD = data['settings']['price_standard']
    PRICE_DISCOUNT = data['settings']['price_discount']
    PRICE_CONSIGNMENT = data['settings']['price_consignment']
    PRICE_PERSONAL = data['settings']['price_personal']
    
    # Process historical cash sales @ 300
    cash_sales_300 = [
        ('Bubblegum', 1),  # Echague
        ('Matcha', 1),     # Roxas
        ('Yakult', 1),     # Roxas
        ('Mango', 3),      # Echague (1) + Roxas (2) = 3 total
        ('Banana', 1),     # Roxas
        ('Grapes', 2)      # Roxas (2 units)
    ]
    for flavor, qty in cash_sales_300:
        data['transactions'].append({
            'id': len(data['transactions']) + 1,
            'type': 'Direct Sale',
            'flavor': flavor,
            'quantity': qty,
            'price': PRICE_STANDARD,
            'consignee': None,
            'timestamp': '2024-01-01T10:00:00',
            'paid': True
        })
        data['inventory'][flavor] -= qty
    
    # Process historical cash sales @ 280
    cash_sales_280 = [
        ('Banana', 1), ('Grapes', 3), ('Mango', 3), ('Lemon Cola', 3), ('Yakult', 3)
    ]
    for flavor, qty in cash_sales_280:
        data['transactions'].append({
            'id': len(data['transactions']) + 1,
            'type': 'Direct Sale',
            'flavor': flavor,
            'quantity': qty,
            'price': PRICE_DISCOUNT,
            'consignee': None,
            'timestamp': '2024-01-02T10:00:00',
            'paid': True
        })
        data['inventory'][flavor] -= qty
    
    # Process personal use
    personal_use = [('Lemon Cola', 1), ('Mango', 1), ('Grapes', 1)]
    for flavor, qty in personal_use:
        data['transactions'].append({
            'id': len(data['transactions']) + 1,
            'type': 'Personal Use',
            'flavor': flavor,
            'quantity': qty,
            'price': PRICE_PERSONAL,
            'consignee': None,
            'timestamp': '2024-01-03T10:00:00',
            'paid': True
        })
        data['inventory'][flavor] -= qty
    
    # Process consignments - KJ (5 of each)
    data['consignees']['KJ'] = []
    for flavor in FLAVORS:
        data['transactions'].append({
            'id': len(data['transactions']) + 1,
            'type': 'Consignment',
            'flavor': flavor,
            'quantity': 5,
            'price': PRICE_CONSIGNMENT,
            'consignee': 'KJ',
            'timestamp': '2024-01-04T10:00:00',
            'paid': False
        })
        data['inventory'][flavor] -= 5
        data['consignees']['KJ'].append({
            'flavor': flavor,
            'quantity': 5,
            'price': PRICE_CONSIGNMENT,
            'paid': False
        })
    
    # Process consignments - Jross (2 of each)
    data['consignees']['Jross'] = []
    for flavor in FLAVORS:
        data['transactions'].append({
            'id': len(data['transactions']) + 1,
            'type': 'Consignment',
            'flavor': flavor,
            'quantity': 2,
            'price': PRICE_CONSIGNMENT,
            'consignee': 'Jross',
            'timestamp': '2024-01-05T10:00:00',
            'paid': False
        })
        data['inventory'][flavor] -= 2
        data['consignees']['Jross'].append({
            'flavor': flavor,
            'quantity': 2,
            'price': PRICE_CONSIGNMENT,
            'paid': False
        })
    
    # Process consignments - Gerbe (specific items)
    gerbe_items = [
        ('Black Currant', 1), ('Watermelon', 1), ('Bubblegum', 1), ('Grapes', 1),
        ('Lemon Cola', 1), ('Mixed Berries', 1), ('Blueberry', 1), ('Strawberry', 1),
        ('Banana', 2), ('Yakult', 1)
    ]
    data['consignees']['Gerbe'] = []
    for flavor, qty in gerbe_items:
        data['transactions'].append({
            'id': len(data['transactions']) + 1,
            'type': 'Consignment',
            'flavor': flavor,
            'quantity': qty,
            'price': PRICE_CONSIGNMENT,
            'consignee': 'Gerbe',
            'timestamp': '2024-01-06T10:00:00',
            'paid': False
        })
        data['inventory'][flavor] -= qty
        data['consignees']['Gerbe'].append({
            'flavor': flavor,
            'quantity': qty,
            'price': PRICE_CONSIGNMENT,
            'paid': False
        })
    
    save_data(data)
    return data

def load_data():
    """Load data from JSON file"""
    if not os.path.exists(DB_FILE):
        return initialize_database()
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    """Save data to JSON file"""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def log_transaction_event(data, event_type, details):
    """Log a transaction event to the audit history"""
    if 'transaction_history' not in data:
        data['transaction_history'] = []
    
    event = {
        'id': len(data['transaction_history']) + 1,
        'event_type': event_type,
        'timestamp': datetime.now().isoformat(),
        'details': details
    }
    
    data['transaction_history'].append(event)
    return event

def calculate_financials(data):
    """Calculate all financial metrics"""
    cash_on_hand = 0
    total_receivables = 0
    total_cost_sold = 0
    personal_use_recovery = 0  # Track personal use separately
    
    BASE_COST = data.get('settings', DEFAULT_SETTINGS)['base_cost']
    
    for txn in data['transactions']:
        qty = txn['quantity']
        price = txn['price']
        cost = BASE_COST * qty
        
        if txn['type'] == 'Direct Sale':
            cash_on_hand += price * qty
            total_cost_sold += cost
        elif txn['type'] == 'Personal Use':
            personal_use_recovery += price * qty  # Track separately, not as cash
            total_cost_sold += cost
        elif txn['type'] == 'Consignment':
            if txn['paid']:
                cash_on_hand += price * qty
            else:
                total_receivables += price * qty
            total_cost_sold += cost
    
    # Calculate inventory value
    inventory_value = sum(data['inventory'].values()) * BASE_COST
    
    # Calculate net profit
    net_profit = (cash_on_hand + total_receivables + personal_use_recovery) - total_cost_sold
    
    return {
        'cash_on_hand': round_currency(cash_on_hand),
        'total_receivables': round_currency(total_receivables),
        'inventory_value': round_currency(inventory_value),
        'net_profit': round_currency(net_profit),
        'total_cost_sold': round_currency(total_cost_sold),
        'personal_use_recovery': round_currency(personal_use_recovery)
    }

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard data"""
    data = load_data()
    financials = calculate_financials(data)
    
    # Check for low stock alerts
    low_stock = [flavor for flavor, qty in data['inventory'].items() if qty < 3]
    
    return jsonify({
        'financials': financials,
        'inventory': data['inventory'],
        'low_stock': low_stock
    })

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    """Get all transactions or add new transaction"""
    data = load_data()
    
    if request.method == 'GET':
        return jsonify(data['transactions'])
    
    # POST - Add new PENDING transaction (not confirmed yet)
    txn_data = request.json
    flavor = txn_data['flavor']
    quantity = int(txn_data['quantity'])
    txn_type = txn_data['type']
    price = float(txn_data['price'])
    consignee = txn_data.get('consignee')
    
    # Validate stock
    current_stock = data['inventory'][flavor]
    if current_stock < quantity:
        return jsonify({'error': f'Out of Stock! Only {current_stock} units available.'}), 400
    
    # Create PENDING transaction
    pending_transaction = {
        'id': len(data.get('pending_transactions', [])) + 1,
        'type': txn_type,
        'flavor': flavor,
        'quantity': quantity,
        'price': price,
        'consignee': consignee,
        'timestamp': datetime.now().isoformat(),
        'status': 'pending'
    }
    
    if 'pending_transactions' not in data:
        data['pending_transactions'] = []
    
    data['pending_transactions'].append(pending_transaction)
    
    # Log event
    log_transaction_event(data, 'transaction_created', {
        'transaction_id': pending_transaction['id'],
        'type': txn_type,
        'flavor': flavor,
        'quantity': quantity,
        'price': price,
        'consignee': consignee,
        'status': 'pending'
    })
    
    save_data(data)
    
    return jsonify({
        'message': 'Transaction created and pending approval',
        'transaction': pending_transaction
    }), 201

@app.route('/api/pending-transactions', methods=['GET'])
def get_pending_transactions():
    """Get all pending transactions"""
    data = load_data()
    return jsonify(data.get('pending_transactions', []))

@app.route('/api/pending-transactions/<int:txn_id>/accept', methods=['POST'])
def accept_transaction(txn_id):
    """Accept a pending transaction"""
    data = load_data()
    
    if 'pending_transactions' not in data:
        return jsonify({'error': 'No pending transactions'}), 404
    
    # Find the pending transaction
    pending_txn = None
    for txn in data['pending_transactions']:
        if txn['id'] == txn_id:
            pending_txn = txn
            break
    
    if not pending_txn:
        return jsonify({'error': 'Transaction not found'}), 404
    
    # Validate stock again
    flavor = pending_txn['flavor']
    quantity = pending_txn['quantity']
    if data['inventory'][flavor] < quantity:
        return jsonify({'error': f'Out of Stock! Only {data["inventory"][flavor]} units available.'}), 400
    
    # Move to confirmed transactions
    confirmed_txn = {
        'id': len(data['transactions']) + 1,
        'type': pending_txn['type'],
        'flavor': pending_txn['flavor'],
        'quantity': pending_txn['quantity'],
        'price': pending_txn['price'],
        'consignee': pending_txn['consignee'],
        'timestamp': pending_txn['timestamp'],
        'confirmed_at': datetime.now().isoformat(),
        'paid': pending_txn['type'] != 'Consignment'
    }
    
    data['transactions'].append(confirmed_txn)
    data['inventory'][flavor] -= quantity
    
    # Update consignee tracking if consignment
    if pending_txn['type'] == 'Consignment' and pending_txn['consignee']:
        consignee = pending_txn['consignee']
        if consignee not in data['consignees']:
            data['consignees'][consignee] = []
        data['consignees'][consignee].append({
            'flavor': flavor,
            'quantity': quantity,
            'price': pending_txn['price'],
            'paid': False
        })
    
    # Remove from pending
    data['pending_transactions'] = [t for t in data['pending_transactions'] if t['id'] != txn_id]
    
    # Log event
    log_transaction_event(data, 'transaction_accepted', {
        'transaction_id': confirmed_txn['id'],
        'type': confirmed_txn['type'],
        'flavor': confirmed_txn['flavor'],
        'quantity': confirmed_txn['quantity'],
        'price': confirmed_txn['price'],
        'consignee': confirmed_txn['consignee']
    })
    
    save_data(data)
    return jsonify({'message': 'Transaction accepted', 'transaction': confirmed_txn})

@app.route('/api/pending-transactions/<int:txn_id>/reject', methods=['POST'])
def reject_transaction(txn_id):
    """Reject a pending transaction"""
    data = load_data()
    
    if 'pending_transactions' not in data:
        return jsonify({'error': 'No pending transactions'}), 404
    
    # Find the transaction before removing
    rejected_txn = None
    for t in data['pending_transactions']:
        if t['id'] == txn_id:
            rejected_txn = t
            break
    
    # Remove from pending
    initial_count = len(data['pending_transactions'])
    data['pending_transactions'] = [t for t in data['pending_transactions'] if t['id'] != txn_id]
    
    if len(data['pending_transactions']) == initial_count:
        return jsonify({'error': 'Transaction not found'}), 404
    
    # Log event
    if rejected_txn:
        log_transaction_event(data, 'transaction_rejected', {
            'transaction_id': rejected_txn['id'],
            'type': rejected_txn['type'],
            'flavor': rejected_txn['flavor'],
            'quantity': rejected_txn['quantity'],
            'price': rejected_txn['price'],
            'consignee': rejected_txn.get('consignee')
        })
    
    save_data(data)
    return jsonify({'message': 'Transaction rejected and deleted'})

@app.route('/api/transactions/<int:txn_id>', methods=['DELETE'])
def delete_transaction(txn_id):
    """Delete a confirmed transaction and restore inventory"""
    data = load_data()
    
    # Find the transaction
    transaction = None
    for txn in data['transactions']:
        if txn['id'] == txn_id:
            transaction = txn
            break
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    # Restore inventory
    flavor = transaction['flavor']
    quantity = transaction['quantity']
    data['inventory'][flavor] += quantity
    
    # Remove from consignee tracking if consignment
    if transaction['type'] == 'Consignment' and transaction.get('consignee'):
        consignee = transaction['consignee']
        if consignee in data['consignees']:
            # Remove the specific item
            data['consignees'][consignee] = [
                item for item in data['consignees'][consignee]
                if not (item['flavor'] == flavor and item['quantity'] == quantity)
            ]
            # Remove consignee if no items left
            if not data['consignees'][consignee]:
                del data['consignees'][consignee]
    
    # Remove transaction
    data['transactions'] = [t for t in data['transactions'] if t['id'] != txn_id]
    
    # Log event
    log_transaction_event(data, 'transaction_deleted', {
        'transaction_id': txn_id,
        'type': transaction['type'],
        'flavor': flavor,
        'quantity': quantity,
        'price': transaction['price'],
        'consignee': transaction.get('consignee'),
        'inventory_restored': True
    })
    
    save_data(data)
    return jsonify({
        'message': 'Transaction deleted and inventory restored',
        'restored': {'flavor': flavor, 'quantity': quantity}
    })

@app.route('/api/consignees', methods=['GET'])
def get_consignees():
    """Get consignee debt summary"""
    data = load_data()
    summary = {}
    
    for name, items in data['consignees'].items():
        total_debt = sum(item['quantity'] * item['price'] for item in items if not item['paid'])
        unpaid_items = [item for item in items if not item['paid']]
        summary[name] = {
            'total_debt': round_currency(total_debt),
            'items': unpaid_items
        }
    
    return jsonify(summary)

@app.route('/api/consignees/<name>/pay', methods=['POST'])
def mark_consignee_paid(name):
    """Mark a consignee's debt as paid"""
    data = load_data()
    
    if name not in data['consignees']:
        return jsonify({'error': 'Consignee not found'}), 404
    
    # Mark all items as paid
    for item in data['consignees'][name]:
        item['paid'] = True
    
    # Calculate total paid
    total_paid = sum(item['quantity'] * item['price'] for item in data['consignees'][name] if not item['paid'])
    
    # Update transactions
    for txn in data['transactions']:
        if txn['consignee'] == name and not txn['paid']:
            txn['paid'] = True
    
    # Log event
    log_transaction_event(data, 'consignee_full_payment', {
        'consignee': name,
        'amount': round_currency(total_paid),
        'payment_type': 'full'
    })
    
    save_data(data)
    return jsonify({'message': f'{name} marked as paid'})

@app.route('/api/consignees/<name>/partial-pay', methods=['POST'])
def partial_payment(name):
    """Record a partial payment for a consignee"""
    data = load_data()
    
    if name not in data['consignees']:
        return jsonify({'error': 'Consignee not found'}), 404
    
    payment_data = request.json
    amount = float(payment_data.get('amount', 0))
    selected_items = payment_data.get('selected_items', [])  # List of item indices
    
    if amount <= 0:
        return jsonify({'error': 'Payment amount must be greater than 0'}), 400
    
    # Calculate total debt
    total_debt = sum(item['quantity'] * item['price'] for item in data['consignees'][name] if not item['paid'])
    
    if amount > total_debt:
        return jsonify({'error': f'Payment amount (₱{amount:.2f}) exceeds total debt (₱{total_debt:.2f})'}), 400
    
    # Initialize payment tracking if not exists
    if 'payments' not in data:
        data['payments'] = {}
    if name not in data['payments']:
        data['payments'][name] = []
    
    # Record the payment
    payment_record = {
        'amount': round_currency(amount),
        'timestamp': datetime.now().isoformat(),
        'remaining_debt': round_currency(total_debt - amount),
        'items_paid': []
    }
    
    # If specific items are selected, pay those first
    remaining_payment = amount
    
    if selected_items:
        # Pay selected items first
        for idx in selected_items:
            if idx < len(data['consignees'][name]) and remaining_payment > 0:
                item = data['consignees'][name][idx]
                if not item['paid']:
                    item_total = item['quantity'] * item['price']
                    partial_paid = item.get('partial_payment', 0)
                    item_remaining = item_total - partial_paid
                    
                    if remaining_payment >= item_remaining:
                        # Fully pay this item
                        item['paid'] = True
                        remaining_payment -= item_remaining
                        payment_record['items_paid'].append({
                            'flavor': item['flavor'],
                            'quantity': item['quantity'],
                            'amount': item_remaining,
                            'status': 'fully_paid'
                        })
                        
                        # Update corresponding transaction
                        for txn in data['transactions']:
                            if (txn['consignee'] == name and 
                                txn['flavor'] == item['flavor'] and 
                                txn['quantity'] == item['quantity'] and
                                not txn['paid']):
                                txn['paid'] = True
                                break
                    else:
                        # Partial payment for this item
                        if 'partial_payment' not in item:
                            item['partial_payment'] = 0
                        item['partial_payment'] += remaining_payment
                        payment_record['items_paid'].append({
                            'flavor': item['flavor'],
                            'quantity': item['quantity'],
                            'amount': remaining_payment,
                            'status': 'partially_paid'
                        })
                        remaining_payment = 0
    else:
        # No specific items selected, pay proportionally (FIFO)
        for item in data['consignees'][name]:
            if not item['paid'] and remaining_payment > 0:
                item_total = item['quantity'] * item['price']
                partial_paid = item.get('partial_payment', 0)
                item_remaining = item_total - partial_paid
                
                if remaining_payment >= item_remaining:
                    # Fully pay this item
                    item['paid'] = True
                    remaining_payment -= item_remaining
                    payment_record['items_paid'].append({
                        'flavor': item['flavor'],
                        'quantity': item['quantity'],
                        'amount': item_remaining,
                        'status': 'fully_paid'
                    })
                    
                    # Update corresponding transaction
                    for txn in data['transactions']:
                        if (txn['consignee'] == name and 
                            txn['flavor'] == item['flavor'] and 
                            txn['quantity'] == item['quantity'] and
                            not txn['paid']):
                            txn['paid'] = True
                            break
                else:
                    # Partial payment for this item
                    if 'partial_payment' not in item:
                        item['partial_payment'] = 0
                    item['partial_payment'] += remaining_payment
                    payment_record['items_paid'].append({
                        'flavor': item['flavor'],
                        'quantity': item['quantity'],
                        'amount': remaining_payment,
                        'status': 'partially_paid'
                    })
                    remaining_payment = 0
    
    data['payments'][name].append(payment_record)
    
    # Log event
    log_transaction_event(data, 'consignee_partial_payment', {
        'consignee': name,
        'amount': round_currency(amount),
        'remaining_debt': round_currency(total_debt - amount),
        'payment_type': 'partial',
        'items_paid': payment_record['items_paid']
    })
    
    save_data(data)
    
    return jsonify({
        'message': f'Partial payment of ₱{amount:.2f} recorded for {name}',
        'remaining_debt': round_currency(total_debt - amount),
        'payment_record': payment_record
    })

@app.route('/api/consignees/<name>/payments', methods=['GET'])
def get_payment_history(name):
    """Get payment history for a consignee"""
    data = load_data()
    
    if name not in data['consignees']:
        return jsonify({'error': 'Consignee not found'}), 404
    
    payments = data.get('payments', {}).get(name, [])
    return jsonify(payments)

@app.route('/api/export', methods=['GET'])
def export_excel():
    """Export data to Excel"""
    data = load_data()
    
    # Sheet 1: Inventory
    inventory_data = []
    for flavor in FLAVORS:
        initial = INITIAL_STOCK
        remaining = data['inventory'][flavor]
        
        # Calculate sold, consigned, personal
        sold = sum(t['quantity'] for t in data['transactions'] 
                  if t['flavor'] == flavor and t['type'] == 'Direct Sale')
        consigned = sum(t['quantity'] for t in data['transactions'] 
                       if t['flavor'] == flavor and t['type'] == 'Consignment')
        personal = sum(t['quantity'] for t in data['transactions'] 
                      if t['flavor'] == flavor and t['type'] == 'Personal Use')
        
        status = 'Low Stock' if remaining < 3 else 'OK'
        
        inventory_data.append({
            'Flavor': flavor,
            'Initial': initial,
            'Sold': sold,
            'Consigned': consigned,
            'Personal': personal,
            'Remaining': remaining,
            'Status': status
        })
    
    df_inventory = pd.DataFrame(inventory_data)
    
    # Sheet 2: Financials
    financials = calculate_financials(data)
    df_financials = pd.DataFrame([
        {'Metric': 'Cash on Hand', 'Value (₱)': financials['cash_on_hand']},
        {'Metric': 'Total Receivables', 'Value (₱)': financials['total_receivables']},
        {'Metric': 'Inventory Value', 'Value (₱)': financials['inventory_value']},
        {'Metric': 'Total Cost Sold', 'Value (₱)': financials['total_cost_sold']},
        {'Metric': 'Net Profit', 'Value (₱)': financials['net_profit']}
    ])
    
    # Sheet 3: Consignees
    consignee_data = []
    for name, items in data['consignees'].items():
        for item in items:
            consignee_data.append({
                'Consignee': name,
                'Flavor': item['flavor'],
                'Quantity': item['quantity'],
                'Price (₱)': item['price'],
                'Total (₱)': round_currency(item['quantity'] * item['price']),
                'Paid': 'Yes' if item['paid'] else 'No'
            })
    
    df_consignees = pd.DataFrame(consignee_data)
    
    # Write to Excel
    filename = 'Vape_Business_Data.xlsx'
    with pd.ExcelWriter(filename, engine='xlsxwriter') as writer:
        df_inventory.to_excel(writer, sheet_name='Inventory', index=False)
        df_financials.to_excel(writer, sheet_name='Financials', index=False)
        df_consignees.to_excel(writer, sheet_name='Consignees', index=False)
    
    return send_file(filename, as_attachment=True)

@app.route('/api/reset', methods=['POST'])
def reset_database():
    """Reset database to initial state"""
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    initialize_database()
    return jsonify({'message': 'Database reset successfully'})

@app.route('/api/settings', methods=['GET', 'PUT'])
def handle_settings():
    """Get or update settings"""
    data = load_data()
    
    if request.method == 'GET':
        return jsonify(data.get('settings', DEFAULT_SETTINGS))
    
    # PUT - Update settings
    new_settings = request.json
    data['settings'] = new_settings
    save_data(data)
    return jsonify({'message': 'Settings updated successfully', 'settings': new_settings})

@app.route('/api/consignment/bulk', methods=['POST'])
def add_bulk_consignment():
    """Add bulk consignment for multiple flavors"""
    data = load_data()
    bulk_data = request.json
    
    consignee = bulk_data['consignee']
    items = bulk_data['items']  # Array of {flavor, quantity, price}
    
    if not consignee.strip():
        return jsonify({'error': 'Consignee name is required'}), 400
    
    # Validate all items first
    for item in items:
        flavor = item['flavor']
        quantity = int(item['quantity'])
        
        if data['inventory'][flavor] < quantity:
            return jsonify({
                'error': f'Out of Stock! {flavor} only has {data["inventory"][flavor]} units available.'
            }), 400
    
    # Process all items
    added_items = []
    for item in items:
        flavor = item['flavor']
        quantity = int(item['quantity'])
        price = float(item['price'])
        
        # Create transaction
        transaction = {
            'id': len(data['transactions']) + 1,
            'type': 'Consignment',
            'flavor': flavor,
            'quantity': quantity,
            'price': price,
            'consignee': consignee,
            'timestamp': datetime.now().isoformat(),
            'paid': False
        }
        
        data['transactions'].append(transaction)
        data['inventory'][flavor] -= quantity
        
        # Update consignee tracking
        if consignee not in data['consignees']:
            data['consignees'][consignee] = []
        
        data['consignees'][consignee].append({
            'flavor': flavor,
            'quantity': quantity,
            'price': price,
            'paid': False
        })
        
        added_items.append({
            'flavor': flavor,
            'quantity': quantity,
            'price': price,
            'total': round_currency(quantity * price)
        })
    
    # Log event
    log_transaction_event(data, 'bulk_consignment_added', {
        'consignee': consignee,
        'items_count': len(items),
        'items': added_items,
        'total': round_currency(sum(item['total'] for item in added_items))
    })
    
    save_data(data)
    
    return jsonify({
        'message': f'Successfully added {len(items)} items for {consignee}',
        'items': added_items,
        'total': round_currency(sum(item['total'] for item in added_items))
    }), 201

@app.route('/api/transaction-history', methods=['GET'])
def get_transaction_history():
    """Get complete transaction history/audit log"""
    data = load_data()
    history = data.get('transaction_history', [])
    
    # Get filter parameters
    event_type = request.args.get('event_type')
    consignee = request.args.get('consignee')
    limit = request.args.get('limit', type=int)
    
    # Apply filters
    filtered_history = history
    
    if event_type:
        filtered_history = [h for h in filtered_history if h['event_type'] == event_type]
    
    if consignee:
        filtered_history = [h for h in filtered_history 
                          if h['details'].get('consignee') == consignee]
    
    # Sort by newest first
    filtered_history = sorted(filtered_history, key=lambda x: x['timestamp'], reverse=True)
    
    # Apply limit
    if limit:
        filtered_history = filtered_history[:limit]
    
    return jsonify(filtered_history)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
