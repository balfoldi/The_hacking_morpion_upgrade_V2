class Morpion {
	constructor(player) {
		this.player = player
		this.lastUndo = localStorage["lastUndo"] ? JSON.parse(localStorage["lastUndo"]) : []
		this.history = localStorage["history"] ? JSON.parse(localStorage["history"]) : []
		this.ia = (player == "J1") ? "J2" : "J1";
		this.iaLevel = localStorage["iaLevel"] ? localStorage["iaLevel"] : "normal"
		this.map = []
		for (let i = 0; i < 3; i++) {
			this.map[i] = [];
			for (let j = 0; j < 3; j++) {
				this.map[i][j] = "EMPTY";
				document.getElementById(this.getZone(i, j)).onclick = () => this.playerTurn(i, j);
			}
		}
		this.finish = false;
		if (this.history.length) {
			let i = 1
			this.history.forEach((move) => {
				let x = move[0]
				let y = move[1]
				let currentPlayer = i % 2 ? "J1" : "J2"
				this.fillGrid(x, y, currentPlayer)
				i++
			})
		}
		this.updateIa(this.iaLevel)
		if (this.ia === "J1")
			this.iaTurn();
	}

	getZone = (x, y) => {
		if (y == 0)
			return 'A' + (x + 1);
		else if (y == 1)
			return 'B' + (x + 1);
		else
			return 'C' + (x + 1);
	}

	checkDraw = () => {
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				if (this.map[x][y] === "EMPTY")
					return false;
			}
		}
		return true;
	}

	fillGrid = (x, y, player = null) => {
		let image = (player == this.player) ? 'croix' : 'rond';
		const zone = this.getZone(x, y);

		if (this.map[x][y] != "EMPTY")
			return false;
		this.map[x][y] = player;
		this.history.push([x, y])
		document.getElementById(zone).style.backgroundImage = `url(image-morpion/${image}.png)`;
		document.getElementById(zone).className += " filled";
		this.checking(player);
		return true;
	}

	checking = (player) => {
		const one = this.map[0][0];
		const two = this.map[0][1];
		const three = this.map[0][2];
		const four = this.map[1][0];
		const five = this.map[1][1];
		const six = this.map[1][2];
		const seven = this.map[2][0];
		const eight = this.map[2][1];
		const nine = this.map[2][2];
		if (one === two && one === three && one != "EMPTY" ||
			four === five && four === six && four != "EMPTY" ||
			seven === eight && seven === nine && seven != "EMPTY" ||
			one === five && one === nine && one != "EMPTY" ||
			three === five && three === seven && three != "EMPTY" ||
			one === four && one === seven && one != "EMPTY" ||
			two === five && two === eight && two != "EMPTY" ||
			three === six && three === nine && three != "EMPTY") {
			this.finish = true;
			localStorage["lastUndo"] = []
			localStorage["history"] = []
			if (player == this.ia) {
				document.getElementById('win').textContent = 'L\'IA a gagné !';
			} else if (player == this.player) {
				document.getElementById('win').textContent = 'Tu as battu l\'IA !';
			}
		} else if (this.checkDraw()) {
			document.getElementById('win').textContent = "Vous êtes à égalité";
			this.finish = true;
		}
	}

	winningLine(a, b, c) {
		return a == b && b == c && a != "EMPTY";
	}

	checkWinner() {
		let winner = null;
		for (let i = 0; i < 3; i++) {
			if (this.winningLine(this.map[i][0], this.map[i][1], this.map[i][2])) {
				winner = this.map[i][0];
			}
			if (this.winningLine(this.map[0][i], this.map[1][i], this.map[2][i])) {
				winner = this.map[0][i];
			}
		}
		if (this.winningLine(this.map[0][0], this.map[1][1], this.map[2][2])) {
			winner = this.map[0][0];
		}
		if (this.winningLine(this.map[2][0], this.map[1][1], this.map[0][2])) {
			winner = this.map[2][0];
		}
		if (winner == null && this.turn == 9) {
			return "draw";
		} else {
			return winner;
		}
	}

	playerTurn = (x, y) => {
		if (this.finish)
			return;
		if (!this.fillGrid(x, y, this.player))
			return alert('La case n\'est pas vide');
		else if (!this.finish) {
			this.iaTurn();
		}
		this.saveGame()
		console.log(this.history)

	}

	minimax = (board, depth, isMaximizing) => {
		let result = this.checkWinner();
		if (result == this.ia) return 10 - depth;
		else if (result == this.player) return depth - 10;
		else if (result != null) return depth;

		if (isMaximizing) {
			let bestScore = -Infinity;
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (board[i][j] == "EMPTY") {
						board[i][j] = this.ia;
						this.turn++;
						let score = this.minimax(board, depth + 1, false);
						board[i][j] = "EMPTY";
						this.turn--;
						if (score > bestScore) {
							bestScore = score;
						}
					}
				}
			}
			return bestScore;
		} else {
			let bestScore = Infinity;
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (board[i][j] == "EMPTY") {
						board[i][j] = this.player;
						this.turn++;
						let score = this.minimax(board, depth + 1, true);
						board[i][j] = "EMPTY";
						this.turn--;
						if (score < bestScore) {
							bestScore = score;
						}
					}
				}
			}
			return bestScore;
		}
	}

	aiChecking = (map) => {
		const one = [0, 0];
		const two = [0, 1];
		const three = [0, 2];
		const four = [1, 0];
		const five = [1, 1];
		const six = [1, 2];
		const seven = [2, 0];
		const eight = [2, 1];
		const nine = [2, 2];
		const winLines = [
			[one, two, three],
			[one, four, seven],
			[one, five, nine],
			[two, five, eight],
			[three, six, nine],
			[three, five, seven],
			[four, five, six],
			[seven, eight, nine]
		]
		let result = false
		winLines.forEach((winLine) => {
			if (
				winLine.filter((cords) => {
					return map[cords[0]][cords[1]] === "J2"
				}).length === 2
			) {
				console.log("one line can win")
				const isFree = winLine.filter((cords) => {
					return map[cords[0]][cords[1]] === "EMPTY"
				})
				console.log(isFree.length)
				if (isFree.length === 1) {
					console.log("i can play it")
					result = isFree
				}
			}
		})
		return result
	}

	iaTurn = () => {
		console.log("current IA level is " + this.iaLevel)
		switch (this.iaLevel) {
			case "easy":
				let x = Math.floor(Math.random() * 3)
				let y = Math.floor(Math.random() * 3)
				while (!this.fillGrid(x, y, this.ia)) {
					x = Math.floor(Math.random() * 3)
					y = Math.floor(Math.random() * 3)
				}
				break;
			case "normal":
				const canWin = this.aiChecking(this.map)
				if (canWin) {
					this.fillGrid(canWin[0][0], canWin[0][1], this.ia)
				} else {
					let x = Math.floor(Math.random() * 3)
					let y = Math.floor(Math.random() * 3)
					while (!this.fillGrid(x, y, this.ia)) {
						x = Math.floor(Math.random() * 3)
						y = Math.floor(Math.random() * 3)
					}
				}
				break
			case "hard":
				let depth = 0;
				let bestScore = -Infinity;
				let move;
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						if (this.map[i][j] == "EMPTY") {
							this.map[i][j] = this.ia;
							this.turn++;
							let score = this.minimax(this.map, depth + 1, false);
							this.map[i][j] = "EMPTY";
							this.turn--;
							if (score > bestScore) {
								bestScore = score;
								move = {
									i,
									j
								};
							}
						}
					}
				}
				this.fillGrid(move.i, move.j, this.ia);
				break;
		}

	};

	undo = () => {
		this.history.splice(this.history.length - 2, 2).forEach((move) => {
			let x = move[0]
			let y = move[1]
			this.map[x][y] = "EMPTY"
			let zone = this.getZone(x, y)
			document.getElementById(zone).style = ""
			this.lastUndo.push(move)
		})
		this.saveGame()
	}

	redo = () => {
		let player = "J1"
		this.lastUndo.splice(this.lastUndo.length - 2, 2).forEach((move) => {
			let x = move[0]
			let y = move[1]
			this.fillGrid(x, y, player)
			player = "J2"
		})
		this.saveGame()
	}

	saveGame = () => {
		localStorage["history"] = JSON.stringify(this.history)
		localStorage["lastUndo"] = JSON.stringify(this.lastUndo)
	}

	updateIa = (level) => {
		document.querySelector(`#ia${this.iaLevel.charAt(0).toUpperCase() + this.iaLevel.slice(1)}`).classList.remove("bouton-active")
		this.iaLevel = level
		localStorage['iaLevel'] = level
		document.querySelector(`#ia${level.charAt(0).toUpperCase() + level.slice(1)}`).classList.add("bouton-active")
	}
}

let morpion = new Morpion("J1")


const newGame = () => {
	localStorage["lastUndo"] = []
	localStorage["history"] = []
	location.reload()
}