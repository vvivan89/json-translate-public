import React from "react";
import {InputGroup,Button,Form,Container, Spinner}from 'react-bootstrap'
import { FaHashtag, FaUser, FaCode, FaRegEye,FaRegEyeSlash} from "react-icons/fa";
import { useHistory } from 'react-router-dom';

import "./Signup.css";

//page with form to create a new user
export function Signup({ create, update }) {
    //passed props are firebase actions to create a user and to store API key provided by user

    //local state for controlled inputs
    const [usr, setUsr] = React.useState({ login: '', password: '', key: '' })
    
    //if auth server returns an error, show it
    const [error, setError] = React.useState('')

    //show blinking circles while waiting for server response
    const [loading, setLoading] = React.useState(false)

    //state of the password input
    const [showPassword, setShowPassword] = React.useState(false)

    //to navigate to the main page
    const history = useHistory();

    //submission of the form has two parts: user creation and API key storage
    const submitHandler = e => {

        //cleanup
        e.preventDefault()
        setError(null)
        setLoading(true)

        //request user creation from Firebase Auth
        create(usr)
            .then(res => {
                //if user is created, we need their UID to make a document in the database
                const { uid } = res.user

                //save user-defined API key (even if the field is blank)
                update(usr.key, uid)
                    .then(() => {
                        //if document is created, go to the main page (already logged)
                        setLoading(false)
                        history.push("/");
                    })
                    //error of database update (not the user creation)
                    .catch(err => cancelWithError(err.message))
            })
        //error of the Auth server (too short password, etc...)
        .catch(err=>cancelWithError(err.message))
    }

    //wrapper to do two action at once: return the "Submit" button and show an error message
    const cancelWithError = (msg)=>{
        setLoading(false)
        setError(msg)
    }

    //password is shown for 1.5 second only, then the field is hidden again
    const passwordTimeout = () =>{
        if(!showPassword){
            setShowPassword(true)
            setTimeout(()=>setShowPassword(false),1500)
        } else {setShowPassword(false)}
    }

    //parameters of all inputs to map through them in render
    const inputs=[
        {
            required:true,
            id:'email',
            icon:<FaUser/>,
            name:"E-mail"
        },
        {
            required:true,
            id:'password',
            icon:<FaHashtag/>,
            name:"Password",
            append:true, //button to show password
            type:showPassword ? 'text':'password'
        },
        {
            required:false,
            id:'key',
            icon:<FaCode/>,
            name:"Google API Key",
            autoComplete:'off'
        }
    ]

    return (
        <Container className='signupForm'>
            <h2>Glad you decided to sign up!</h2>
            <p>
                Please fill three inputs below: Google API key is 
                not required, but you will not be able to use automated translation without it.
                </p>
            <Form onSubmit={submitHandler}>
                {
                    inputs.map(item=>{
                        return (
                            <InputGroup size="lg" className='signupInput' key={item.id}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text id={item.id}>
                                        {item.icon}
                                    </InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    required={item.required}
                                    type={item.type || 'text'}
                                    placeholder={item.name}
                                    isInvalid={error}
                                    aria-label={item.name}
                                    aria-describedby={item.name}
                                    onChange={e=>{
                                        const newUsr={...usr}
                                        newUsr[item.id]=e.target.value
                                        setUsr(newUsr)
                                    }}
                                    autoComplete={item.autoComplete || 'on'}
                                />
                                {
                                    item.append &&
                                    <InputGroup.Append>
                                        <Button variant="outline-dark" onClick={passwordTimeout}>
                                            {showPassword ? <FaRegEyeSlash/>: <FaRegEye />}
                                        </Button>
                                    </InputGroup.Append>
                                }
                            </InputGroup>
                        )
                    })
                }
                {
                    //if there was an error on any of the sign up stages
					error &&
					<div className='signupError'>{error}</div>
                }
                {
                    //shows either "Submit" button or the indication that the request is processing
                    loading
                        //three blinking circles represent loading server request
                        ? <div className="loadingDiv">
                            {Array.from({length: 3}).map((_,i)=><Spinner animation="grow" variant="primary" key={i}/>)}
                        </div>
                        : <Button variant="primary" type="submit" block>
                            Sign Up
                        </Button>
                }
            </Form>
        </Container>
    )
}