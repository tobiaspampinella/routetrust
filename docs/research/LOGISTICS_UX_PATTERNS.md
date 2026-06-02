# Logistics UX Patterns

Generated: 2026-06-01

## Core Patterns

## Control Tower

Show:

- active routes
- delayed routes
- drivers active/paused/offline
- failed deliveries
- SLA risk
- close-time projection
- incidents
- approvals pending

Avoid:

- purely decorative map panels
- hidden data provenance
- AI claims without approval trail

## Driver Execution

Show:

- next stop
- address/reference
- ETA window
- route risk
- remaining stops
- clear action buttons
- fail/pause/incident reasons

Required backend:

- delivery event ledger
- route assignment
- driver session
- offline/retry policy

## Customer Tracking

Show:

- tracking code
- delivery status
- ETA or delivery window
- destination summary
- support contact
- privacy statement
- status history

Reference: https://baymard.com/blog/integrate-tracking-info

## Incident Management

Show:

- severity
- owner
- route/stop affected
- SLA impact
- decision required
- audit trail

## Approval Workflow

Show:

- requested change
- risk reason
- affected route/customer/SLA
- approving role
- decision history

## KPI Dashboard

Show:

- completion rate
- failure rate
- routes at risk
- ETA confidence
- SLA projection
- driver productivity
- daily close estimate

All KPI cards must declare whether they are live, simulated, stale or demo.
