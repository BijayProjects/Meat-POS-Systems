# Security Specification - MeatMaster POS

## Data Invariants
1. **Sales Integrity**: A sale record cannot be modified after creation. Total must match the sum of item prices.
2. **Stock Consistency**: Only sales can decrement stock, and only authenticated owners can manually adjust stock.
3. **Expense Identity**: Expenses must be linked to the creator's UID (if we support multi-user later, but for single shop it's the admin).
4. **Product Control**: Only authenticated users with admin privileges (verified email) can create or modify products.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Sale)**: Create a sale with a different `userId` (if field exists) or spoof total.
2. **Identity Spoofing (Expense)**: Create an expense by non-authenticated user.
3. **Privilege Escalation**: Attempt to delete a product without being an admin.
4. **Field Poisoning (Product)**: Update a product with a 1MB name string.
5. **Field Poisoning (Sale)**: Create a sale with negative total.
6. **Immutable Violation**: Attempt to update an existing sale's total.
7. **Type Mismatch (Expense)**: Set amount as a string "100" instead of number 100.
8. **Negative Stock**: Set product stock to -50.
9. **Orphaned Sale**: Create a sale item with a non-existent product ID.
10. **Shadow Field**: Add `isVerified: true` to a Sale document.
11. **Spam Collection**: Rapidly create hundreds of empty expense records.
12. **Unauthorized Read**: Attempt to read private admin settings (if we had any).

## Testing Strategy
All payloads above must return `PERMISSION_DENIED`.
