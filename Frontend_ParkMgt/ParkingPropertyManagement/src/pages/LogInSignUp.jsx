import { useState } from 'react'
import { Card, Nav, Navbar, NavItem, NavLink } from 'react-bootstrap'
import Signup from './Signup'
import Login from './Login'

const LogInSignUp = () => {

    const LOGIN_KEY = "login"
    const SIGNUP_KEY = "signup"

    const [activeKey, setActiveKey] = useState(LOGIN_KEY);

    const handleSelectNav = (eKey)=>{
        setActiveKey(eKey)
    }

    const getLinkStyle = (key) => ({
        color: activeKey === key ? '#f4edf5' : '#9d56a8',  // Active vs Inactive color
        backgroundColor : activeKey === key ? (key === "login" ? '#6340bd' : '#a031b0') : '#d1c1d4',  // Active vs Inactive color
        fontWeight: activeKey === key ? 'bold' : 'normal', // Active link bold
      });

  return (
    <>
        <Card className="shadow-lg" style={{
            minWidth: '450px'
        }}>
            <Card.Header>

                <Nav justify variant="tabs" defaultActiveKey={LOGIN_KEY} activeKey={activeKey} 
                    onSelect={handleSelectNav}>
                    <NavItem>
                        <NavLink eventKey={LOGIN_KEY} style={getLinkStyle(LOGIN_KEY)}>
                            Log In
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink eventKey={SIGNUP_KEY} style={getLinkStyle(SIGNUP_KEY)}>
                            Sign Up
                        </NavLink>
                    </NavItem>
                </Nav>

            </Card.Header>
            <Card.Body>
                {
                    activeKey === LOGIN_KEY ?
                    <Login changeToSigUpTab={()=>setActiveKey(SIGNUP_KEY)}/> : 
                    <Signup changeToLogInTab={()=>setActiveKey(LOGIN_KEY)} />
                }
            </Card.Body>
        </Card>
    </>
  )
}

export default LogInSignUp