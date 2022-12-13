#!/usr/bin/env bash

SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

docker run --rm -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=MyStrongPassword123" --mount src="$SCRIPTPATH",target=/scripts,type=bind,readonly --name sdb -p 1433:1433 -d mcr.microsoft.com/mssql/server:2017-latest
sleep 50
# docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/create_db.sql
# docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/alter_db.sql
# docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/dummy_data.sql
# docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/get_isolate_sps.sql
# docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/update_isolate_sp.sql
# docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/rowver_sp.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/create_db_consolidated.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/change_sps.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/historic_tables.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "MyStrongPassword123" -i /scripts/dummy_data.sql
