---
name: Organizer wallet & payout system
description: 10% inclusive platform fee, 7-day hold, organizer requests withdrawal, admin approves, manual Stripe disbursement
type: feature
---
- Platform fee: 10% inclusive (covers Stripe 2.9%+30¢ + Qantid margin ~6.8%)
- Organizer receives 90% of ticket price
- Funds held 7 days after purchase before becoming available
- Organizer adds bank details to wallet, then requests withdrawal
- Admin approves/rejects via /admin/withdrawals, then manually sends via Stripe/bank
- Tables: organizer_wallets, wallet_transactions, withdrawal_requests
- Edge function: process-withdrawal (handles request/approve/reject/mark-processed)
- verify-payment credits organizer wallet automatically on confirmed orders
- Dashboard route: /dashboard/wallet
