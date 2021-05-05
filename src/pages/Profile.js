import React from 'react';
import {
    Container,
    Row,
    Col,
    InputGroup,
    FormControl,
    Button,
    Overlay,
    Tooltip,
} from 'react-bootstrap';
import { FaUser, FaEdit, FaHashtag, FaCode } from "react-icons/fa";
import { GlossaryEditor } from '../components/GlossaryEditor'
import { UsageChart} from '../components/UsageChart'
import { ConfirmPopup } from '../components/ConfirmPopup'

/*
    page with user profile, has three sections:
        - User email, password and API key (with possibility to edit)
        - API usage statistics
        - Glossary (with possibility to edit)
*/
export function Profile({
    user, apiKey, glossary, updateAPI,
    stats, deleteUser, recentlyDeletedProfile
}) {
    
    //local state with user data to show in inputs and handle updates
    const [usr, setUsr] = React.useState({ email: "", password: '', key: '' })

    //id input that is being edited (email, password or API key)
    const [edit, setEdit] = React.useState(null)

    //true when server is updating any of the user info: login password, etc...
    const [editInProgress, setEditInProgress] = React.useState(false)

    //message that is shown in button popups (success or error)
    const [msg, setMsg] = React.useState({})

    //visibility of the modal window that allows to edit glossary item
    const [popup, setPopupVisible] = React.useState(false)
    
    //refs used to show tooltips on each button
    const email = React.useRef()
    const pwd = React.useRef()
    const key = React.useRef()
    const delBtn = React.useRef()

    //on component load, transform passed user data to local state
    React.useEffect(() => {
        if (![null, undefined].includes(apiKey) && user?.email) {
            setUsr({ ...usr, email: user.email, key: apiKey })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[apiKey, user])

    //message (success of error of any update) is shown only for 2 seconds
    const msgTimeout = (msg, type) => {
        
        //show message
        setMsg({ msg, type })

        //enable buttons back (disables when server is fulfilling the request)
        setEditInProgress(false)

        //hide message
        setTimeout(() => setMsg({}), 2000)
    }

    //propeties of inputs for email, password and API key
    const inputRow=[
        {
            id:'e-mail', //goes to state to indicate what information is being edited
            icon:<FaUser/>,
            key:'email', //corresponds to the key of local state variable "usr"
            ref:email,
            name:'E-mail', //a placeholder
            function:()=>user.updateEmail(usr.email),
            value:usr.email //controlled value
        },
        {
            id:'password',
            icon:<FaHashtag/>,
            key:'password',
            ref:pwd,
            name:'Password',
            function:()=>user.updatePassword(usr.password),
            type: 'password',
            //we don't know the password before user starts to enter a new one
            value:edit==='password' ? usr.password : "**********"
        },
        {
            id:'api-key',
            icon:<FaCode/>,
            key:'key',
            ref:key,
            name:'Google API key',
            function:()=>updateAPI(usr.key),
            value:usr.key
        }
    ]

    return (
        <Container fluid>

            {/* 
                Maintain 2 columns with any viewport
                to always show "Delete" button on the right 
            */}
            <Row xs={2} style={{marginTop:15}}>
                <Col><h4>Profile</h4></Col>
                <Col style={{ textAlign: 'right' }}>
                    
                    {/* 
                        Button to delete user profile with tooltip 
                        Requires confirmation of the action
                        Tooltip used only when action resulted in error
                    */}
                    <Button 
                    ref={delBtn}
                        variant='outline-danger' 
                        size='sm'
                        onClick={()=>setPopupVisible(true)}
                    >
                        Delete profile
                    </Button>
                    <Overlay target={delBtn.current} show={msg.type==='deleteProfile'} placement="left">
                        {(props) => (
                            <Tooltip 
                                id="email-msg" 
                                {...props}
                            >
                                {msg.msg}
                            </Tooltip>
                        )}
                    </Overlay>
                </Col>
            </Row>

            {/* 
                Inputs to edit user information. 
                All three in a single row, but on narrow viewports collapse to 1 row each
            */}
            <Row xs={1} sm={1} md={3} lg={3} xl={3}>
                {
                    inputRow.map((item,index)=>{
                        return (
                            <Col key={item.key}>
                                <InputGroup size="sm" className='input-100'>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id={item.id}>{item.icon}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        type={item.type || 'text'}
                                        placeholder={item.name}
                                        aria-label={item.id}
                                        disabled={edit!==item.id}
                                        aria-describedby={item.id}
                                        onChange={e => {
                                            const newUsr={...usr}
                                            newUsr[item.key]=e.target.value
                                            setUsr(newUsr)
                                        }}
                                        value={item.value}
                                    />
                                    <InputGroup.Append>
                                        <Button
                                            variant='outline-dark'
                                            size='sm'
                                            ref={item.ref}
                                            //prevents from double-clicking when request is already sent
                                            disabled={editInProgress}
                                            onClick={() => {
                                                //if input is already being edited, we need to submit
                                                if (edit === item.id) {
                                                    setEditInProgress(true)

                                                    //execute the update that is defined above
                                                    item.function()
                                                        
                                                        //send message of success
                                                        .then(() => {
                                                            msgTimeout(item.name + ' updated successfully',item.id)
                                                            setEdit(null)
                                                        })

                                                        //send message of error
                                                        .catch(err => {
                                                            msgTimeout(err.message,item.id)
                                                        })
                                                } else {
                                                    //otherwise we enable the input for the user to edit
                                                    setEdit(item.id)
                                                }
                                            }}
                                        >
                                            {
                                                //show user that server is already processing the request
                                                edit === item.id
                                                    ? (editInProgress ? 'Updating...' : 'Update')
                                                    : <FaEdit />
                                            }
                                        </Button>
                                        <Overlay target={item.ref.current} show={msg.type===item.id} placement="left">
                                            {(props) => (
                                                <Tooltip 
                                                    id={item.id+'-msg'}
                                                    {...props}
                                                >
                                                    {msg.msg}
                                                </Tooltip>
                                            )}
                                        </Overlay>
                                    </InputGroup.Append>
                                </InputGroup>
                                {
                                    // static link to Google instruction on API key, shown only below the API input
                                    index===inputRow.length-1
                                        ? <div style={{width:'100%', textAlign:'right'}}>
                                            <a 
                                                href='https://cloud.google.com/translate/docs/setup' 
                                                target='_blank' 
                                                rel='noopener noreferrer'
                                                style={{fontSize:12}}
                                            >
                                                How to get Google API key?
                                            </a>
                                        </div>
                                        : null
                                }
                            </Col>
                        )
                    })
                }
            </Row>
            <hr />

            {/* Chart with monthly API usage percentage */}
            <Row><Col><h4>API usage</h4></Col></Row>
            <Row><Col><UsageChart stats={stats}/></Col></Row>
            <hr />

            {/* Glassary editor (allows modify, remove and add items with several languages) */}
            <Row><Col><h4>Glossary</h4></Col></Row>
            <Row><Col><GlossaryEditor glossary={glossary} /></Col></Row>
            
            {/* Confirmation window when user wants to delete profile */}
            <ConfirmPopup
                show={popup}
                header='Delete profile?'
                cancel={()=>setPopupVisible(false)}
                confirm={() => {
                    //close modal window
                    setPopupVisible(false)

                    //try to delete user
                    deleteUser().then(() => {
                        //user is redirescted to "Home", show notification that profile is removed
                        recentlyDeletedProfile(user.uid)
                    })
                    //server could not remove profile due to long auth, show an error
                    .catch(err => {
                        msgTimeout(err,'deleteProfile')
                    })
                }}
            >
                <p>Are you sure you want to delete your profile?</p>
				<p>Your API key, usage stats and glossary will be removed from uor database. This action is irreversible.</p>
            </ConfirmPopup>
        </Container>
    )
}