---
name: Organizer wallet & payout system
description: 10% inclusive platform fee, 7-day hold, Paystack auto-payout on admin approval — no organizer signup needed
type: feature
---
- Platform fee: 10% inclusive (covers payment processing + Qantid margin)
- Organizer receives 90% of ticket price
- Funds held 7 days after purchase before becoming available
- **Paystack Transfers**: organizers just add Nigerian bank details (bank name, account number, bank code)
- Admin approves withdrawal → Paystack creates transfer recipient + initiates transfer automatically
- No organizer signup or onboarding needed — just bank details
- Tables: organizer_wallets, wallet_transactions, withdrawal_requests
- Edge function: process-withdrawal (handles request/approve/reject with Paystack auto-payout)
- verify-payment credits organizer wallet automatically on confirmed orders
- Dashboard route: /dashboard/wallet
- Currency: NGN (₦)
