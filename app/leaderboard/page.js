'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';


export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const router = useRouter();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    async function fetchLeaderboardData() {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        console.error('Failed to fetch leaderboard data');
      }
    }

    fetchLeaderboardData();

    // Cleanup for socket connection
    return () => newSocket.close();

  }, []);

  return (
    <>
      <Navbar />

      <div className="leaderboard px-4 sm:px-6 lg:px-8" >
        <h1 className="text-4xl font-bold my-8 text-center">Leaderboard</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto shadow-lg bg-white dark:bg-gray-800 rounded-lg">
            <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Player</th>
                <th className="px-6 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
              {leaderboard.map((game, index) => (
                <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{game.username}</td>
                  <td className="px-6 py-4">{game.score}</td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 