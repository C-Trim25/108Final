'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

export default function Games() {
  const [games, setGames] = useState([]);
  const router = useRouter();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // Adjust URL/port if needed
    setSocket(newSocket);

    newSocket.emit('getGamesList');

    newSocket.on('gamesListUpdated', (updatedGamesList) => {
      setGames(updatedGamesList);
    });

    newSocket.on('gameDeleted', (roomId) => {
      setGames((prevGames) => prevGames.filter((game) => game.gameID !== roomId));
      console.log('Game deleted:', roomId);
    });

    return () => {
      newSocket.off('gamesListUpdated');
      newSocket.close();
    };
  }, []);

  async function createGame() {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const game = await response.json();
      router.push(`/game/${game.gameID}/${game.creator}`);
    } else {
      const error = await response.json();
      console.error('Failed to create game: ', error.error);
    }
  }

  async function joinGame(gameID, creatorUsername) {
    const response = await fetch(`/api/${gameID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: creatorUsername }),
    });

    const data = await response.json();
    const username = data.username;

    if (response.ok) {
      console.log('Joined game successfully');
      setGames((prevGames) => prevGames.map((game) => (game.gameID === gameID ? data : game)));
      router.push(`/game/${gameID}/${username}`);
    } else {
      console.error('Failed to join game: ', data.error);
    }
  }

  return (
    <>
      <Navbar />
      <main className="relative flex justify-center w-full min-h-screen p-8 bg-background-gray-300 text-white">
        <div className="w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Games Available</h1>
            <button onClick={createGame} className="bg-mantine-yellow hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
              Create Game
            </button>
          </div>
          <div className="mb-4">
            {games.map((game) => {
              const players = game.players || [];
              const isGameFull = Array.isArray(players) && players.length >= 2;

              return (
                <div key={game.gameID} className="bg-background-gray-200 flex justify-between items-center mb-2 p-2 shadow-md rounded">
                  <div>
                    <h2 className="text-xl font-bold">Creator: {game.creator}</h2>
                    <p>Players: {players.join(', ')}</p>
                  </div>
                  <button
                    onClick={() => joinGame(game.gameID, game.creator)}
                    disabled={isGameFull}
                    className={`font-bold py-2 px-4 rounded w-32 h-10 ${
                      isGameFull
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-500 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isGameFull ? 'Full' : 'Join Game'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}