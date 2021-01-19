# Run locally

I would suggest running make run and then manually stopping the queue broker container in order to run it locally.

In order to test this out locally, you need to run `local_db.sh` script within the `sap_tbr_integration/DbScriptsfolder`. This spins up an MSSQL server with seeded data and required stored procedures and views.
I´ve not added the TBR db to docker compose here. local_db adds the SQL Server to the sap_default network that is created by the make target.

When the `bifrost_db` and `tbr_integration` containers are up, you can simply run `MONGO_HOST=localhost LOGLEVEL=INFO python main.py` for running the broker locally within the bifrost_queue_broker folder after `pip install -r requirements.txt`

Now you need to edit some of the isolates in the `sap_analysis_results` collection. The isolate_id has to be 1-3 to correspond with the local TBR database.
I recommend restarting the main.py manually after these changes to instantly get a result back