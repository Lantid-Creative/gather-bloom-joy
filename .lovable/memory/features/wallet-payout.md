---
name: Organizer wallet & payout system
description: 10% inclusive platform fee, 7-day hold, Stripe Connect auto-payout on admin approval
type: feature
---
- Platform fee: 10% inclusive (covers Stripe 2.9%+30¢ + Qantid margin ~6.8%)
- Organizer receives 90% of ticket price
- Funds held 7 days after purchase before becoming available
- **Stripe Connect**: organizers onboard as Express connected accounts
- Organizer requests withdrawal → admin approves → Stripe Transfer auto-sends funds
- No manual bank transfers needed; Stripe handles disbursement
- Tables: organizer_wallets (has stripe_account_id, stripe_onboarding_complete), wallet_transactions, withdrawal_requests
- Edge functions: process-withdrawal, stripe-connect (onboard/check-status/dashboard)
- verify-payment credits organizer wallet automatically on confirmed orders
- Dashboard route: /dashboard/wallet
