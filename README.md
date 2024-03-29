# Description

[Insert Crypto](http://insertcrypto.com) is a web3 gaming platform that rethinks the video arcade experience of the 80s and 90s. Through the browser, players can gather around a game (for this project the one chosen is Asteroids). To play they pay a small fee (50¢) in Ether. This amount is automatically splitted in 3 parts: 30% goes to the operator of the virtual arcade, 30% to a game pot and 40% to the game creators.

The game creators and operators also receive Zennies. A Zenny is a ERC777 token that is minted every time a player inserts crypto to play.

Zennies are required to either publish a game in the network of crypto arcades, or set up a new crypto arcade.

## Incentives

- Players: In the 80s and 90s players competed at video game joints to set the top records in their favourite games. In a crypto arcade players will compete to set the record but also to win a reward in Ether.
- Operators: Running an instance of the frontend platform will provide the operator with 30% of the total revenue, part of which can be reinvested in ads to increase traffic.
- Game creators: They receive a 40% of each fee paid by players. The idea is that the better the game, the higher the number of players and the revenue the creator can obtain.

One of the key elements that falls out of scope for this delivery is WASM integration. Go or Rust based games compiled to WASM will surely allow for great gaming capabilities on browsers which might increase the potential reach of the platform. It also points at the possibility of developing standalone clients.

Current implementation consists on a React frontend that displays the player info, the game and the game ranking.

Smart Contracts control the game state, the purchased and played matches, the list with the top 10 scores and, the reward pot and the % for each player on the top ranking.

**Note: Current version only retrieves the ranking list once at wallet connection. Until fixed in the code, to update the list please reload the page.**

## Available Scripts

In the project root directory, please run:

#### `npm install`

This step will install dependencies on Openzeppelin lib contracts.

#### `truffle compile`

#### `truffle migrate`

Truffle migration script might return an error due to the deployment exceeding the gas limits. To fix this please modify your local node configuration to run on a 8000000 gas limit (in Ganache this is done with the paramether --gasLimit=8000000)

#### `truffle test`

to compile, deploy and test the contracts.

Inside the ./client directory, please run:

#### `npm install`

#### `npm run start`

This command runs the app in the development mode.
<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

**NOTE 1:** Contracts are deployed to the Rinkeby testnet in case you don't want to run a local node. Local nodes are expected to run on port 8545.

**NOTE 2:** Sometimes Metamask extension returns an error (3206) when the app tries to connect to the local node. This issue is sorted by changing metamask to Mainnet and then back again to localhost:8545

### Additional Documents

- [Design pattern decisions](design_pattern_decisions.md)
- [Avoiding common attacks](avoiding_common_attacks.md)
