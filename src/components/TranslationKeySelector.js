import React from 'react';
import {
	Container,
	Row,
	Form,
	Accordion,
	Card,
} from 'react-bootstrap';
import {
	BsChevronDoubleDown,
	BsChevronDoubleUp,
} from 'react-icons/bs';

//contains collapsible list of JSON unique keys. User can check them to translate only some of the keys, not all of them
export function TranslationKeySelector({show,keys,checkKey}){

	//while visibility of the accordion is managed internally by Bootstrap component, this local state will change arrows (up/down)
	const [displayKeys, setDisplayKeys] = React.useState(false);

	//shown only when a JSON file is uploaded
	if(!show){return null}
	
    return (
        <Container fluid>
			<Accordion defaultActiveKey="0">
				<Accordion.Toggle
					as={Card.Header}
					eventKey="0"
					className="hoverableAccordion"
					onClick={() => setDisplayKeys(!displayKeys)} //change arrows up/down
				>
					{displayKeys ? <BsChevronDoubleDown /> : <BsChevronDoubleUp />}
					&nbsp;Click to select JSON keys to translate ({keys.length} unique
					keys)&nbsp;

					{/* arrows are changed base on visibility of the key list */}
					{displayKeys ? <BsChevronDoubleDown /> : <BsChevronDoubleUp />}

				</Accordion.Toggle>
				<Accordion.Collapse eventKey="0">
					<Card.Body className="border-bottom">
						<Row xs={1} sm={3} md={5} lg={7} xl={12}>
							{keys.map((item, i) => {
								return (
									<Form.Check
										key={'key_' + i}
										id={`custom-${i}`}
										label={`${item.key} (${item.count})`}
										onChange={() => checkKey(i)} //select key for translation, managed from Home page
										checked={item.checked}
									/>
								);
							})}
						</Row>
					</Card.Body>
				</Accordion.Collapse>
			</Accordion>
		</Container>
    )
}