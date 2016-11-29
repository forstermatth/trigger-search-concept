/* Replace with your SQL commands */

/*
  Definitions:
    For the purpose of this file:
      **Search Document**: references atomic search documents stored locally in the tables
      **Search Record**: references search documents created from multiple tables and stored
      in the search table

  Procedures:

  before insert on make, model, trim:
    - create atomic documents from local search fields

  after insert trim:
    - insert new complete search document into search table

  after insert model:
    - if model = c, create new complete certified search document into search table

  after update on trim:
    - update complete search document into search table

  after update on model:
    - if model = c, update complete search document into search table
    - else update all trims that are related to model:
      - loop select into record each related trim
      - rebuild search document and update where model_id and trim_id match

 */

--- SEARCH DOCUMENT TRIGGERS
-- Update triggers to maintain atomic documents
-- uses predefined tsvector_update_trigger function
-- all of them happen 'before' inserts or updates

-- Make
CREATE TRIGGER make_search_document_update BEFORE INSERT OR
  UPDATE OF make_name
  ON trigger.make FOR EACH ROW EXECUTE PROCEDURE
  tsvector_update_trigger(document, 'pg_catalog.english', make_name);

-- Model
CREATE TRIGGER model_search_document_update BEFORE INSERT OR
  UPDATE OF year, model_name
  ON trigger.model FOR EACH ROW EXECUTE PROCEDURE
  tsvector_update_trigger(document, 'pg_catalog.english', year, model_name);

-- Trim
CREATE TRIGGER trim_search_document_update BEFORE INSERT OR
  UPDATE OF trim_name, package_name, model_code, apx_code, package_code
  ON trigger.trim FOR EACH ROW EXECUTE PROCEDURE
  tsvector_update_trigger(document, 'pg_catalog.english', trim_name, package_name, model_code, apx_code, package_code);


-- SEARCH RECORD FUNCTIONS

/*
 *  CREATE TRIM SEARCH RECORD
 *  Trigger to insert new trim search documents
 *
 *  - to be added to the table trim, triggered after
 *  a trim is inserted
 *
 *  Steps:
 *  1. Find all information from make, model
 *  2. create and insert the document into vehicle_search
 */
CREATE FUNCTION create_trim_search_record() RETURNS trigger AS $$
declare
  make  RECORD;
  model RECORD;
begin

  -- find related information
  select * into model from trigger.model where trigger.model.model_id = new.model_id;
  select * into make from trigger.make where trigger.make.make_id = model.make_id;

  -- insert into vehicle_search
  insert into vehicle_search (trim_id, model_id, document)
    values (new.trim_id, new.model_id, setweight(new.document, 'A') || setweight(model.document, 'B') || setweight(make.document, 'C'));

  return new;
end
$$ LANGUAGE plpgsql;

/*
 *  UPDATE TRIM SEARCH RECORD
 *  Function to update trim search documents
 *
 *  - to be added to the table trim, triggered after
 *  a trim document is updated
 *
 *  Steps:
 *  1. Find all information from model, make
 *  2. create and insert the document into vehicle_search
 */
CREATE FUNCTION update_trim_search_record() RETURNS trigger AS $$
declare
  make  RECORD;
  model RECORD;
begin

  -- find related information
  select * into model from trigger.model where trigger.model.model_id = new.model_id;
  select * into make from trigger.make where trigger.make.make_id = model.make_id;

  -- insert into vehicle_search
  update trigger.vehicle_search
    set
      model_id = new.model_id,
      document = setweight(new.document, 'A') || setweight(model.document, 'B') || setweight(make.document, 'C')
  where new.trim_id = trigger.vehicle_search.trim_id;

  return new;
end
$$ LANGUAGE plpgsql;

/*
 *  CREATE CERTIFIED MODEL SEARCH RECORD
 *  Trigger to insert new trim search documents
 *
 *  - to be added to the table model, triggered after
 *  a model is inserted
 *
 *  Steps:
 *  1. Find all information from make
 *  2. create and insert the document into vehicle_search
 */
CREATE FUNCTION create_model_search_record() RETURNS trigger AS $$
declare
  make RECORD;
begin

  IF new.model_type <> 'C' THEN
    return new;
  END IF;

  -- find related information
  select * into make from trigger.make where trigger.make.make_id = new.make_id;

  -- insert into vehicle_search
  insert into vehicle_search (model_id, document)
    values (new.model_id, setweight(new.document, 'B') || setweight(make.document, 'C'));

  return new;
end
$$ LANGUAGE plpgsql;

/*
 *  UPDATE CERTIFIED MODEL SEARCH RECORD
 *  Trigger to insert new trim search documents
 *
 *  - to be added to the table model, triggered after
 *  a model document is updated
 *
 *  Steps:
 *  1. Find all information from make
 *  2. create and insert the document into vehicle_search
 */
CREATE FUNCTION update_model_search_record() RETURNS trigger AS $$
declare
  make RECORD;
begin

  IF new.model_type <> 'C' THEN
    return new;
  END IF;

  -- find related information
  select * into make from trigger.make where trigger.make.make_id = new.make_id;

  -- insert into vehicle_search
  update trigger.vehicle_search
    set
      document = setweight(new.document, 'B') || setweight(make.document, 'C'),
      trim_id = null
  where trigger.vehicle_search.model_id = new.model_id;

  return new;
end
$$ LANGUAGE plpgsql;

