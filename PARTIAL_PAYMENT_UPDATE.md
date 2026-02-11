# Partial Payment Feature - Item Selection Update

## New Enhancement: Select Specific Items to Pay

### Overview
Updated the partial payment feature to allow users to select specific juice items that have been sold, giving more control over which items to mark as paid.

## New Features

### 1. Item Selection Interface

**Visual Selection List:**
- Checkbox-based selection for each unpaid item
- Shows flavor name, quantity, and remaining amount
- Click anywhere on the item to select/deselect
- Selected items are highlighted with blue glow
- Scrollable list for many items

**Selected Total Display:**
- Shows total amount of selected items
- Updates in real-time as items are selected
- Yellow highlight for visibility

### 2. Smart Payment Logic

**Two Payment Modes:**

#### Mode 1: Selected Items (Priority)
When items are selected:
1. Payment applies to selected items first
2. Pays items in the order they were selected
3. Can fully or partially pay selected items
4. Remaining payment applies to other items (if any)

#### Mode 2: Auto (FIFO)
When no items are selected:
1. Payment applies automatically (First In, First Out)
2. Pays oldest items first
3. Same behavior as before

### 3. Enhanced Payment Record

**Payment History Now Includes:**
```json
{
  "amount": 1000.00,
  "timestamp": "2026-02-06T18:00:00",
  "remaining_debt": 14000.00,
  "items_paid": [
    {
      "flavor": "Mango",
      "quantity": 5,
      "amount": 500.00,
      "status": "fully_paid"
    },
    {
      "flavor": "Grapes",
      "quantity": 3,
      "amount": 500.00,
      "status": "partially_paid"
    }
  ]
}
```

## User Interface

### Partial Payment Form Layout:

```
┌─────────────────────────────────────┐
│ Select Items Sold:                  │
│                                     │
│ ☑ Mango (x5)           ₱1,250.00   │
│ ☑ Grapes (x3)          ₱750.00     │
│ ☐ Lemon Cola (x2)      ₱500.00     │
│ ☐ Yakult (x4)          ₱1,000.00   │
│                                     │
│ Selected Total: ₱2,000.00           │
│                                     │
│ [Enter payment amount: _______]     │
│                                     │
│ [✅ Confirm Payment] [❌ Cancel]    │
└─────────────────────────────────────┘
```

### Visual Indicators:

- **Unselected Item**: Gray background, light blue border
- **Hovered Item**: Slightly brighter background
- **Selected Item**: Blue background with glow effect
- **Selected Total**: Yellow box showing total of selected items

## Usage Examples

### Example 1: Pay Specific Items

**Scenario:** KJ sold 2 Mango and 1 Grapes

**Steps:**
1. Click "💵 Partial Payment"
2. Select "Mango (x5)" from list
3. Select "Grapes (x3)" from list
4. See "Selected Total: ₱2,000.00"
5. Enter amount: 2000
6. Click "✅ Confirm Payment"

**Result:**
- Mango: Fully paid (₱1,250)
- Grapes: Fully paid (₱750)
- Other items: Unchanged

### Example 2: Partial Payment on Selected Item

**Scenario:** KJ sold 2 Mango but only paid ₱500

**Steps:**
1. Click "💵 Partial Payment"
2. Select "Mango (x5)" (Total: ₱1,250)
3. Enter amount: 500
4. Click "✅ Confirm Payment"

**Result:**
- Mango: Partially paid (₱500 of ₱1,250)
- Shows "(Paid: ₱500.00)" on Mango item
- Remaining debt updated

### Example 3: No Selection (Auto Mode)

**Scenario:** General payment without specific items

**Steps:**
1. Click "💵 Partial Payment"
2. Don't select any items
3. Enter amount: 1000
4. Click "✅ Confirm Payment"

**Result:**
- Payment applies automatically (FIFO)
- Oldest items paid first
- Same as previous behavior

## Benefits

1. **Accuracy**: Pay exactly what was sold
2. **Flexibility**: Choose which items to pay
3. **Transparency**: Clear selection and totals
4. **Control**: User decides payment order
5. **Tracking**: Detailed payment records per item

## Technical Implementation

### Backend Changes:
- Added `selected_items` parameter to API
- Enhanced payment logic to prioritize selected items
- Added `items_paid` array to payment records
- Tracks which items were paid in each transaction

### Frontend Changes:
- Added item selection checkboxes
- Added `selectedItems` state management
- Added `toggleItemSelection` function
- Added `calculateSelectedTotal` function
- Enhanced UI with selection indicators
- Added CSS for selectable items

## Files Modified

### Backend:
- `app.py` - Updated `/api/consignees/<name>/partial-pay` endpoint

### Frontend:
- `frontend/src/components/ConsigneeTracker.js` - Added selection UI
- `frontend/src/components/ConsigneeTracker.css` - Added selection styles

## Testing Checklist

- [x] Item selection checkboxes work
- [x] Multiple items can be selected
- [x] Selected total calculates correctly
- [x] Payment applies to selected items first
- [x] Partial payment on selected items works
- [x] Full payment on selected items works
- [x] Auto mode (no selection) still works
- [x] Payment history shows items paid
- [x] Visual feedback for selection
- [x] Cancel clears selection
- [x] Toast notifications work
- [x] Remaining debt updates correctly

## Future Enhancements

- Add "Select All" button
- Add "Clear Selection" button
- Show quantity selector per item
- Add notes per payment
- Export payment details
- Print payment receipts
