import React, { useState, useEffect } from 'react';
import { useWeb3Context } from 'web3-react';
import { ethers } from 'ethers';
import {
	Flex,
	Box,
	Card,
	ToastMessage,
	Heading,
	Blockie,
	Text,
	Link,
	Button,
	MetaMaskButton
} from 'rimble-ui';
import styled from 'styled-components';

import CryptoArcade from '../contracts/CryptoArcade.json';

// Styles
const StyledCard = styled(Card)`
	text-align: center;
	width: 90%;
	margin: 24px auto;
`;

const StyledHeader = styled(Heading.h2)`
	font-family: 'Press Start 2P';
	font-size: 32px;
	font-weight: normal;
	font-style: normal;
	font-stretch: normal;
	line-height: normal;
	letter-spacing: normal;
	text-align: center;
	color: #6913bf;
`;

const StyledText = styled(Text)`
	color: #525252;
	margin: 16px auto 10px auto;
	font-weight: 600;
`;

const StyledLink = styled(Link)`
	font-size: 17px;
	font-weight: semibold;
	text-decoration: underline;
	color: #99118e;
`;

const StyledBox = styled(Box)`
	text-align: left;
`;

const StyledPlayButton = styled(Button)`
	:focus {
		outline: none;
	}
`;

const StyledDrawButton = styled(Button)`
	margin: auto 16px;
`;

