import React, { useState } from 'react';
import Login from './Login';
import Profile from './Profile';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <Profile user={user} />
      )}
    </div>
  );
}

export default App;