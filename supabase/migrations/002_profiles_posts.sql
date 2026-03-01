-- profiles: one per auth user, stores @handle + avatar
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique not null,
  avatar_url  text,
  updated_at  timestamptz default now()
);

-- posts: text + optional image_url + optional link_url
create table posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  contractor_id uuid references contractors(id),
  content       text not null,
  image_url     text,
  link_url      text,
  created_at    timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table posts    enable row level security;

-- profiles: anyone can read, owner can write
create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users can insert their profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile" on profiles for update using (auth.uid() = id);

-- posts: anyone can read, owner can insert/delete
create policy "Posts are publicly viewable" on posts for select using (true);
create policy "Users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

-- indexes
create index posts_user_id_idx       on posts (user_id);
create index posts_contractor_id_idx on posts (contractor_id);
create index posts_created_at_idx    on posts (created_at desc);
create index profiles_username_idx   on profiles (username);
