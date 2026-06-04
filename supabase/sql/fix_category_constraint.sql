ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_category_check;
ALTER TABLE activities ADD CONSTRAINT activities_category_check
  CHECK (category IN ('sports', 'food', 'arts', 'nightlife', 'outdoors'));
