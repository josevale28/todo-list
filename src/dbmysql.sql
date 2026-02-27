create database tareas;

use tareas;

create table tabla_tareas (
    id int auto_increment primary key,
    tarea varchar(200) not null,
    estado boolean default false
);

create user 'tareas_user'@'localhost'
identified by 'root';

grant all privileges
on tareas.*
to 'tareas_user'@'localhost';

flush privileges;