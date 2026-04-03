-- 014_seed_atlanta_contractors.sql
-- Seed 8 Atlanta-area verified contractors with certifications and posts.
-- Profile photos are already uploaded to storage bucket avatars/seed/.
-- Posts reference the existing dylan user_id for FK compliance.

DO $$
DECLARE
  storage_base TEXT := 'https://pzjommfcglozzuskubnl.supabase.co/storage/v1/object/public/avatars/seed';
  dylan_user_id UUID := 'd0f8b8b6-52de-430d-b00a-d06706e188a4'; -- existing real user for post FK

  -- Contractor IDs
  c1 UUID := 'a1000001-0000-0000-0000-000000000001';
  c2 UUID := 'a1000001-0000-0000-0000-000000000002';
  c3 UUID := 'a1000001-0000-0000-0000-000000000003';
  c4 UUID := 'a1000001-0000-0000-0000-000000000004';
  c5 UUID := 'a1000001-0000-0000-0000-000000000005';
  c6 UUID := 'a1000001-0000-0000-0000-000000000006';
  c7 UUID := 'a1000001-0000-0000-0000-000000000007';
  c8 UUID := 'a1000001-0000-0000-0000-000000000008';

BEGIN

-- ─── Contractors ────────────────────────────────────────────────────────────

INSERT INTO contractors
  (id, user_id, full_name, trade, specialties, location_city, location_state,
   years_experience, bio, phone, email, website, profile_photo_url, status, created_at)
VALUES
  -- 1. Welder
  (c1, NULL, 'Travis Holden', 'Welding',
   ARRAY['Structural Steel', 'TIG Welding', 'Pipe Welding'],
   'Atlanta', 'GA', 12,
   'AWS-certified structural welder with 12 years on commercial builds around metro Atlanta. I specialize in high-rise steel and industrial pipe systems. Never missed a deadline.',
   '(404) 555-0191', 'travis.holden@email.com', NULL,
   storage_base || '/instagram-bearded_selfie-8.7.19.png',
   'approved', NOW() - INTERVAL '45 days'),

  -- 2. Electrician
  (c2, NULL, 'Jerome Batts', 'Electrical',
   ARRAY['Commercial Wiring', 'Panel Upgrades', 'Low Voltage'],
   'Marietta', 'GA', 9,
   'Licensed master electrician based in Marietta. Mostly commercial tenant improvements and new construction. I run a tight crew of 3 and we are available for subcontract work throughout Fulton and Cobb counties.',
   '(770) 555-0247', 'jerome.batts@email.com', NULL,
   storage_base || '/Bx-yKeXCQAA0KgK.jpg',
   'approved', NOW() - INTERVAL '38 days'),

  -- 3. HVAC
  (c3, NULL, 'Ray Okafor', 'HVAC',
   ARRAY['Commercial HVAC', 'Refrigeration', 'Controls & BAS'],
   'Decatur', 'GA', 14,
   'EPA 608 certified HVAC tech with 14 years in commercial and light industrial. Strong on controls and building automation systems. Looking for sub opportunities on larger builds.',
   '(404) 555-0382', 'ray.okafor@email.com', 'https://okaforcooling.com',
   storage_base || '/construction-worker-selfie-stockcake.webp',
   'approved', NOW() - INTERVAL '31 days'),

  -- 4. Plumber
  (c4, NULL, 'DeShawn Merritt', 'Plumbing',
   ARRAY['Commercial Rough-In', 'Underground Utilities', 'Gas Lines'],
   'Roswell', 'GA', 7,
   'State-licensed plumber out of Roswell. Underground utilities and commercial rough-in is where I live. Available for sub work — bring your own prints and I will execute.',
   '(678) 555-0114', 'deshawn.merritt@email.com', NULL,
   storage_base || '/urban-construction-selfie-stockcake.webp',
   'approved', NOW() - INTERVAL '22 days'),

  -- 5. General Contractor
  (c5, NULL, 'Kyle Drummond', 'General Contractor',
   ARRAY['Commercial TI', 'Ground-Up Construction', 'Design-Build'],
   'Atlanta', 'GA', 18,
   'Second-generation GC running projects throughout greater Atlanta. Commercial tenant improvements and ground-up builds up to $4M. State-licensed, bonded, and insured.',
   '(404) 555-0560', 'kyle.drummond@email.com', 'https://drummondbuilds.com',
   storage_base || '/tiktok-contractor.jpeg',
   'approved', NOW() - INTERVAL '17 days'),

  -- 6. Welder
  (c6, NULL, 'Marcus Tillman', 'Welding',
   ARRAY['MIG Welding', 'Aluminum Fabrication', 'Custom Metalwork'],
   'Smyrna', 'GA', 6,
   'Fabricator and welder out of Smyrna. MIG and TIG on aluminum and steel. I do a lot of architectural metalwork — railings, stairs, custom structural pieces. Open to sub opportunities.',
   '(770) 555-0933', 'marcus.tillman@email.com', NULL,
   storage_base || '/images.jpeg',
   'approved', NOW() - INTERVAL '12 days'),

  -- 7. Drywall
  (c7, NULL, 'Anthony Ruiz', 'Drywall',
   ARRAY['Commercial Drywall', 'Metal Framing', 'Acoustic Ceilings'],
   'Kennesaw', 'GA', 11,
   'Commercial drywall and metal framing contractor based in Kennesaw. I have a crew of 6 and we handle large-scale interior builds. Fast, clean, and consistent.',
   '(678) 555-0821', 'anthony.ruiz@email.com', NULL,
   storage_base || '/images-1.jpeg',
   'approved', NOW() - INTERVAL '8 days'),

  -- 8. Electrician
  (c8, NULL, 'Brandon Cole', 'Electrical',
   ARRAY['Industrial Electrical', 'Motor Controls', 'PLC Programming'],
   'Alpharetta', 'GA', 15,
   'Industrial electrician in Alpharetta. Fifteen years wiring manufacturing facilities and distribution centers. Strong on motor controls and PLC programming. Available for subcontract in the metro area.',
   '(770) 555-0674', 'brandon.cole@email.com', NULL,
   storage_base || '/images-2.jpeg',
   'approved', NOW() - INTERVAL '4 days')