/*
 *  CASCADE MODEL UPDATE
 *  Function to cascade model updates to trim documents
 *
 *  - to be added to the table model, triggered after
 *  a model document is updated
 *
 *  Steps:
 *  1. Find related make
 *  2. Find all related trims
 *  3. Update trims search record with new document
 */
CREATE FUNCTION cascade_model_update() RETURNS trigger AS $$
declare
  make  RECORD;
  related_trim RECORD;
begin
  IF new.model_type = 'C' THEN
    return new;
  END IF;

  -- find related information
  select * into make from trigger.make where trigger.make.make_id = new.make_id;

  -- Loop related trims, if any
  FOR related_trim IN
    SELECT trim_id, document from trigger.trim as relatedTrims
    WHERE model_id = new.model_id
  LOOP

      -- Now "related_trim" has one record from trim
      update trigger.vehicle_search
        set
          model_id = new.model_id,
          document = setweight(related_trim.document, 'A') || setweight(new.document, 'B') || setweight(make.document, 'C')
      where
        trigger.vehicle_search.trim_id = related_trim.trim_id and
        trigger.vehicle_search.model_id = new.model_id;

  END LOOP;

  return new;
end
$$ LANGUAGE plpgsql;

/*
 *   CASCADE MAKE UPDATE
 *   Function to cascade make updates to model and trim documents
 *
 *   O(n2) =(
 *
 *   - to be added to the table make, triggered after
 *   a make document is updated
 *
 *   Steps:
 *   1. Find all related models, trims
 *   2. update related search records with new documents
 */
CREATE FUNCTION cascade_make_update() RETURNS trigger AS $$
declare
  related_model RECORD;
  related_trim  RECORD;
begin

  -- Loop related models, if any
  FOR related_model IN
    SELECT model_id, document from trigger.model
    WHERE trigger.model.make_id = new.make_id
  LOOP

      -- Now "related_model" has one record from trim
      -- Update search documents only related to this model
      update trigger.vehicle_search
        set
          document = setweight(related_model.document, 'A') || setweight(new.document, 'B')
      where
        trigger.vehicle_search.model_id = related_model.model_id and
        trigger.vehicle_search.trim_id is null;

      -- Loop related trims to the related_trim
      FOR related_trim IN
        SELECT trim_id, model_id, document from trigger.trim
        WHERE trigger.trim.model_id = related_model.model_id
      LOOP

          -- Now "related_trim" has one record from trim
          -- Update search documents only related to this trim
          update trigger.vehicle_search
            set document = setweight(related_trim.document, 'A') || setweight(related_model.document, 'B') || setweight(new.document, 'C')
          where
            trigger.vehicle_search.trim_id = related_trim.trim_id and
            trigger.vehicle_search.model_id = related_model.model_id;

      END LOOP;
  END LOOP;

  return new;
end
$$ LANGUAGE plpgsql;

/*
 * DELETE TRIM SEARCH RECORD
 *
 * Removes search record before deletion of a trim record
 * - To be added to trim before deletion
 *
 * Steps: use id to delete search records relating to that trim
 */
CREATE FUNCTION delete_trim_search_record() RETURNS trigger AS $$
begin

  -- insert into vehicle_search
  delete from trigger.vehicle_search
    where trim_id = old.trim_id;

  return old;
end
$$ LANGUAGE plpgsql;

/*
 * DELETE MODEL SEARCH RECORD
 *
 * Removes search record before deletion of a trim record
 * - To be added to trim before deletion
 *
 * Steps: use id to delete search records relating to that trim
 */
CREATE FUNCTION delete_model_search_record() RETURNS trigger AS $$
begin

  if old.model_type <> 'C' then
    return old;
  end if;

  -- insert into vehicle_search
  delete from trigger.vehicle_search
    where model_id = old.model_id;

  return old;
end
$$ LANGUAGE plpgsql;

-- SEARCH RECORD TRIGGERS
-- Notice that they all trigger 'after', except deletes

-- Create insert / delete trigger on trim
CREATE TRIGGER trim_search_create AFTER INSERT
  ON trigger.trim FOR EACH ROW EXECUTE PROCEDURE create_trim_search_record();

CREATE TRIGGER trim_search_delete BEFORE DELETE
  ON trigger.trim FOR EACH ROW EXECUTE PROCEDURE delete_trim_search_record();

-- Create update trigger on trim document
CREATE TRIGGER trim_search_update AFTER UPDATE OF trim_name, package_name, model_code, apx_code, package_code
  ON trigger.trim FOR EACH ROW EXECUTE PROCEDURE update_trim_search_record();

-- Create insert / delete trigger on model_type = c
CREATE TRIGGER model_search_create AFTER INSERT
  ON trigger.model FOR EACH ROW EXECUTE PROCEDURE create_model_search_record();

CREATE TRIGGER model_search_delete BEFORE DELETE
  ON trigger.model FOR EACH ROW EXECUTE PROCEDURE delete_model_search_record();

-- Create update trigger on model document if model_type = c
CREATE TRIGGER model_search_update AFTER UPDATE OF model_name, year
  ON trigger.model FOR EACH ROW EXECUTE PROCEDURE update_model_search_record();

-- Create cascading update on model document update
CREATE TRIGGER model_search_cascade AFTER UPDATE OF model_name, year
  ON trigger.model FOR EACH ROW EXECUTE PROCEDURE cascade_model_update();

-- Create cascading update on make document update
CREATE TRIGGER make_search_cascade AFTER UPDATE OF make_name
  ON trigger.make FOR EACH ROW EXECUTE PROCEDURE cascade_make_update();
