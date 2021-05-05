import React from "react";
import { Navbar,Nav } from 'react-bootstrap'
import { FaRegCopyright } from "react-icons/fa";
import { Link } from "react-router-dom";

import "./Footer.css";

//static component
//represents the dark navigation bar at the bottom of the page 
//with links to the privacy policy and that GitHub of the project
export function Footer() {

    return (
        <Navbar
            bg='dark'
            expand={true}
            fixed='bottom'
            style={{height:30, borderRadius:5}}
        >
            <Nav.Link as={Link} className='mr-auto hoverable-link' to="/privacy">
                Privacy policy
            </Nav.Link>
            <Nav.Link 
                className='hoverable-link' 
                href="https://github.com/vvivan89/json-translate-public"
                target='_blank'
                rel='noopener noreferrer'
            >
                <FaRegCopyright/> Vladimir Ivanov, May 2021
            </Nav.Link>
        </Navbar>
    )
}