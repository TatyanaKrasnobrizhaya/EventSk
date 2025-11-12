#!/bin/sh    shsell script

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"    #!absolútna cesta k adresáru, v ktorom sa skript nachádza
source $SCRIPTPATH/.env

docker exec -i db mysql -u root --password=$DB_ROOT_PASS $DB_NAME < $SCRIPTPATH/sql/backup.sql    #obnovit databázu MySQL zo záložného súboru backup.sql pomocou poverení uvedených v súbore .env.