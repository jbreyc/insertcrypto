import React, { useState, useEffect } from 'react';
import { useWeb3Context } from 'web3-react';
import { ethers } from 'ethers';
import { Box, Card, Heading, Text, Table } from 'rimble-ui';
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
	margin: 32px auto 10px auto;
	font-weight: 600;
`;

const StyledBox = styled(Box)`
	text-align: left;
`;

const StyledTr = styled.tr`
	height: 1.5rem !important;
`;

const StyledTableHeader = styled.tr`
	height: 2rem !important;
`;

export default function GameRanking(props) {
	const web3Context = useWeb3Context();
	const { active, account } = web3Context;
	const [instance, setInstance] = useState(null);
	const [ranking, setRanking] = useState([]);
	const [updateRanking, setUpdateRanking] = useState(props.updateRanking);

	const explain = (
		<React.Fragment>
			<StyledText>
				Connect to Metamask to see the current top 10 ranking.
			</StyledText>
		</React.Fragment>
	);

	const top10 = (
		<React.Fragment>
			<StyledBox>
				<Table>
					<tbody>
						<StyledTableHeader>
							<th>Pos</th>
							<th>Address</th>
							<th>Score</th>
						</StyledTableHeader>
						{ranking.length ? (
							ranking.map((item, index) => (
								<StyledTr key={index}>
									<td>{index + 1}</td>
									<td>
										{item.address !==
										'0x0000000000000000000000000000000000000000'
											? item.address
											: '–'}
									</td>
									<td>{item.score !== '0' ? item.score : '–'}</td>
								</StyledTr>
							))
						) : (
							<StyledTr>
								<td colSpan="3">Retrieving ranking...</td>
							</StyledTr>
						)}
					</tbody>
				</Table>
			</StyledBox>
		</React.Fragment>
	);

	async function updateTop10() {
		let address = null;
		let score = null;
		let top10 = [];

		for (let i = 0; i < 10; i++) {
			address = await instance.getRecordEntryAddress(0, i);
			score = await instance.getRecordEntryScore(0, i);
			top10.push({ address: address.toString(), score: score.toString() });
		}

		setRanking(top10);
		setUpdateRanking(false);
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
		if (active && instance) {
			updateTop10();
		}
	}, [instance]);

	useEffect(() => {
		console.log('updateRanking: ' + updateRanking);
		if (updateRanking) {
			updateTop10();
		}
	}, [updateRanking]);

	return (
		<React.Fragment>
			<StyledCard>
				<StyledHeader>Top 10</StyledHeader>
				<br />
				{!active ? explain : top10}
			</StyledCard>
		</React.Fragment>
	);
}