ON CONFLICT (id) DO NOTHING;


-- ─── Certifications ─────────────────────────────────────────────────────────

INSERT INTO certifications
  (id, contractor_id, name, issuing_body, cert_number, expiry_date, verified, document_url)
VALUES
  -- Travis (welder)
  (gen_random_uuid(), c1, 'AWS Certified Welder — D1.1 Structural', 'American Welding Society', 'AWS-D11-204817', '2027-06-30', true, ''),
  (gen_random_uuid(), c1, 'Georgia State Contractor License', 'GCOC', 'GA-CONT-58821', NULL, true, ''),
  (gen_random_uuid(), c1, 'General Liability Insurance', 'Travelers Insurance', NULL, '2027-01-15', true, ''),

  -- Jerome (electrician)
  (gen_random_uuid(), c2, 'Georgia Master Electrician License', 'GCOC', 'GA-EL-39041', NULL, true, ''),
  (gen_random_uuid(), c2, 'General Liability Insurance', 'Nationwide', NULL, '2026-11-30', true, ''),

  -- Ray (HVAC)
  (gen_random_uuid(), c3, 'EPA 608 Universal Certification', 'Environmental Protection Agency', 'EPA608-77234', NULL, true, ''),
  (gen_random_uuid(), c3, 'Georgia HVAC Contractor License', 'GCOC', 'GA-HVAC-44502', NULL, true, ''),
  (gen_random_uuid(), c3, 'General Liability Insurance', 'Hartford', NULL, '2026-09-15', true, ''),

  -- DeShawn (plumber)
  (gen_random_uuid(), c4, 'Georgia Plumber License', 'GCOC', 'GA-PL-28813', NULL, true, ''),
  (gen_random_uuid(), c4, 'General Liability Insurance', 'Zurich', NULL, '2027-03-01', true, ''),

  -- Kyle (GC)
  (gen_random_uuid(), c5, 'Georgia General Contractor License', 'GCOC', 'GA-GC-10952', NULL, true, ''),
  (gen_random_uuid(), c5, 'General Liability + Workers Comp', 'Liberty Mutual', NULL, '2027-06-01', true, ''),
  (gen_random_uuid(), c5, 'Contractor Bonding Certificate', 'Surety Solutions', NULL, '2027-06-01', true, ''),

  -- Marcus (welder)
  (gen_random_uuid(), c6, 'AWS Certified Welder — D1.2 Aluminum', 'American Welding Society', 'AWS-D12-318844', '2026-12-31', true, ''),
  (gen_random_uuid(), c6, 'General Liability Insurance', 'Progressive Commercial', NULL, '2026-10-01', true, ''),

  -- Anthony (drywall)
  (gen_random_uuid(), c7, 'Georgia State Contractor License', 'GCOC', 'GA-CONT-77390', NULL, true, ''),
  (gen_random_uuid(), c7, 'General Liability Insurance', 'Chubb', NULL, '2027-02-28', true, ''),

  -- Brandon (electrician)
  (gen_random_uuid(), c8, 'Georgia Master Electrician License', 'GCOC', 'GA-EL-55127', NULL, true, ''),
  (gen_random_uuid(), c8, 'NFPA 70E Arc Flash Safety', 'NFPA', 'NFPA70E-90231', '2028-01-01', true, ''),
  (gen_random_uuid(), c8, 'General Liability Insurance', 'CNA', NULL, '2027-04-30', true, '')

