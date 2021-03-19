import React from 'react'
import { Container, Button, Form } from 'react-bootstrap';

//component allows only to login to the app, no signup or anything
//users may be added manually from firestore console (there's no reason to do it)
export function Login({auth }) {

    //controlled inputs
    const [usr, setUserData] = React.useState({ login: '', password: '' })

    //validation state
    const [error, setError] = React.useState(null)

    //form submit: display error if there is one
    //in login successful, state in <App/> will navigate to <Translator> component
    const signIn = (e) => {
        e.preventDefault()
        setError(false)
        auth.signInWithEmailAndPassword(usr.email, usr.password)
        .catch(e=>setError(e.message))
    }

    //wrapper for inputs state management
    //removes error message if user changes login/password
    const setUsr = usr =>{
        setUserData(usr)
        if(error){setError(false)}
    }


    return (
        <Container className='login-form'>
            <Form onSubmit={e=>signIn(e)}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control 
                        type="email" 
                        placeholder="Enter email" 
                        onChange={e=>setUsr({...usr, email:e.target.value})}
                    />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password" 
                        onChange={e=>setUsr({...usr, password:e.target.value})}
                    />
                {
                    error &&
                    <Form.Text className='error'>
                        {error}
                    </Form.Text>
                }
                </Form.Group>
                <Button variant="primary" type="submit">
                    YARRRR!
                </Button>
            </Form>
        </Container>
    )
}