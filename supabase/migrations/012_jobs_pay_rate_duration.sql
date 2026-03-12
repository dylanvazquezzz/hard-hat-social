-- Migration 012: Add pay_rate and duration columns to jobs table
-- S03 — Job Posting UX Overhaul
-- pay_rate: free text e.g. "$45/hr", "$800/day", "Negotiable"
-- duration: free text e.g. "2 weeks", "3 months", "Ongoing"

alter table jobs
  add column if not exists pay_rate text,
  add column if not exists duration text;