export default function PlayerAccount(props) {
	const web3Context = useWeb3Context();
	const { active, account } = web3Context;
	const [instance, setInstance] = useState(null);
	const [matchesAvailable, setMatchesAvailable] = useState(null);
	const [canPlay, setCanPlay] = useState(false);
	const [balance, setBalance] = useState(0);

	const connect = (
		<React.Fragment>
			<StyledText>
				Insert Crypto is a web3 gaming platform that rethinks the video arcade
				experience of the 80s and 90s. Every time you play, you need to pay a
				small amount (100 wei) in Ether. The amount is automatically splitted in
				3 parts: 30% goes to the operator of this arcade, 30% to a game pot and
				40% to the game creators.
			</StyledText>
			<StyledLink
				href="https://github.com/jbreyc/insertcrypto"
				target="_blank"
				title="GitHub"
			>
				If you want to know more, click on the link!
			</StyledLink>
			<br />
			<br />
			<MetaMaskButton.Outline
				key="MetaMask"
				disabled={web3Context.connectorName === 'MetaMask'}
				onClick={() => web3Context.setConnector('MetaMask')}
			>
				Connect with MetaMask
			</MetaMaskButton.Outline>
		</React.Fragment>
	);

	const playerData = (
		<React.Fragment>
			<StyledBox>
				<StyledText>Matches Available: {matchesAvailable}</StyledText>
			</StyledBox>
			<Flex>
				<StyledText>
					Current Score: {props.score ? props.score : '–'}
				</StyledText>
				<StyledText>
					Last Score: {props.finalScore ? props.finalScore : '–'}
				</StyledText>
			</Flex>
			<Card boxShadow={0} py={0}>
				<StyledText>
					Balance: {balance}{' '}
					<StyledDrawButton
						size="small"
						variant="success"
						onClick={() => drawBalance()}
					>
						Withdraw balance
					</StyledDrawButton>
				</StyledText>
			</Card>
			<Button.Outline mx={10} my={20} onClick={() => purchaseMatch()}>
				Purchase Match
			</Button.Outline>
			<StyledPlayButton
				mx={10}
				disabled={!canPlay || props.inGame}
				onClick={() => {
					startMatch();
				}}
			>
				Play
			</StyledPlayButton>
		</React.Fragment>
	);

	async function startMatch() {
		await instance.playMatch(0);

		let filter = instance.filters.LogMatchStarted(account, 0, null);
		instance.on(filter, (account, gameId, matchId) => {
			matchStarted(account, gameId, matchId);
		});

		props.onPlay();

		window.toastProvider.addMessage('Starting game...', {
			variant: 'processing'
		});
	}

	function matchStarted() {
		window.toastProvider.addMessage('Game confirmed!', {
			variant: 'success'
		});
	}

	async function purchaseMatch() {
		let response = await instance.matchPrice(0);
		console.log(response.toNumber());
		if (response) {
			await instance.purchaseMatch(0, { value: response.toNumber() });
			updateMatches();
		}
	}

	async function drawBalance() {
		await instance.releaseReward(0, account);

		// PaymentDue(address to, uint256 amount);
		let filter = instance.filters.LogRewardReleased(account, null);
		instance.on(filter, (account, amount) => {
			console.log('Account: ' + account + ' / Amount: ' + amount);
		});

		updateBalance();
		updateMatches();
	}

	async function updateMatches() {
		let response = await instance.getNumberOfAvailableMatches(0, {
			from: account
		});

		setMatchesAvailable(Number(response));
		props.onMatchesAvailable(response.toString());
	}

	async function matchPlayed() {
		log('matchPlayed (finalScore): ' + props.finalScore);

		await instance.matchPlayed(0, props.finalScore);

		let filter = instance.filters.LogMatchFinished(account, 0, null);
		instance.on(filter, (account, gameId, matchId) => {
			gotReward(account, gameId, matchId);
		});

		window.toastProvider.addMessage('Recording game...', {
			variant: 'processing'
		});

		//LogNewRecord(msg.sender, _gameId, _score);
		filter = instance.filters.LogNewRecord(account, 0, null);
		instance.on(filter, (account, gameId, matchId) => {
			gotReward(account, gameId, matchId);
		});

		updateBalance();
	}

	function gotReward(account, gameId, score) {
		console.log('GotReward: ' + account + ' score: ' + score);
		window.toastProvider.addMessage('Your score got you a reward!', {
			variant: 'success'
		});
	}
	// ToDo
	async function updateBalance() {
		// Inform player on new record
		// Updarte balance
		// Provide button to retrieve balance

		let response = await instance.getNumberOfAvailableMatches(0, {
			from: account
		});
		setMatchesAvailable(response.toString());
		props.onMatchesAvailable(response.toString());

		response = await instance.playerBalance(0, {
			from: account
		});
		console.log('Balance: ' + response.toString());
		setBalance(Number(response.toString()));
	}

	useEffect(() => {
		if (active) {
			const signer = web3Context.library.getSigner();
			const deployedNetwork = CryptoArcade.networks[web3Context.networkId];

			const contractInstance = new ethers.Contract(
				deployedNetwork.address,
				CryptoArcade.abi,
				signer
			);

			setInstance(contractInstance);
		}
	}, [active]);

	useEffect(() => {
		// log('useEffect PlayerAccount 2: ');
		if (active && instance) {
			//LogMatchPurchased(address indexed player, uint256 gameId);
			let filter = instance.filters.LogMatchPurchased(account, null);
			instance.on(filter, updateMatches);

			//LogNewRecord(msg.sender, _gameId, _score);
			filter = instance.filters.LogNewRecord(account, 0, null);
			instance.on(filter, updateBalance);

			updateMatches();

			return function cleanup() {
				instance.removeAllListeners('LogMatchPurchased');
			};
		}
	}, [instance]);

	useEffect(() => {
		// log('useEffect PlayerAccount 3: ');
		if (matchesAvailable > 0) {
			setCanPlay(true);
		}
	}, [matchesAvailable]);

	useEffect(() => {
		// log(
		// 	'useEffect PlayerAccount 4: props.onCommitScore: ' +
		// 		props.onCommitScore +
		// 		' / props.inGame: ' +
		// 		props.inGame
		// );
		if (!props.inGame && props.onCommitScore) {
			matchPlayed();
			updateBalance();
		}
	}, [props.onCommitScore]);

	useEffect(() => {
		// log('useEffect PlayerAccount 5: Balance: ' + balance);
	}, [balance]);

	function log(message) {
		console.log(message);
	}

	return (
		<StyledCard>
			<StyledHeader>
				{active && (
					<Blockie
						opts={{
							seed: account,
							color: '#C182FF',
							bgcolor: '#fff',
							size: 12,
							scale: 3,
							spotcolor: '#6913bf'
						}}
					/>
				)}{' '}
				Player
			</StyledHeader>
			{!active ? connect : playerData}
			<ToastMessage.Provider ref={node => (window.toastProvider = node)} />
		</StyledCard>
	);
}
