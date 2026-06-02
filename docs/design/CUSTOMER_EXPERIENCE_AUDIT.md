# Customer Experience Audit

Generated: 2026-06-01

## Verdict

Customer tracking is the strongest external-facing demo. It is still not a real customer experience because there is no real tracking identity, no order lookup, no real carrier route, no delivery event history and no customer notification preference.

## Current Strengths

- Clear ETA panel.
- Privacy note exists.
- Stops are anonymized.
- Support label/phone visible.
- Live simulated movement is understandable.
- Customer can see delivery status without admin context.

## Missing Customer Requirements

- Real tracking code lookup.
- Delivery address confirmation.
- Delivery date and window.
- Carrier/driver context policy.
- Status history.
- Failed delivery resolution path.
- Support escalation.
- Localization.
- Accessibility status messages.
- Notification opt-in/out.

Baymard's order-tracking research identifies the need to keep tracking details in the product experience instead of dumping users into third-party dead ends, and to provide key tracking details users need after purchase.

Reference: https://baymard.com/blog/integrate-tracking-info

## Risk

The demo can create trust visually, then break trust operationally if sold as real tracking before backend exists.

## Required Tasks

| Priority | Task | Acceptance |
|---|---|---|
| P1 | Real tracking token route | Customer can open `/track/:token` without login |
| P1 | DB-backed delivery status | Status history survives reload |
| P1 | Support escalation | Customer issue creates tenant-scoped ticket |
| P2 | Notification preferences | SMS/email/WhatsApp placeholders are explicit |
| P2 | Accessibility states | ETA/status updates use accessible status messaging |
