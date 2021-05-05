import React from 'react';
import {Popover} from 'react-bootstrap';

//static component that shows info on how to get Google API key
export const GooglePopover =(
        <Popover id="popover-google">
            <Popover.Title as="h3">How to get Google API key?</Popover.Title>
            <Popover.Content>
                <p>
                You must have a project on Google Cloud Platform. Translation API is
                free if you do not exceed 500,000 characters per month. (Thas is
                actually the reason I ask you to bring your own API key)
                </p>
                <p>
                Please follow
                <a
                    target="_blank"
                    href="https://cloud.google.com/translate/docs/setup"
                    rel="noopener noreferrer"
                >
                    &nbsp;this instruction
                </a>
                </p>
            </Popover.Content>
        </Popover>
    )