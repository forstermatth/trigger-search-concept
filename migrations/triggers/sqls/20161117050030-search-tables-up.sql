
/* Create Search Table */

create table trigger.vehicle_search (
  search_document_id uuid DEFAULT gen_random_uuid(),
  document tsvector NOT NULL,
  trim_id uuid REFERENCES trigger.trim (trim_id) NULL,
  model_id uuid REFERENCES trigger.model (model_id)
);
