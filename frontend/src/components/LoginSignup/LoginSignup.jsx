import React, { useState } from 'react'
import './LoginSignup.css'

import email from '../../assets/email.png'
import user from '../../assets//user.png'
import lockedComputer from '../../assets/locked-computer.png'

const LoginSignup = () => {
  
  const [action, setAction] = useState("Sign Up")
  
  return (
    <div className='container'>
      <div className='header'>
        <div className='text'>{action}</div>
        <div className='underline'></div>
      </div>
      <div className='inputs'>
        {action==="Login"?<div></div>:<div className='input'>
          <img src={user} alt="" />
          <input type="text" placeholder='Name' />
        </div>}
        <div className='input'>
          <img src={email} alt="" />
          <input type="email" placeholder='Email' />
        </div>
        <div className='input'>
          <img src={lockedComputer} alt="" />
          <input type="password" placeholder='Password' />
        </div>
      </div>
      {action==="Sign Up"?<div></div>:<div className="forgot-password">Forgot Password? <span>Click here!</span></div>}
      <div className="submit-container">
        <div className={`submit ${action === "Login" ? "gray" : ""}`} onClick={() => setAction(prev => (prev === "Login" ? "Sign Up" : prev))}>Sign Up</div>
        <div className={`submit ${action === "Sign Up" ? "gray" : ""}`} onClick={() => setAction(prev => (prev === "Sign Up" ? "Login" : prev))}>Login</div>
      </div>
    </div>
  )
}

export default LoginSignup