ON CONFLICT DO NOTHING;


-- ─── Posts ──────────────────────────────────────────────────────────────────
-- user_id references real auth user for FK; contractor_id ties post to seed profile display

INSERT INTO posts (id, user_id, contractor_id, content, image_url, link_url, category, created_at)
VALUES

  -- Travis posts
  (gen_random_uuid(), dylan_user_id, c1,
   'Wrapped up another structural steel connection job in Midtown today. D1.1 prequalified joints, MT inspection passed first time. If you are a GC running steel in Atlanta, hit me up — I can mobilize fast.',
   NULL, NULL, 'social', NOW() - INTERVAL '43 days'),

  (gen_random_uuid(), dylan_user_id, c1,
   'Quick tip for welders working structural: always check your preheat requirements before you strike an arc on A572 in cold weather. A lot of guys skip it and end up with cracking they can not see until inspection. The extra 15 minutes saves you hours of rework.',
   NULL, NULL, 'qa', NOW() - INTERVAL '28 days'),

  (gen_random_uuid(), dylan_user_id, c1,
   'Looking for a reliable pipe welder for a 3-week industrial job starting mid-month in Conyers. 6G certification required. Steady work, good pay. DM me if you or someone you know is available.',
   NULL, NULL, 'jobs', NOW() - INTERVAL '10 days'),

  -- Jerome posts
  (gen_random_uuid(), dylan_user_id, c2,
   'Just finished a full electrical rough-in on a 12,000 sq ft medical office build in Sandy Springs. Three weeks, clean conduit runs, ahead of schedule. Good team makes all the difference.',
   NULL, NULL, 'social', NOW() - INTERVAL '36 days'),

  (gen_random_uuid(), dylan_user_id, c2,
   'Anyone else seeing the NEC 2023 requirements starting to hit permit offices in Cobb County? Had a plan rejection last week that was fine under 2020. Worth double-checking your panel schedules before submission.',
   NULL, NULL, 'qa', NOW() - INTERVAL '19 days'),

  -- Ray posts
  (gen_random_uuid(), dylan_user_id, c3,
   'BAS commissioning finished on a 60,000 sq ft office park in Dunwoody. Schneider EcoStruxure system talking to all 14 RTUs cleanly. Occupied setpoints holding within half a degree. Satisfying work.',
   NULL, NULL, 'social', NOW() - INTERVAL '29 days'),

  (gen_random_uuid(), dylan_user_id, c3,
   'For GCs in metro Atlanta — I can take HVAC scopes from design to commissioning including controls. Most subs hand off at equipment installation. I stay through startup and owner training. Makes your closeout package a lot cleaner.',
   NULL, NULL, 'social', NOW() - INTERVAL '14 days'),

  -- DeShawn posts
  (gen_random_uuid(), dylan_user_id, c4,
   'Underground storm and sanitary rough-in done on a new hotel site in Buckhead. Good clean rock conditions made for fast progress. Now waiting on concrete to catch up.',
   NULL, NULL, 'social', NOW() - INTERVAL '20 days'),

  (gen_random_uuid(), dylan_user_id, c4,
   'Pro tip: if you are doing gas line rough-in in Georgia, check local amendment requirements before you pull the permit. Atlanta and some of the surrounding municipalities have adopted local amendments to the International Fuel Gas Code that can catch you off guard.',
   NULL, NULL, 'qa', NOW() - INTERVAL '6 days'),

  -- Kyle posts
  (gen_random_uuid(), dylan_user_id, c5,
   'Broke ground on a 3-story mixed-use build on the BeltLine corridor this week. Concrete, steel, MEP all lined up. Looking to fill one more HVAC sub slot — need someone who can start in about 6 weeks. Drop me a message.',
   NULL, NULL, 'jobs', NOW() - INTERVAL '15 days'),

  (gen_random_uuid(), dylan_user_id, c5,
   'One thing I tell every sub I work with: bid the work you can actually do at the quality you promised. I would rather have a smaller crew that shows up every day over a big operation that disappears after mobilization. Reputation is everything in this market.',
   NULL, NULL, 'social', NOW() - INTERVAL '7 days'),

  -- Marcus Tillman posts
  (gen_random_uuid(), dylan_user_id, c6,
   'Finished a custom aluminum staircase and railing system for a new restaurant build in Ponce City Market. Brushed finish, fully welded connections, zero filler gaps. Client was happy.',
   NULL, NULL, 'social', NOW() - INTERVAL '11 days'),

  (gen_random_uuid(), dylan_user_id, c6,
   'Does anyone have a recommendation for a good source for 6061-T6 aluminum in the Atlanta area? My usual supplier has been running 3-week lead times and it is killing my schedule.',
   NULL, NULL, 'qa', NOW() - INTERVAL '3 days'),

  -- Anthony posts
  (gen_random_uuid(), dylan_user_id, c7,
   'Just hit 50,000 sq ft of interior metal framing and drywall on a warehouse-to-office conversion in Kennesaw. Moving fast on the second floor now. If you have a commercial TI coming up in metro Atlanta, we want to bid it.',
   NULL, NULL, 'social', NOW() - INTERVAL '7 days'),

  -- Brandon posts
  (gen_random_uuid(), dylan_user_id, c8,
   'Completed a full electrical install on a 200,000 sq ft distribution center in Gwinnett. 480V switchgear, VFD motor controls, 47 panel boards, full conduit and wire. Took 14 weeks with a crew of 8. One of the cleaner installs I have run.',
   NULL, NULL, 'social', NOW() - INTERVAL '3 days'),

  (gen_random_uuid(), dylan_user_id, c8,
   'Looking for a licensed electrician who knows Allen-Bradley PLCs for a 2-week controls retrofit job in an Alpharetta manufacturing facility. Must have their own tools. Good rate, local work. Message me.',
   NULL, NULL, 'jobs', NOW() - INTERVAL '1 day')

ON CONFLICT DO NOTHING;

END $$;
