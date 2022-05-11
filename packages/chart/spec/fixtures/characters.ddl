create table staging.characters
(
    id       uuid primary key default extensions.uuid_generate_v4()
  , born_on  date
  , died_on  date
  , name     varchar
  , city   varchar
  , gender  varchar
);

insert into staging.characters(born_on,died_on, name, city, gender) values('2000-01-01','2016-01-01', 'Dusty Fog','Rio Hondo', 'Male');
insert into staging.characters(born_on,died_on, name, city, gender) values('2006-01-10','2019-01-01', 'Ysable Kid','Gusher City', 'Female');
insert into staging.characters(born_on,died_on, name, city, gender) values('2005-01-10','2017-01-01', 'Mark Counter','Gusher City', 'Female');
insert into staging.characters(born_on,died_on, name, city, gender) values('2004-01-10','2018-01-01', 'Waco','Rio Hondo', 'Female');
insert into staging.characters(born_on, name, city, gender) values('2005-02-04', 'Belle Starr','Gusher City', 'Female');
insert into staging.characters(born_on, name, city, gender) values('2004-02-10', 'Calamity Jane','Rio Hondo', 'Female');
insert into staging.characters(born_on, name, city, gender) values('2003-02-10', 'Alice Fayde','Rio Hondo', 'Female');

create table staging.bullets
(
	id         uuid primary key default extensions.uuid_generate_v4()
, year       numeric
, fired      numeric
, received   numeric
, shooter_id uuid references staging.characters(id)
);


drop view  staging.flow_of_time;
create or replace view staging.flow_of_time
as
select year
     , name
     , city
     , gender
     , age
     , round(random()*age*10)         as fired
     , round(random()*age*10)         as hits
     , age_group*5 || ' - ' || (age_group+1)*5 age_range
from (
select (ay.year||'-01-01')::date      as year
     , c.name
     , c.city
     , c.gender
     , ((ay.year||'-01-01')::date- c.born_on)::float/365 age
     , (ay.year - extract('year' from c.born_on))::integer/5 as age_group
  from staging.all_years  ay
  left outer join staging.characters c
    on (c.born_on <= (ay.year||'-01-01')::date
        and (   c.died_on is null
             or extract('year' from c.died_on) >= ay.year ))
    ) years;

select * from staging.flow_of_time;
copy (select * from staging.flow_of_time) to '/Users/Jerry/Code/Vikalp/scaffold/sparsh-ui/packages/chart/spec/fixtures/edson.csv' with csv header;