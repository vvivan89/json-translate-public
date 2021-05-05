import React from "react";
import { Navbar, 
		Nav, 
		InputGroup,
		FormControl,
		Button,
		Form,
		Overlay,
		Tooltip,
}from 'react-bootstrap'
import { Link } from "react-router-dom";
import { FaHashtag,FaUser } from "react-icons/fa";
import { GoogleApiInput } from '../components/GoogleApiInput'
import { ApiUsageBar } from '../components/ApiUsageBar'

//navigation bar when user is not logged in
export function GeneralNavBar({userData,isSignup}){

	//log in controls
	const [usr, setUsr] = React.useState({ login: '', password: '' })
	
	//error of log in or password reset
	const [error, setError] = React.useState({})

	//disables "reset password" while processing the operation
	const [resetAction, setResetAction] = React.useState(false)

	//refs to show tooltips left of the buttons when error occurs
	const signIn = React.useRef()
    const reset = React.useRef()

	//error tooltip auto hides after 2 seconds
    const errTimeout = (msg,type) =>{

		//set error to show tooltip
		setError({ msg, type })

		//remove error to hide tooltip in 2 seconds
		setTimeout(() => setError({}), 2000)

		//enable "reset password" button if it was disabled
		setResetAction(false)
	}
    
    return (
        <Navbar.Collapse id="responsive-navbar-nav">
			<Form inline className='mr-auto'>
				{/* 
					user can input Google API key without login and use it during a session 
					input state is controlled from this component
				*/}
				<GoogleApiInput onChange={(value)=>userData ? userData.setAPI(value) : null} value={userData?.api.key}/>

				{/* shows session API usage is there is a key */}
				<ApiUsageBar session={true} usage={userData?.api.usage}/>
			</Form>
			<div style={{minWidth:'15px'}}/>

			{/* Log in controls */}
			<Form inline>
				<InputGroup hasValidation size="sm" className='input-100'>
					<InputGroup.Prepend>
						<InputGroup.Text id="username"><FaUser/></InputGroup.Text>
					</InputGroup.Prepend>
					<FormControl
						placeholder="Username"
						isInvalid={error.type==='login'}
						aria-label="Username"
						aria-describedby="username"
						onChange={e=>setUsr({...usr, email:e.target.value})}
					/>
					<InputGroup.Append>
						<Button 
							size="sm"
							disabled={resetAction}
							variant="outline-warning" 
							ref={reset}
							onClick={() => {
								//if no email, ask user to input in in the tooltip
								if (!usr.email) { errTimeout('Input email first', 'reset') }

								//if email is there, try to reset password
								else {

									//disable button
									setResetAction(true)

									//reset password
									userData.reset(usr.email).then(()=>{
										//email with password reset link is sent - notify user
										errTimeout('Password resetting email has been sent, check your inbox', 'reset')
									}).catch(err=> {
										//Firebase was unable to send email, notify user about an error
										errTimeout(err, 'reset')
									})
								}
							}}
						>
							{
								//when button is disabled, show that something is going on
								resetAction
									? 'Resetting...'
									: 'Reset password?'
							}
						</Button>

						{/* Tooltip notification for "reset password" button */}
						<Overlay target={reset.current} show={error.type==='reset'} placement="left">
							{(props) => (
								<Tooltip 
									id="password-error" 
									{...props}
								>
									{error.msg}
								</Tooltip>
							)}
						</Overlay>
					</InputGroup.Append>
				</InputGroup>

				{/* 
					margin between buttons is set up like this because on narrow viewports we don't want it 
					and I don't want to create tons of @media rules
				*/}
				<div style={{minWidth:'10px'}}/>

				<InputGroup hasValidation size="sm" className='input-100'>
					<InputGroup.Prepend>
						<InputGroup.Text id="password"><FaHashtag/></InputGroup.Text>
					</InputGroup.Prepend>
					<FormControl
						type='password'
						isInvalid={error.type==='login'}
						placeholder="Password"
						aria-label="Password"
						aria-describedby="password"
						onChange={e=>setUsr({...usr, password:e.target.value})}
					/>
					<InputGroup.Append>
							{/* 
								sign in button send info up to App module and gets the promise from there 
								but if login was successful, it will re-render navigation bar, so here we do nothing
							*/}
							<Button 
								size="sm"
								variant="primary" 
								ref={signIn}
								onClick={()=>userData?.logIn(usr).catch(e=>errTimeout(e.message,'login'))}
							>
									Sign&nbsp;in
							</Button>
							<Overlay target={signIn.current} show={error.type==='login'} placement="left">
								{(props) => (
									<Tooltip 
										id="password-error" 
										{...props}
									>
										{error.msg}
									</Tooltip>
								)}
							</Overlay>

						{
							//if user is not on a signup page, show link to it
							!isSignup &&
							<InputGroup.Text>
								<Nav.Link to="/signup" as={Link} style={{ padding: 0 }} eventKey='1'>Sign&nbsp;up</Nav.Link>
							</InputGroup.Text>
						}
					</InputGroup.Append>
				</InputGroup>
			</Form>
		</Navbar.Collapse>
    )
}