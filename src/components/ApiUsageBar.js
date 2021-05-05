import React from 'react';
import {
  InputGroup,
  FormControl,
  Button,
  OverlayTrigger,
} from 'react-bootstrap';
import { FaTachometerAlt } from "react-icons/fa";

//info on usage quota by Google (static)
import { UsagePopover } from '../components/UsagePopover'

//shows how many characters are used by Google Translate API
export function ApiUsageBar({session, usage}){
    
    //session is shown if user is not logged in
    let usageText=session ? 'Session: ' : 'Month: '

    return (
        <InputGroup size="sm" className='input-100'>
            <InputGroup.Prepend>
                <InputGroup.Text id="apiUsage">
                    <FaTachometerAlt/>
                </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                disabled={true}
                value={usageText + (usage || 'n/a')}
            />
            <InputGroup.Append>
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="left"
                    overlay={UsagePopover}
                >
                    <Button variant="link">
                        <span style={{fontWeight:'bold'}}>?</span>
                    </Button>
                </OverlayTrigger>
            </InputGroup.Append>
        </InputGroup>
    )
}