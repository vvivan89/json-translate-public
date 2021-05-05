import React from "react";
import { Navbar, Nav }from 'react-bootstrap'
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { ApiUsageBar } from '../components/ApiUsageBar'

//navigation bar used when user is logged in
export function LoggedNavBar({userData, isProfile}){
    return (
        <Navbar.Collapse id="responsive-navbar-nav">

            {/* shows API usage for current month */}
            <Nav className="mr-auto">
                <ApiUsageBar session={false} usage={userData?.api.usage}/>
            </Nav>

            {
                //if user is not on the profile page, show link to a profile page
                isProfile
                    ? null
                    : <Nav.Link to="/profile" as={Link} eventKey='12'>
                        <FaUserCircle/>
                        &nbsp;{userData?.email}
                    </Nav.Link>
            }

            {/* Log out button */}
            <Nav.Link  to="/"  as={Link} onClick={userData?.logOut}  eventKey='2'>Log out</Nav.Link>
        </Navbar.Collapse>
    )
}