import './App.css';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import AuthDetails from './components/auth/AuthDetails';
import React, { useState } from 'react';

const App = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="App">
      <div className="top-section">
        {isSignUp ? <SignUp /> : <SignIn />}
      </div>
      {!isSignUp && (
        <div className="sign-up-prompt">
          <p>
            Чтобы зарегистрироваться: <span className="sign-up-link" onClick={toggleSignUp}>Sign Up</span>
          </p>
        </div>
      )}
      <div className="bottom-section">
        <AuthDetails />
      </div>
    </div>
  );
};

export default App;

