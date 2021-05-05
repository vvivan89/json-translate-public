import React from 'react';
import {Popover} from 'react-bootstrap';

//static components that show tip about how usage is calculated
//always available to see on hover or focus
export const UsagePopover=(
    <Popover id="popover-usage">
    <Popover.Title as="h3">How is usage calculated?</Popover.Title>
    <Popover.Content>
        <p>
            Please note that this number is only an estimate. 
            The real quota usage can be found in 
            <a href='https://console.cloud.google.com/iam-admin/quotas?service=translate.googleapis.com' target='_blank' rel='noopener noreferrer'>
                &nbsp;Google Cloud Console
            </a>.
        </p>
        <p>
            Usage is calculated as a percentage of 500,000 characters, which is a free monthly limit offered by Google.
            This includes all characters sent to Google API, even the ones that were not translated,
            such as whitespaces or numbers.
        </p>
    </Popover.Content>
</Popover>
)