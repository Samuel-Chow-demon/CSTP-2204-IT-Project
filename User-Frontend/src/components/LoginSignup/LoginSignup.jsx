import React, { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { userApp } from '../../firebase'; // Firebase app instance

import './LoginSignup.css';
import emailIcon from '../../assets/email.png';
import userIcon from '../../assets/user.png';
import lockIcon from '../../assets/locked-computer.png';

const LoginSignup = ({ onLoginSuccess }) => {
  const [action, setAction] = useState('Sign Up');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const auth = getAuth(userApp);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailInput,
        passwordInput
      );

      // Optionally update display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: nameInput,
        });
      }

      alert('User signed up successfully!');
      setAction('Login'); // Redirect to login screen
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      alert('User logged in successfully!');
      if (onLoginSuccess) {
        onLoginSuccess(); // Notify App.jsx
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className='container'>
      <div className='header'>
        <div className='text'>{action}</div>
        <div className='underline'></div>
      </div>

      <div className='inputs'>
        {action === 'Sign Up' && (
          <div className='input'>
            <img src={userIcon} alt='user' />
            <input
              type='text'
              placeholder='Name'
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
        )}
        <div className='input'>
          <img src={emailIcon} alt='email' />
          <input
            type='email'
            placeholder='Email'
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>
        <div className='input'>
          <img src={lockIcon} alt='lock' />
          <input
            type='password'
            placeholder='Password'
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </div>
      </div>

      {action === 'Login' && (
        <div className='forgot-password'>
          Forgot Password? <span>Click here!</span>
        </div>
      )}

      {errorMessage && <div className='error-message'>{errorMessage}</div>}

      <div className='submit-container'>
        <div
          className={`submit ${action === 'Login' ? 'gray' : ''}`}
          onClick={() => {
            if (action === 'Login') {
              setAction('Sign Up');
            } else {
              handleSignUp();
            }
          }}
        >
          Sign Up
        </div>

        <div
          className={`submit ${action === 'Sign Up' ? 'gray' : ''}`}
          onClick={() => {
            if (action === 'Sign Up') {
              setAction('Login');
            } else {
              handleLogin();
            }
          }}
        >
          Login
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
