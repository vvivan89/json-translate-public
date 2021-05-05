import React from 'react';
import {Container,Row,Col} from 'react-bootstrap';

/*
	represents the result of the translation
	layout is not a table because of the specific behavior on narrow viewports:
	there are two columns, one for lie number and key, one for original and translated strings. 
	Both these columns stay in a single row regardless of the viewport.
	But, inside each these two columns, data is split into 2 columns as well.
	These nested columns expand on narrower viewports and are located one below another.
	Also the dashed line between them is added. Comparing to table, this view is better
	on smaller screens as it does not require horizontal scroll.
*/

export function TranslationTable({rows, rowClick, show}){
    if (!show){return null}
    return (
		<Container fluid>

			{/* 
				Header row: same as all data rows, includes 2 columns
			*/}
			<Row className='keyTableRow tableHeader'>

				{/* 
					Column one, includes a row with two nested columns: row number and JSON key 
					Takes 1/6 to 1/3 of the width depending on the viewport
				*/}
				<Col lg={2} xl={2} md={2} sm={3} xs={4}>

					{/* align-items: center is used to vertically center items in this row when translations strings are very long */}
					<Row style={{alignItems:'center'}}>

						{/* Number column takes 1/3 of the width or full width on narrow screens */}
						<Col lg={3} xl={3} md={3} sm={12} xs={12}>
							#
						</Col>

						{/* Key column takes 2/3 of the width or full width on narrow screens */}
						<Col lg={8} xl={8} md={8} sm={12} xs={12}>
							Key
						</Col>
					</Row>
				</Col>

				{/* Column two, includes a row with two equal-width columns for original and translation */}
				<Col lg={10} xl={10} md={10} sm={9} xs={8}>
					<Row>

						{/* class "cellFrom" is italic and also adds bottom dashed border on narrow screens */}
						<Col lg={6} xl={6} md={6} sm={12} xs={12} className='cellFrom'>
							Original
						</Col>
						<Col lg={6} xl={6} md={6} sm={12} xs={12}>
							Translation&nbsp;
							<span style={{ color: 'black', fontWeight: 'normal' }}>
								(color coding:
								<span className="manual"> manually</span>,
								<span className="glossary"> from glossary</span>,
								<span> automatic</span>)
							</span>
						</Col>
					</Row>
				</Col>
			</Row>
			{rows.map((item, i) => {

				//same layout as described in header
				return (
					<Row
						className='keyTableRow hoverable'
						key={item.key+ i}
						onClick={() => rowClick(item, i)}
					>
						<Col lg={2} xl={2} md={2} sm={3} xs={4}>
							<Row style={{alignItems:'center'}}>
								<Col lg={3} xl={3} md={3} sm={12} xs={12}>
									{i+1}
								</Col>
								<Col lg={8} xl={8} md={8} sm={12} xs={12}>
									{item.key}
								</Col>
							</Row>
						</Col>
						<Col lg={10} xl={10} md={10} sm={9} xs={8}>
							<Row>
								<Col lg={6} xl={6} md={6} sm={12} xs={12}  className='cellFrom'>
									{item.from}
								</Col>
								<Col
									lg={6} xl={6} md={6} sm={12} xs={12}
									className={`${item.manual ? 'manual' : ''} ${
										item.fromGlossary && !item.manual ? 'glossary' : ''
									}`}
								>
									{item.to}
								</Col>
							</Row>
						</Col>
					</Row>
				);
			})}
		</Container>
	)
}