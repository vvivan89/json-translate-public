import React from 'react';
import {Modal,Button} from 'react-bootstrap';

//asks user to confirm action
//used to confirm removal of user profile and removal of already uploaded file
export function ConfirmPopup(props){
    /*
        takes 4 props: 
            -header, 
            -children (main text), 
            -cancel (to simply hide popup)
            -confirm - trigger the action user wants to do
    */
    return (
        <Modal show={props.show} onHide={props.cancel}>
            <Modal.Header closeButton>
                <h3>{props.header}</h3>
            </Modal.Header>
            <Modal.Body>
                {props.children}
                <div className="modalButtons">
                    <Button variant="danger" onClick={props.confirm}>
                        Confirm
                    </Button>
                    <Button variant="light" onClick={props.cancel}>
                        Cancel
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}