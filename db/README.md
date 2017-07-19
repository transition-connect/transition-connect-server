## Setup test data for database

Add lines to neo4j config:
dbms.shell.port=1337
dbms.shell.enabled=true

Restart neo4j server.

run script:
neo4j-shell -port 1387 -file path/to/manualTestData.cypher