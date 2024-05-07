import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const Navbar = () => {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    const res = await fetch('/api/logout', { method: 'POST' });
    const data = await res.json();

    if (data.message === 'Logged out successfully') {
      router.push('/');
    }
  }, [router]);

  return (
    <nav className="bg-background-gray-100 text-white p-4 flex justify-center"
      style={{
        borderBottom: '1px solid #424242'
      }}>
      <div className="w-3/4 flex justify-between">
        <ul className="flex space-x-4">
          <li>
            <Link href="/games">Play</Link>
          </li>
          <li>
            <Link href="/leaderboard">Leaderboard</Link>
          </li>
        </ul>
        <ul className="flex space-x-4">
          <li>
            <a href="#" onClick={handleLogout}>Logout</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;