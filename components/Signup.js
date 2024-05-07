import { useState } from 'react';
import { IconCheck, IconX, IconEye, IconEyeOff } from '@tabler/icons-react';

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function PasswordRequirement({ meets, label }) {
  // Make sure the icon and label are displayed inline
  return (
    <div style={{ display: 'flex', alignItems: 'center', color: meets ? 'green' : 'red', fontSize: 'small' }}>
      {meets ? (
        <IconCheck size="0.9rem" stroke={1.5} />
      ) : (
        <IconX size="0.9rem" stroke={1.5} />
      )}
      <span style={{ marginLeft: '5px' }}>{label}</span>
    </div>
  );
}

function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

function allRequirementsMet(password) {
  return (
    password.length > 5 &&
    requirements.every((requirement) => requirement.re.test(password))
  );
}

const Signup = ({ onClose, router }) => {
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure all requirements are met before submitting
    if (!allRequirementsMet(password)) {
      setError('Password does not meet the requirements.');
      return;
    }

    // Proceed with signup request
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign up');
      }

      onClose();
      router.push('/games');
    } catch (error) {
      setError('Sign up failed: ' + error.message);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className='bg-white text-black rounded-md w-1/5 p-8 shadow-lg'>
        <h1 className="text-2xl font-bold mb-4">Sign up</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={handlePasswordChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <IconEyeOff size="1.25rem" /> : <IconEye size="1.25rem" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <PasswordRequirement label="Has at least 6 characters" meets={password.length > 5} />
            {requirements.map((requirement, index) => (
              <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(password)} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;