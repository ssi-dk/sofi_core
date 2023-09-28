import json

with (open("data/sap_analysis_results.json")) as results:
    expected_results = [json.loads(line) for line in results]

print(expected_results)

print(expected_results[0])
print(expected_results[0]["_id"]["$oid"])
