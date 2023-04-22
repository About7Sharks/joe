## Trader Joe Farmer Repo

This script gets the LP positions for a given address and calculates the value of claimbale fees.
Uses GraphQL to get the data from the subgraph.


### Setup & Usage
Add and setup .env file with the following variables (replace with your own values)
```
ACCOUNT = "" # address to check
PROVIDER = "" # RPC url
GRAPHQL_ENDPOINT = "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-arbitrum"
``` 
Install dependencies and run

```
npm install

node index.js
```