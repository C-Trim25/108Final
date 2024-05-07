'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Login from '../components/Login';
import Signup from '../components/Signup';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-tr from-[#111111] to-[#242424]">
      <div className="absolute z-10 text-center flex flex-col items-center justify-center">
        <motion.div
          className="flex"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-8xl font-bold text-mantine-yellow"
            variants={item}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Tic
          </motion.h1>
          <motion.h1
            className="text-8xl font-bold text-mantine-yellow"
            variants={item}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Tac
          </motion.h1>
          <motion.h1
            className="text-8xl font-bold text-mantine-yellow"
            variants={item}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Toe
          </motion.h1>
        </motion.div>
        <motion.p
          className="text-2xl text-white pt-4"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          Play with friends or random opponents online
        </motion.p>
        <motion.div
          className="flex items-center text-xl text-white justify-center pt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            delay: 1.0,
          }}
        >
          <button onClick={() => setShowLogin(true)} className="bg-mantine-gray rounded-md p-2 mx-2 w-32">Login</button>
          <span>&nbsp;|&nbsp;</span>
          <button onClick={() => setShowSignup(true)} className="bg-mantine-gray rounded-md p-2 mx-2 w-32">Sign Up</button>
        </motion.div>
      </div>
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} router={router} />
      )}
      {showSignup && (
        <Signup onClose={() => setShowSignup(false)} router={router} />
      )}
    </main>
  );
}