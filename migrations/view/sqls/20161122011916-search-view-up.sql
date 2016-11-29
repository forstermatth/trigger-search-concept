

/* Create search view */

create view view.vehicle_search as
select
  concat_ws(
    ''::text,
    view.model.year::text,
    view.make.make_name::text,
    view.model.model_name::text,
    view.trim.trim_name::text,
    view.trim.package_name::text,
    view.trim.model_code,
    view.trim.package_code,
    view.trim.apx_code
  ) AS document,
  view.model.model_id,
  view.trim.trim_id,
  view.model.model_type
from view.trim
full join view.model on view.trim.model_id = view.model.model_id
join view.make on view.model.make_id = view.make.make_id;
