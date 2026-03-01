alter table posts
  add column category text not null default 'social'
  check (category in ('social', 'qa', 'jobs'));

create index posts_category_idx on posts (category);
