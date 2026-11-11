
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS owner_id INTEGER
    REFERENCES users(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS properties_owner_id_idx
    ON properties(owner_id);
