import React from "react";
import { Navbar, Nav }from 'react-bootstrap'
import { useLocation, Link } from "react-router-dom";
import { LoggedNavBar } from '../components/LoggedNavBar'
import { GeneralNavBar } from '../components/GeneralNavBar'

import "./Header.css";

//represents Header of the App with control over all user actions
export function Header({ userData }) {

	//to make header look elevated when content is scrolled down
	const [scroll, setScroll] = React.useState(false);

	//controls what links to show
	const location = useLocation();
	const pth = location.pathname;
	
	//check scrolling and apply style if content is scrolled down
	React.useEffect(() => {
		document.addEventListener("scroll", () => {
			const scrollCheck = window.scrollY >= 200;
			
			//avoid re-rendering too often, only when user passes 200px
			if (scrollCheck !== scroll) {
				setScroll(scrollCheck);
			}
		});
	});

	return (
		<Navbar
			bg='light'
			expand="md"
			sticky="top"
			className={scroll ? "elevate" : ""}
			variant='light'
			//to collapse when links are clicked (links need to have eventKey property)
			collapseOnSelect
		>
			<Navbar.Brand className='hoverable'>
				<Nav.Link className='navbar-brand' to='/' as={Link} eventKey='3'>
					JSON Translation Tool
				</Nav.Link>
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			{
				//shows different element depending on authentication state
				userData?.isLogged 
					? <LoggedNavBar userData={userData} isProfile={pth==='/profile'}/> 
					: <GeneralNavBar userData={userData} isSignup={pth==='/signup'}/>
			}      
		</Navbar>
	);
}