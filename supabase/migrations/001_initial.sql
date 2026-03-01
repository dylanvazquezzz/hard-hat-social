-- Contractors Connect — Initial Schema
-- Run this in your Supabase SQL editor or via the Supabase CLI

-- ============================================================
-- TABLES
-- ============================================================

create table contractors (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users,
  full_name         text not null,
  trade             text not null,
  specialties       text[] default '{}',
  location_city     text not null,
  location_state    text not null,
  years_experience  integer not null,
  bio               text,
  phone             text not null,
  email             text not null,
  website           text,
  profile_photo_url text,
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz default timezone('utc', now())
);

create table certifications (
  id              uuid primary key default gen_random_uuid(),
  contractor_id   uuid references contractors(id) on delete cascade,
  name            text not null,
  issuing_body    text not null,
  cert_number     text,
  expiry_date     date,
  verified        boolean default false,
  document_url    text not null
);

create table applications (
  id                uuid primary key default gen_random_uuid(),
  submitted_at      timestamptz default timezone('utc', now()),
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  full_name         text not null,
  trade             text not null,
  specialties       text[] default '{}',
  location_city     text not null,
  location_state    text not null,
  years_experience  integer not null,
  bio               text,
  phone             text not null,
  email             text not null,
  website           text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table contractors   enable row level security;
alter table certifications enable row level security;
alter table applications   enable row level security;

-- Helper: check if current user is an approved contractor
create or replace function is_approved_contractor()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from contractors
    where user_id = auth.uid()
    and   status  = 'approved'
  );
$$;

-- ---- contractors ----

-- Public: view approved contractor profiles (no contact info)
-- Contact info (phone/email) visibility is enforced at the app layer for MVP.
-- Upgrade: create a view that conditionally exposes columns based on auth state.
create policy "Public can view approved contractors"
  on contractors for select
  using (status = 'approved');

-- Contractors can insert/update their own row
create policy "Contractors can insert their profile"
  on contractors for insert
  with check (auth.uid() = user_id);

create policy "Contractors can update their own profile"
  on contractors for update
  using (auth.uid() = user_id);

-- ---- certifications ----

create policy "Public can view certifications for approved contractors"
  on certifications for select
  using (
    exists (
      select 1 from contractors c
      where c.id = certifications.contractor_id
      and   c.status = 'approved'
    )
  );

-- ---- applications ----

-- Anyone can submit an application
create policy "Anyone can submit an application"
  on applications for insert
  with check (true);

-- Applicant can view their own submission
create policy "Applicants can view their own application"
  on applications for select
  using (email = (select email from auth.users where id = auth.uid()));

-- ============================================================
-- INDEXES
-- ============================================================

create index contractors_status_idx      on contractors (status);
create index contractors_trade_idx       on contractors (trade);
create index contractors_state_idx       on contractors (location_state);
create index applications_status_idx     on applications (status);
