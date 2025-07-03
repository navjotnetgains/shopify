'use client';

import { useState } from 'react';

export default function Login({onLoginSuccess}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const query = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email,
        password,
      },
    };

    const res = await fetch('https://netgains28.myshopify.com/api/2025-04/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': 'e667bc10b211d8bc9d30c62d919ba267',
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();
    const data = json.data?.customerAccessTokenCreate;

    if (data?.customerUserErrors.length) {
      setError(data.customerUserErrors[0].message);
    } else {
      const token =data.customerAccessToken.accessToken
      setAccessToken(data.customerAccessToken.accessToken);
      setError(''); 
      localStorage.setItem("customertoken",token);
      if(onLoginSuccess){
        onLoginSuccess();
      }
    }
  };

  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Shopify Customer Login</h2>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Login
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
        )}

        {accessToken && (
          <div className="mt-4 text-green-700 text-sm break-all">
            <strong>Access Token:</strong> {accessToken}
          </div>
        )}
      </div>
    </div>
  );
}