import React from 'react'
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';

//modal window that allows to manually translate strings
export function Popup(props) {
    //don't show if not summoned
    if (!props.visible) { return null }

    //indicates the source of the translation: Google, manual or from glossary/firestore
    let source = props.manual ? 'manually translated' : 'Google Translate'
    let color = props.manual ? 'darkblue' : 'black'
    if(props.fromGlossary){
        source = 'glossary'
        color='darkgreen'
    }

    //save the manual translation either once or with glossary update
    const saveHandler = (save, original = false)=>{
        props.onSave(original ? props.from : props.value, props.index, save)
        props.onDismiss()
    }

    
    return (
        <Modal show={true} onHide={props.onDismiss} size="lg">
            <Modal.Header closeButton><h4>Manual translation</h4></Modal.Header>
            <Modal.Body>
                <Row className='margin-row'><Col><b>Original string:</b></Col></Row>
                <Row style={{marginLeft:'10px'}}><Col>{props.from}</Col> </Row>
                <Row className='margin-row'><Col><b>Translation:</b></Col></Row>
                <Row>
                    <Col>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={props.value}
                            onChange={e=>props.onChange(e.target.value)}
                            onKeyUp={e=>e.key==='Enter' && e.ctrlKey ? saveHandler(false) : null}
                            //ctrl + enter saves the translation (without adding to glossary)
                        />
                    </Col> 
                </Row>
                <Row className='margin-row'>
                    <Col className='source'>
                        Source: <span style={{fontWeight:'bold', color}}>{source}</span>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="primary" 
                    onClick={() => saveHandler(false)}                        
                >
                    Save (ctrl + enter)
                </Button>
                <Button 
                    variant="success" 
                    onClick={() => saveHandler(true)}
                >
                    Save & add to glossary
                </Button>
                <Button 
                    variant="secondary" 
                    onClick={() => saveHandler(false, true)}
                >
                    Restore original string
                </Button>
                <Button 
                    variant="secondary" 
                    onClick={props.onDismiss}
                >
                    Close (Esc)
                </Button>
            </Modal.Footer>
        </Modal>
    )
}   