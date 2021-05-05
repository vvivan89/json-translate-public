import React from 'react';
import {
	Container,
	Row,
	Col,
	InputGroup,
	FormControl,
	Button,
	OverlayTrigger,
	Tooltip
} from 'react-bootstrap';
import { BsX } from 'react-icons/bs';
import { ConfirmPopup } from '../components/ConfirmPopup';
import { LanguageSelect} from './LanguageSelect'
import supportedLanguages from '../lang.json';

/*
	Represents a row of controls for the translation:
		- uploaded file name (with possibility to remove it)
		- language of the file (auto detected and shown only when Google API is used)
		- target language (possible to choose, shown only when Google API is used)
		- Translate button
		- Download button
*/
export function TranslationMenu({ 
    cleanup, setTargetLang, file, sourceLang, checkedCount,
    targetLang, api,translate,translationStatus,makeFile 
}) {
    //visibility of the modal window that asks to confirm removal of uploaded file
	const [fileAlert, setAlertVisible] = React.useState(false);
	
	//when Translate button is disabled, show tooltip
	//that invites to select target language first
    const [showTranslateTooltip, setTranslateTooltip] = React.useState(false);
	const disabledButton = targetLang === '_' && api.key

	//if the language of the file is known, show its name rather than code
    const i=supportedLanguages.findIndex(item=>item.code===sourceLang)
	const sourceLangName = i>=0 ? supportedLanguages[i].name : sourceLang

	//pass the handling to App, but close the modal window
    const cleanup2=()=>{
        cleanup()
        setAlertVisible(false)
    }

	//if the Translate button is enabled, never show tooltip
	//otherwise toggle tooltip visibility
    const toggleTranslateButtonTooltip = () =>
    	setTranslateTooltip(disabledButton ? !showTranslateTooltip : false);

	//menu is shown only after user upload a correct JSON file
	if (!file) { return null }
	
    return (
		<Container fluid className="translationMenu">
			
			{/* 
				All controls should be in a single row,
				but on narrower screens we first move buttons to the second row,
				then make each control to take the whole row
			*/}
			<Row xs={1} sm={1} md={3} lg={5} xl={5}>
				<Col style={{ borderRight: '1px solid lightgrey' }}>
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text id="username">Uploaded file</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							placeholder="File"
							aria-label="File"
							aria-describedby="file"
							readOnly={true}
							value={file}
						/>
						<InputGroup.Append>
							<InputGroup.Text id="changeFile">
								<BsX
									className="hoverableCloseButton"
									onClick={() => setAlertVisible(true)}
								/>
							</InputGroup.Text>
						</InputGroup.Append>
					</InputGroup>
				</Col>
				{
					// then next two controls (source and target languages)
					//are shown only when Google API key is not empty
					api.key &&
					<>
						<Col>
							<InputGroup>
								<InputGroup.Prepend>
									<InputGroup.Text id="username">Original language</InputGroup.Text>
								</InputGroup.Prepend>
								<FormControl
									placeholder="Lang-from"
									aria-label="Lang-from"
									aria-describedby="lang-from"
									readOnly={true}
									//prior to the translation we don't know the source language
									value={sourceLangName || 'will be detected'}
								/>
							</InputGroup>
						</Col>
						<Col style={{ borderLeft: '1px solid lightgrey' }}>
							<InputGroup>
								<InputGroup.Prepend>
									<InputGroup.Text id="username">Translate to: </InputGroup.Text>
								</InputGroup.Prepend>
								<LanguageSelect
									code={targetLang || '_'}
									index={i}
									languages={supportedLanguages}
									error={false}
									change={e => setTargetLang(e.target.value)}
								/>
							</InputGroup>
						</Col>
					</>
				}
				<Col>
					
					{/* Shows that button is disabled because to target language is selected */}
                    <OverlayTrigger
                        show={showTranslateTooltip}
                        defaultShow={false}
                        overlay={
                            <Tooltip id="tooltip-disabled">
                                Please select language first
                            </Tooltip>
                        }
                        onToggle={toggleTranslateButtonTooltip}
                    >
                        <div>
                            <Button
                                variant="primary"
                                block
								onClick={translate}
								//when request is sent, we prevent double-clicking
								disabled={translationStatus === 'progress' || disabledButton}
								
								//pointerEvents interfere with tooltip, so remove them
								//but only when we need a tooltip (e.g. button is disabled)
                                style={ disabledButton ? { pointerEvents: 'none' } : null }
                            >
                                {translationStatus === 'progress'
									? 'Translating...' //when request is sent
									
									//when no API key, we don't actually translate anything
									//just show keys to translate them manually
									: `${api.key ? 'Translate ' : 'Show '} ${
									
											//when no keys are selected, we will translate
											//or show all the JSON contents
                                            checkedCount ? 'selected' : 'all'
                                        } keys`}
                            </Button>
                        </div>
                    </OverlayTrigger>
                </Col>
				<Col>
					
					{/* 
						if file was not translated, it is still possible to downloads
						The result will be the original file, but formatted.
						Classical JSON: each key on the new line
					*/}
					<Button
						// if file is not translated, button is yellow, otherwise green
                        variant={translationStatus === 'done' ? 'success' : 'warning'}
                        onClick={makeFile}
                        block
                    >
                        Download{translationStatus === 'done' ? ' translation' : ' formatted original'}
                    </Button>
                </Col>
			</Row>

			{/* Modal asks confirmation of removal of uploaded file */}
			<ConfirmPopup
				header={`Remove ${file}?`}
				confirm={cleanup2}
				cancel={()=>setAlertVisible(false)}
				show={fileAlert}
			>
				<p>Are you sure you want to remove this file?</p>
                <p>Current progress will be lost.</p>
			</ConfirmPopup>
		</Container>
    )
}