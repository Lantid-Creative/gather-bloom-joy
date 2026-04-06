---
name: Organizer wallet & payout system
description: 10% inclusive platform fee, 7-day hold, Paystack auto-payout on admin approval — multi-currency support matching event currency
type: feature
---
- Platform fee: 10% inclusive (covers payment processing + Qantid margin)
- Organizer receives 90% of ticket price
- Funds held 7 days after purchase before becoming available
- **Multi-currency**: wallet currency set from first event's currency; transactions & withdrawals track currency
- **Paystack Transfers**: organizers add bank details (bank name, account number, bank code)
- Paystack recipient types by currency: NGN→nuban, GHS→ghipss, ZAR→basa, KES→mobile_money
- Admin approves withdrawal → Paystack creates transfer recipient + initiates transfer automatically
- No organizer signup or onboarding needed — just bank details
- Tables: organizer_wallets (with currency), wallet_transactions (with currency), withdrawal_requests (with currency)
- Edge function: process-withdrawal (handles request/approve/reject with Paystack auto-payout)
- verify-payment credits organizer wallet automatically on confirmed orders, using event's currency
- Dashboard route: /dashboard/wallet
- Frontend uses getCurrencySymbol() for dynamic display
