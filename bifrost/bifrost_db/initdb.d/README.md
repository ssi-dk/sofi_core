# Initialize database

Instead of building the development database from an archive we are building it from a series of files, either hand-crafted or exported from test or production.

Doing this, it's easier to known what the database will contain from a starting point and to exchange old datasets with new, improved and approved datasets.


## Sample data

### `samples` collection
From `fooddevdb.opr.computerome.dk` export samples which have been marked as _good_:

```shell
mongoexport --uri='mongodb://<user>:<password>@localhost:27018/bifrost_test?authSource=admin' \
--out='samples.jsonl' \
--collection='samples' \
--query='{ "categories.sample_info.summary.sofi_sequence_id": { $in: ["22006997_MW-SAL_run310", "22005982_MW-SAL_run310", "22006820_MW-SAL_run310", "22002333_MW-CAMPY_run310", "22005368_MW-ESCEC_run310"]}}'
```


### `species_to_mlstscheme_mapping` collection
