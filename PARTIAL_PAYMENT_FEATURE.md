# Partial Payment Feature

## Overview
Added the ability for consignees to make partial payments instead of paying the full debt at once.

## Features Implemented

### 1. Backend API Endpoints

#### POST `/api/consignees/<name>/partial-pay`
Records a partial payment for a consignee.

**Request Body:**
```json
{
  "amount": 1000.00
}
```

**Response:**
```json
{
  "message": "Partial payment of ₱1000.00 recorded for KJ",
  "remaining_debt": 14000.00,
  "payment_record": {
    "amount": 1000.00,
    "timestamp": "2026-02-06T18:00:00",
    "remaining_debt": 14000.00
  }
}
```

**Features:**
- Validates payment amount (must be > 0)
- Prevents overpayment (amount cannot exceed total debt)
- Automatically marks items as paid proportionally
- Records payment history
- Updates transactions accordingly

#### GET `/api/consignees/<name>/payments`
Retrieves payment history for a consignee.

**Response:**
```json
[
  {
    "amount": 1000.00,
    "timestamp": "2026-02-06T18:00:00",
    "remaining_debt": 14000.00
  },
  {
    "amount": 500.00,
    "timestamp": "2026-02-07T10:00:00",
    "remaining_debt": 13500.00
  }
]
```

### 2. Frontend UI Components

#### Partial Payment Button
- New "💵 Partial Payment" button next to "✅ Mark as Paid"
- Orange gradient styling to differentiate from full payment

#### Partial Payment Form
- Input field for entering payment amount
- ✅ Confirm button (green)
- ❌ Cancel button (red)
- Validates input before submission

#### Payment History
- "📜 Payment History" button to view past payments
- Shows:
  - Payment date
  - Payment amount (green)
  - Remaining debt after payment (yellow)

#### Partial Payment Indicator
- Items show "(Paid: ₱XXX.XX)" if partially paid
- Green text to indicate partial payment status

### 3. Payment Logic

**How Partial Payments Work:**

1. **User enters amount** (e.g., ₱1000)
2. **System validates:**
   - Amount must be > 0
   - Amount cannot exceed total debt
3. **System applies payment proportionally:**
   - Pays off complete items first (FIFO - First In, First Out)
   - Remaining amount applied to next item as partial payment
4. **System records:**
   - Payment amount
   - Timestamp
   - Remaining debt after payment
5. **System updates:**
   - Marks fully paid items as "paid"
   - Tracks partial payments on items
   - Updates corresponding transactions

**Example:**

Consignee has 3 items:
- Item A: ₱500
- Item B: ₱700
- Item C: ₱800
- **Total Debt: ₱2000**

**Payment of ₱1000:**
- Item A: Fully paid (₱500)
- Item B: Partially paid (₱500 of ₱700)
- Item C: Unpaid
- **Remaining Debt: ₱1000**

### 4. UI/UX Features

**Visual Indicators:**
- Orange "Partial Payment" button
- Green "Confirm" button
- Red "Cancel" button
- Blue "Payment History" button
- Green partial payment indicators on items
- Payment history with color-coded amounts

**User Flow:**
1. Click "💵 Partial Payment"
2. Enter amount in input field
3. Click "✅ Confirm" or "❌ Cancel"
4. See toast notification with result
5. View updated debt amount
6. Optionally view payment history

**Validation:**
- Empty amount → Error toast
- Zero or negative → Error toast
- Exceeds debt → Error toast with details
- Valid amount → Success toast with confirmation

### 5. Data Structure

**Payment Record:**
```json
{
  "payments": {
    "KJ": [
      {
        "amount": 1000.00,
        "timestamp": "2026-02-06T18:00:00",
        "remaining_debt": 14000.00
      }
    ]
  }
}
```

**Item with Partial Payment:**
```json
{
  "flavor": "Mango",
  "quantity": 5,
  "price": 250,
  "paid": false,
  "partial_payment": 500.00
}
```

## Benefits

1. **Flexibility:** Consignees can pay in installments
2. **Tracking:** Complete payment history for each consignee
3. **Transparency:** Clear indication of partial payments
4. **Accuracy:** Automatic calculation of remaining debt
5. **User-Friendly:** Simple interface with clear feedback

## Files Modified

### Backend:
- `app.py` - Added partial payment endpoints and logic

### Frontend:
- `frontend/src/components/ConsigneeTracker.js` - Added UI components
- `frontend/src/components/ConsigneeTracker.css` - Added styling

## Testing Checklist

- [x] Partial payment button appears for consignees with debt
- [x] Input form shows/hides correctly
- [x] Amount validation works
- [x] Overpayment prevention works
- [x] Payment applies proportionally to items
- [x] Payment history displays correctly
- [x] Toast notifications show for all actions
- [x] Remaining debt updates correctly
- [x] Partial payment indicators show on items
- [x] Full payment button still works
- [x] Data persists across sessions

## Usage Example

**Scenario:** KJ owes ₱15,000 for 60 units

**Step 1:** Click "💵 Partial Payment"
**Step 2:** Enter ₱5,000
**Step 3:** Click "✅ Confirm"
**Result:** 
- Toast: "Partial payment of ₱5,000.00 recorded for KJ"
- Remaining debt: ₱10,000
- Some items marked as fully paid
- Payment recorded in history

**Step 4:** Click "📜 Payment History"
**Result:** Shows payment of ₱5,000 with remaining debt

## Future Enhancements (Optional)

- Export payment history to Excel
- Set payment due dates
- Send payment reminders
- Payment receipts/invoices
- Multiple payment methods tracking
- Payment notes/comments
