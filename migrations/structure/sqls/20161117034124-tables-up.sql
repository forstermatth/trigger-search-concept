

/* Create initial data tables */
create extension if not exists pgcrypto;

/*
  Using common database practices:
  -   Separate key column for each entity
  -   Referencing key column in foreign keys
  -   Using a mix of data types based on need:
      -   'text' is a variable size type
      -   'uuid' is an universal unique identifier column, fixed length
*/
create schema trigger;
create schema view;


-- Create tables in trigger schema
create table trigger.make (
  make_id uuid PRIMARY KEY,
  make_name text NOT NULL,
  document tsvector NOT NULL
);

create table trigger.model (
  model_id uuid PRIMARY KEY,
  make_id uuid REFERENCES trigger.make(make_id),
  year text NOT NULL,
  model_name text NOT NULL,
  model_type char(1) NOT NULL,
  document tsvector NOT NULL
);

create table trigger.trim (
  trim_id uuid PRIMARY KEY,
  model_id uuid REFERENCES trigger.model(model_id),
  trim_name text NOT NULL,
  package_name text NOT NULL,
  model_code text NOT NULL,
  apx_code text NOT NULL,
  package_code text NOT NULL,
  document tsvector NOT NULL
);

--- create tables in view schema
create table view.make (
  make_id uuid PRIMARY KEY,
  make_name text NOT NULL
);

create table view.model (
  model_id uuid PRIMARY KEY,
  make_id uuid REFERENCES view.make(make_id),
  year integer NOT NULL,
  model_name text NOT NULL,
  model_type char(1) NOT NULL
);

create table view.trim (
  trim_id uuid PRIMARY KEY,
  model_id uuid REFERENCES view.model(model_id),
  trim_name text NOT NULL,
  package_name text NOT NULL,
  model_code text NOT NULL,
  apx_code text NOT NULL,
  package_code text NOT NULL
);
