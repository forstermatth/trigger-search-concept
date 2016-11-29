

/* Add search table index */

CREATE INDEX vehicle_search_index ON trigger.vehicle_search USING gin(document);

-- Not sure about this:
-- CLUSTER trigger.vehicle_search USING vehicle_search_index;
