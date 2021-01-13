docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=MyStrongPassword123' --mount src="$(pwd)",target=/scripts,type=bind --network sap_default --name sdb -p 1433:1433 -d mcr.microsoft.com/mssql/server:2017-latest
sleep 30
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'MyStrongPassword123' -i /scripts/create_db.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'MyStrongPassword123' -i /scripts/alter_db.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'MyStrongPassword123' -i /scripts/dummy_data.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'MyStrongPassword123' -i /scripts/get_isolate_sp.sql
docker exec -it sdb /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'MyStrongPassword123' -i /scripts/update_isolate_sp.sql