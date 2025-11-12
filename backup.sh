#!/bin/sh

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
source $SCRIPTPATH/.env
echo $SCRIPTPATH
docker exec db  mysqldump -u root --password=$DB_ROOT_PASS $DB_NAME > $SCRIPTPATH/sql/backup.sql