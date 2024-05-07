'use client';

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Navbar from '../../../../components/Navbar';
import { usePathname } from 'next/navigation';

export default function Game() {
    const pathname = usePathname();
    const [gameId, username] = pathname.split('/').slice(2, 4);

    const [socket, setSocket] = useState(null);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [playerSymbol, setPlayerSymbol] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);
        newSocket.emit('joinGame', { roomId: gameId, username });

        newSocket.on('playerSymbol', (symbol) => {
            setPlayerSymbol(symbol);
            setIsMyTurn(symbol === currentPlayer);
        });

        newSocket.on('gameUpdate', (gameState) => {
            setBoard(gameState.board);
            setCurrentPlayer(gameState.currentPlayer);
            setIsMyTurn(gameState.currentPlayer === playerSymbol);
        });

        newSocket.on('gameOver', ({ winner: gameWinner }) => {
            setGameOver(true);
            setWinner(gameWinner);
            setIsMyTurn(false); // Prevent further moves

            if (gameWinner) {
                fetch('/api/scoreUpdate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: gameWinner })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Score updated successfully:', data);
                    // You can perform additional logic after score update if needed
                })
                .catch(error => {
                    console.error('Error updating score:', error);
                });
            }
        });

        newSocket.on('receiveMessage', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        newSocket.on('playerDisconnected', data => {
            console.log('Player disconnected:', data.username);
            fetch('/api/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameId: data.roomId,
                    username: data.username
                })
            }).then(() => {
                console.log('Player disconnected:', data.username);
            }).catch(error => {
                console.error('Error removing player:', error);
            });
        });

        return () => {
            newSocket.off('playerSymbol');
            newSocket.off('gameUpdate');
            newSocket.off('gameOver');
            newSocket.off('receiveMessage');
            newSocket.off('playerDisconnected');
            newSocket.close();
        };
    }, [gameId, username]);

    const makeMove = (index) => {
        if (board[index] === null && !gameOver) {
            socket.emit('makeMove', { roomId: gameId, index, player: playerSymbol });
            setIsMyTurn(false);
        }
    };

    const sendMessage = () => {
        if (input.trim()) {
            socket.emit('sendMessage', { roomId: gameId, username: username, message: input });
            setInput('');
        }
    };

    return (
        <>
            <Navbar />
            <main className="flex justify-center items-center min-h-screen bg-background-gray-300 text-white">
                <div className="flex items-start space-x-8 max-w-4xl mx-auto p-4">
                    <div className="flex flex-col items-center justify-center w-full max-w-md p-8 bg-gray-700 border border-gray-600">
                        <h1 className="text-3xl font-bold">Tic Tac Toe</h1>
                        <h1>Player 1</h1>
                        <div className="grid grid-cols-3 gap-4 mt-4" style={{ width: '300px', height: '300px' }}>
                            {board.map((cell, index) => (
                                <div key={index} className={`w-full h-full flex items-center justify-center border bg-gray-400 border-gray-500`} onClick={() => makeMove(index)}>
                                    <span className="text-2xl">{cell}</span>
                                </div>
                            ))}
                        </div>
                        <h1>Player 2</h1>
                        {gameOver && <div className="mt-4 text-xl font-bold text-red-500">{winner ? `Player ${winner} wins!` : "It's a draw!"}</div>}
                    </div>
                    <div className="flex flex-col w-full max-w-sm p-4 bg-gray-700 border border-gray-600" style={{ height: '300px' }}>
                        <h2 className="text-lg font-bold">Messages</h2>
                        <div className="flex-grow overflow-auto">
                            {messages.map((msg, index) => <p key={index}>{msg}</p>)}
                        </div>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="w-full p-2 bg-gray-600 text-white" />
                        <button onClick={sendMessage} className="w-full mt-2 bg-green-600 p-2">Send</button>
                    </div>
                </div>
            </main>
        </>
    );
}
