import React from 'react';
import {
	Alert,
	OverlayTrigger,
	Tooltip
} from 'react-bootstrap';

//component contains of two alerts, both are shown only when user is not logged in
//main one is a description of the service
export function NotLoggedAlert({show,recentlyDeletedProfile}){
	/*
		show prop is passed always when user is logged out
		user can also close alert manually, therefore there is a state for each of the alerts
	*/

	//main alert state
	const [localVisible,setLocalVisible] = React.useState(true)

	//deleted profile state
	const [profileAlert, setProfileAlert] = React.useState(true)

	//don't consider deleted profile alert state if main alert should not be visible
	//that's intentional behavior, one of the reasons is that deleted profile alert is timed
	if(!show || !localVisible){return null}
	
	//shows tooltip over the "BYOK" abbreviation
    const BYOK = ({bold=false}) =>{
		return (
			<OverlayTrigger
				placement="top"
				delay={{ show: 250, hide: 400 }}
				overlay={<Tooltip>Bring Your Own (API) Key</Tooltip>}
			>
				<span style={{fontWeight: bold ? 'bold':'normal', textDecoration:'underline dotted'}}>BYOK</span>
			</OverlayTrigger>
		)
    }
    
    return (
		<>
			{/* shows only if user just deleted their profile and is redirected to a main page */}
			<Alert 
				variant='danger' 
				onClose={() => setProfileAlert(false)} 
				dismissible 
				style={{marginBottom:0}}
				show={recentlyDeletedProfile && profileAlert}
			>
				Your profile deleted successfully
			</Alert>

			{/* description of the service, that s shown every time user is not logged in */}
			<Alert variant="dark" onClose={() => setLocalVisible(false)} dismissible>
				<Alert.Heading>Hi there!</Alert.Heading>
				<p>
					This tool uses Google Translate API to translate data from JSON files to
					any language you want. Here's the killer feature: you can choose which keys to
					translate.
				</p>
				<hr />
				<p>
					This tool is free, however Google API is, generally speaking, not. Well,
					half-mil free characters per month is not that much, eh? Therefore, we have
					one rule for you: <BYOK bold/>!
				</p>
				<div>
					Actually, there are three options:
					<ul>
						<li>
							Start using it right away, but you'll have to translate everything
							manually. We still believe it's more convenient than in code editor.
						</li>
						<li>
							Enter your own API key above and enjoy the mighty automated
							translation, at your own expense. Note: we don't store your API key and don't have access to it.
						</li>
						<li>
							Sign up and gain access to persistent glossary of your specific
							terms and definitions. Use it when Google is not good enough. You
							still have to <BYOK/>, tho. And we will securely store it in Google Firebase for you.
						</li>
					</ul>
				</div>
			</Alert>
		</>
    )
}