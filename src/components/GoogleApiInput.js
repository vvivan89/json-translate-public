import React from 'react';
import {
  InputGroup,
  FormControl,
  Button,
  OverlayTrigger,
} from 'react-bootstrap';
import { FaCode } from "react-icons/fa";
import { GooglePopover } from './GooglePopover'

//input that is shown only to unlogged users. Allows to use own Google API key without user profile
export function GoogleApiInput({ value, onChange }) {

  return (
    <InputGroup size="sm" className="mb-3 input-100" id='googleApiInput'>
      <InputGroup.Prepend>
        <InputGroup.Text id="inputGroup-sizing-sm">
          <FaCode/>
        </InputGroup.Text>
      </InputGroup.Prepend>

      {/* input is controlled all the way up - from App component */}
      <FormControl
        placeholder='Google API key'
        aria-label="Small" 
        aria-describedby="inputGroup-sizing-sm" 
        onChange={(e)=>onChange(e.target.value)} 
        value={value} 
      />

      {/* question mark that show additional info on hover (for desktop) and focus (for mobile) */}
      <InputGroup.Append>
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="left"
          overlay={GooglePopover} //Show static info in popover window: info on how to get Google API key
        >
          <Button variant="link">
            <span style={{fontWeight:'bold'}}>?</span>
          </Button>
        </OverlayTrigger>
      </InputGroup.Append>
    </InputGroup>
  );
}
