const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 3001;

const games = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('getGamesList', () => {
        updateAndBroadcastGames();
    });

    socket.on('joinGame', ({ roomId, username }) => {
        let isNewGame = false;
        if (!games[roomId]) {
            games[roomId] = {
                roomId: roomId,
                players: [],
                board: Array(9).fill(null),
                currentPlayer: 'X'
            };
            isNewGame = true;
        }

        const playerSymbol = games[roomId].players.length === 0 ? 'X' : 'O';
        games[roomId].players.push({ username, id: socket.id, symbol: playerSymbol });

        socket.join(roomId);
        socket.emit('playerSymbol', playerSymbol);
        console.log(`${username} joined ${roomId} as ${playerSymbol}`);
        io.to(roomId).emit('gameUpdate', games[roomId]);

        if (isNewGame) {
            updateAndBroadcastGames();
        }
    });

    socket.on('makeMove', ({ roomId, index, player }) => {
        if (games[roomId] && games[roomId].board[index] === null && games[roomId].currentPlayer === player) {
            games[roomId].board[index] = player;

            io.to(roomId).emit('gameUpdate', games[roomId]);
            console.log(`Move made in ${roomId} at index ${index} by ${player}`);

            const winnerUsername = checkWin(games[roomId].board, games[roomId].players);
            if (winnerUsername) {
                io.to(roomId).emit('gameOver', { winner: winnerUsername });
            } else if (games[roomId].board.every(cell => cell !== null)) {
                io.to(roomId).emit('gameOver', { winner: null });
            } else {
                let nextPlayer = player === 'X' ? 'O' : 'X';
                games[roomId].currentPlayer = nextPlayer;
            }
        }
    });

    socket.on('sendMessage', ({ roomId, username, message }) => {
        const fullMessage = `${username}: ${message}`;
        io.to(roomId).emit('receiveMessage', fullMessage);
        console.log(`Message sent in ${roomId}: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    
        // Remove the disconnected user from all games
        Object.keys(games).forEach(roomId => {
            const game = games[roomId];
            const index = game.players.findIndex(player => player.id === socket.id);
            if (index !== -1) {
                const username = game.players[index].username;
                game.players.splice(index, 1);
                if (game.players.length === 0) {
                    // If no players are left, delete the game
                    delete games[roomId];
                    io.emit('gameDeleted', roomId);
                    console.log(`Game ${roomId} deleted due to no players.`);
                } else {
                    io.emit('playerDisconnected', { roomId, username });
                    console.log(`${username} disconnected from ${roomId}.`);
                    io.to(roomId).emit('gameUpdate', game);
                }
            }
        });
    });
});

function checkWin(board, players) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
        [0, 4, 8], [2, 4, 6]              // diagonals
    ];
    for (let line of lines) {
        if (line.every(index => board[index] === board[line[0]] && board[index] !== null)) {
            return players.find(p => p.symbol === board[line[0]]).username;
        }
    }
    return null;
}

function updateAndBroadcastGames() {
    io.emit('gamesListUpdated', Object.values(games).map(game => ({
        gameID: game.roomId,
        creator: game.players[0]?.username,
        players: game.players.map(p => p.username)
    })));
}

server.listen(port, () => {
    console.log(`WebSocket server is running on http://localhost:${port}`);
});