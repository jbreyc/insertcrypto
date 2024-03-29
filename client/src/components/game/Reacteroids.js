import React, { useState, useEffect, useRef } from 'react';
import { Flex, Box, Image } from 'rimble-ui';
import styled from 'styled-components';

import Ship from './Ship';
import Asteroid from './Asteroid';
import { randomNumBetweenExcluding } from './helpers';
import PlayerAccount from '../PlayerAccount';
import Blink from '../Blink';
import GameRanking from '../GameRanking';

import logo from '../../assets/ic@100.png';

// Styles

const StyledLogo = styled.div`
	position:absolute;
  top:0px;
  left:0px;
}`;

const StyledCTA = styled(Blink)`
  position: absolute;
	bottom:150px;
	left: 18%;
	transform: translate(-18%, 0);
	text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
	font-family: 'Slackey', cursive;
	font-size: 37px;
	font-weight: normal;
	font-style: normal;
	font-stretch: normal;
	line-height: normal;
	letter-spacing: normal;
	color: #fbf194;
}`;

const KEY = {
	LEFT: 37,
	RIGHT: 39,
	UP: 38,
	A: 65,
	D: 68,
	W: 87,
	SPACE: 32
};

export function Reacteroids() {
	const canvas = useRef();

	let screen = {
		width: (window.innerWidth * 3) / 5,
		height: window.innerHeight,
		ratio: 1 //window.devicePixelRatio || 1
	};

	const [init, setInit] = useState(true);

	let keys = {
		left: 0,
		right: 0,
		up: 0,
		down: 0,
		space: 0
	};

	const [matchesAvailable, setMatchesAvailable] = useState(0);
	const [startGame, setStartGame] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [score, setScore] = useState(null);
	const [lastScore, setLastScore] = useState(null);
	const [commitScore, setCommitScore] = useState(false);
	const [updateRanking, setUpdateRanking] = useState(false);

	let ctaMessage = {
		insert: 'INSERT CRYPTO!',
		play: 'PRESS THE PLAY BUTTON!',
		start: 'WAITING FOR CONFIRMATION...'
	};

	let asteroidCount = 3;

	const [state] = useState({
		contex: null,
		inGame: false,
		currentScore: 0
	});

	const [elements] = useState({
		ships: [],
		asteroids: [],
		bullets: [],
		particles: []
	});

	function cleanUp() {
		// log('(cleanUp) currentScore:' + currentScore);
		state.currentScore = 0;
		setScore(0);

		for (let group in elements) {
			for (let item in group) {
				if (elements[group][item]) {
					elements[group][item].remove();
				}
			}
		}
		// Remove or render
		updateObjects(elements.particles, 'particles');
		updateObjects(elements.asteroids, 'asteroids');
		updateObjects(elements.bullets, 'bullets');
		updateObjects(elements.ships, 'ships');
	}

	function update() {
		//		log('(update) currentScore:' + currentScore);

		state.context.save();
		state.context.scale(screen.ratio, screen.ratio);

		// Motion trail
		state.context.fillStyle = '#000';
		state.context.globalAlpha = 0.4;
		state.context.fillRect(0, 0, screen.width, screen.height);
		state.context.globalAlpha = 1;

		// Next set of asteroids
		if (!elements.asteroids.length) {
			let count = asteroidCount + 1;
			asteroidCount = count;
			generateAsteroids(count);
		}

		// Check for colisions
		checkCollisionsWith(elements.bullets, elements.asteroids);
		checkCollisionsWith(elements.ships, elements.asteroids);

		// Remove or render
		updateObjects(elements.particles, 'particles');
		updateObjects(elements.asteroids, 'asteroids');
		updateObjects(elements.bullets, 'bullets');
		updateObjects(elements.ships, 'ships');

		state.context.restore();
		// Next frame
		requestAnimationFrame(() => {
			update();
		});
	}

	function addScore(points) {
		//log('(addScore) currentScore:' + currentScore);
		// log('(addScore) startGame:' + startGame);
		// log('(addScore) matchesAvailable:' + matchesAvailable);
		// log('(addScore) commitGame:' + commitGame);
		if (state.inGame) {
			state.currentScore += points;
			setScore(state.currentScore);
		}
		//log('(addScore) state.currentScore:' + state.currentScore);
	}

	function startCanvas() {
		// Make asteroids
		elements.asteroids = [];
		generateAsteroids(asteroidCount);
	}

	function start() {
		// log('(start) currentScore:' + currentScore);
		setInGame(true);
		setCommitScore(false);

		state.inGame = true;
		// Make ship
		let ship = new Ship({
			position: {
				x: screen.width / 2,
				y: screen.height / 2
			},
			create: createObject.bind(this),
			onDie: gameOver.bind(this)
		});

		createObject(ship, 'ships');
	}

	function gameOver() {
		// log('(gameOver) state.inGame:' + state.inGame);
		setIsGameOver(true);
		// setScore(state.currentScore);
		// setLastScore(state.currentScore);
		// setStartGame(false);
		// setInGame(false);
		// setCommitScore(true);
		// setUpdateRanking(true);
		// console.log('gameOver: ' + updateRanking);
		// state.inGame = false;
	}

	function generateAsteroids(howMany) {
		// log('(generateAsteroids) currentScore:' + currentScore);
		let ship = elements.ships[0];

		for (let i = 0; i < howMany; i++) {
			let asteroid = new Asteroid({
				size: 80,
				position: {
					x: randomNumBetweenExcluding(
						0,
						screen.width,
						(ship ? ship.position.x : 0) - 60,
						(ship ? ship.position.x : 0) + 60
					),
					y: randomNumBetweenExcluding(
						0,
						screen.height,
						(ship ? ship.position.y : 0) - 60,
						(ship ? ship.position.y : 0) + 60
					)
				},
				create: createObject.bind(this),
				addScore: addScore.bind(this)
			});
			createObject(asteroid, 'asteroids');
		}
	}

	function createObject(item, group) {
		// log('(createObject) currentScore:' + currentScore);
		// log('createObject: ' + JSON.stringify(item));
		elements[group].push(item);
	}

	function updateObjects(items, group) {
		// log('(updateObjects) currentScore:' + currentScore);
		let index = 0;
		let context = state.context;
		for (let item of items) {
			if (item.delete) {
				elements[group].splice(index, 1);
			} else {
				items[index].render({ keys, screen, context });
			}
			index++;
		}
	}

	function checkCollisionsWith(items1, items2) {
		var a = items1.length - 1;
		var b;
		for (a; a > -1; --a) {
			b = items2.length - 1;
			for (b; b > -1; --b) {
				var item1 = items1[a];
				var item2 = items2[b];
				if (checkCollision(item1, item2)) {
					item1.destroy();
					item2.destroy();
				}
			}
		}
	}

	function checkCollision(obj1, obj2) {
		var vx = obj1.position.x - obj2.position.x;
		var vy = obj1.position.y - obj2.position.y;
		var length = Math.sqrt(vx * vx + vy * vy);
		if (length < obj1.radius + obj2.radius) {
			return true;
		}
		return false;
	}

	function handleResize(value, e) {
		screen = {
			width: (window.innerWidth * 3) / 5,
			height: window.innerHeight,
			ratio: 1 //window.devicePixelRatio || 1
		};
	}

	function handleKeys(value, e) {
		let newKeyValues = keys;
		if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A)
			newKeyValues.left = value;
		if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D)
			newKeyValues.right = value;
		if (e.keyCode === KEY.UP || e.keyCode === KEY.W) newKeyValues.up = value;
		if (e.keyCode === KEY.SPACE) newKeyValues.space = value;
		keys = newKeyValues;
	}

	function log(message) {
		console.log(message);
	}

	useEffect(() => {
		log('useEffect Reacteroids 1');
		window.addEventListener('keyup', handleKeys.bind(this, false)); // Will it work?
		window.addEventListener('keydown', handleKeys.bind(this, true));
		window.addEventListener('resize', handleResize.bind(this, false));

		const c = canvas.current.getContext('2d');
		if (init) {
			state.context = c;
			setInit(false);
		}
		return function cleanup() {
			window.removeEventListener('keyup', handleKeys);
			window.removeEventListener('keydown', handleKeys);
			window.removeEventListener('resize', handleResize);
		};
	}, [init]);

	useEffect(() => {
		log('useEffect Reacteroids 2');

		if (state.context) {
			startCanvas();
			update();
		}
	}, [state.context]);

	useEffect(() => {
		log('useEffect Reacteroids 3');
		if (startGame) {
			cleanUp();
			setIsGameOver(false);
			start();
		}
	}, [startGame]);

	useEffect(() => {
		log('useEffect Reacteroids 4');
		if (isGameOver) {
			setScore(state.currentScore);
			setLastScore(state.currentScore);
			setStartGame(false);
			setInGame(false);
			setCommitScore(true);
			setUpdateRanking(true);
			console.log('gameOver: ' + updateRanking);
			state.inGame = false;
		}
	}, [isGameOver]);

	return (
		<React.Fragment>
			<Flex bg="#C182FF">
				<StyledLogo>
					<Image
						alt="Insert Crypto"
						borderRadius={8}
						height="auto"
						src={logo}
					/>
				</StyledLogo>
				<canvas
					ref={canvas}
					width={screen.width * screen.ratio}
					height={screen.height * screen.ratio}
				/>
				{!startGame && (
					<StyledCTA>
						{matchesAvailable > 0 ? ctaMessage.play : ctaMessage.insert}
					</StyledCTA>
				)}
				<Box width={2 / 5}>
					<PlayerAccount
						onMatchesAvailable={setMatchesAvailable}
						onPlay={() => setStartGame(true)}
						inGame={inGame}
						score={score}
						finalScore={lastScore}
						onCommitScore={commitScore}
					/>
					<GameRanking updateRanking={updateRanking} />
				</Box>
			</Flex>
		</React.Fragment>
	);
}
