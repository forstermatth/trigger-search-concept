

/* Remove Search Triggers */

DROP TRIGGER make_search_document_update ON trigger.make;
DROP TRIGGER model_search_document_update ON trigger.model;
DROP TRIGGER trim_search_document_update ON trigger.trim;

DROP TRIGGER trim_search_create ON trigger.trim;
DROP TRIGGER trim_search_update ON trigger.trim;
DROP TRIGGER trim_search_delete ON trigger.trim;
DROP TRIGGER model_search_create ON trigger.model;
DROP TRIGGER model_search_update ON trigger.model;
DROP TRIGGER model_search_delete ON trigger.model;
DROP TRIGGER model_search_cascade ON trigger.model;
DROP TRIGGER make_search_cascade ON trigger.make;

DROP FUNCTION cascade_make_update();
DROP FUNCTION cascade_model_update();
DROP FUNCTION update_model_search_record();
DROP FUNCTION create_model_search_record();
DROP FUNCTION delete_model_search_record();
DROP FUNCTION update_trim_search_record();
DROP FUNCTION create_trim_search_record();
DROP FUNCTION delete_trim_search_record();
