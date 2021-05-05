import React from 'react';
import {
    Modal,
    Button,
    Table,
    Form
} from 'react-bootstrap';
import supportedLanguages from '../lang.json';
import { FaPlus, FaTimes } from "react-icons/fa";
import { LanguageSelect} from './LanguageSelect'

//Shows modal window where user can edit or create new item for glossary
export function GlossaryPopup({ data, onDismiss, saveErr }) {

    //local stated for glossary item before form submission
    const [item, setItem] = React.useState([])

    // error of form submission (can be less that 2 languages or empty translations)
    const [error, setError] = React.useState(false)

    //on component load check if there is an item passed as props
    //in this case load it to local state to edit
    React.useEffect(()=>{
        if(data.element){
            const arr = Object.entries(data.element).map(([key, value])=>{
                return {
                    code: key,
                    value
                }
            })
            setItem(arr)
        }
    },[data.element])

    //modal window visibility is passed with props
    if(!data?.visible){return null}

    //form submission
    const saveHandler = ()=>{

        //check if there are strings where either translation or language is missing
        //'_' in language code means that "select language" is shown instead of supported language
        const f = item.filter(line=>!line.value || line.code==='_' || !line.code)

        //if there are corrupt items, stop submission
        if(f.length){
            setError(true)
        } else {
            //proceed if no errors found
            setError(false)

            //create final glossary item (Object with keys as language codes)
            const result={}
            item.forEach(line=>{
                Object.defineProperty(result, line.code, {
                    value: line.value,
                    enumerable: true
                })
            })

            //send it to the "Profile" page to handle
            onDismiss(true, result, data.id)
        }
    }

    //check what languages are already used and removes them from
    //available options in "select". This is to ensure that languages are not duplicated
    const usedLanguages=item.map(l=>l.code)
    const notUsedLanguages = supportedLanguages.filter(i=>!usedLanguages.includes(i.code))

    //changes language in a particular "select" element
    const handleLanguageChange = (e,i) =>{
        const newItem = [...item]

        //if i is passed, we change existing "select"
        if(i!==null){
            newItem[i].code = e.target.value
        } else {

            //otherwise we add new line with "select" element and empty text input
            newItem.push({code: e.target.value, value: ''})
        }
        setItem(newItem)
    }

    return (
        <Modal show={true} onHide={()=>onDismiss(false)} size="xl">
            <Modal.Header closeButton>

                {/* if id is passed, this means we are editing the existing element */}
                <h4>{data.id===null ? 'Add new glossary record' : 'Edit glossary record'}</h4>
            </Modal.Header>
            <Modal.Body style={{maxHeight:'65vh', overflowY:'scroll'}}>
                <Table responsive size='sm' borderless>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Language</th>
                            <th>String</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            //add same table row for each language that user selected
                            item.map((line,i)=>{
                                return (
                                    <tr key={line.code}>
                                        <td style={{width:30, verticalAlign:'middle'}}>{i+1}</td>
                                        <td style={{width:'20%'}}>

                                            {/* Language that user already selected with options to select any other unused language */}
                                            <LanguageSelect
                                                code={line.code}
                                                index={i}
                                                languages={notUsedLanguages}
                                                error={error}
                                                change={e=>handleLanguageChange(e,i)}
                                            />
                                        </td>
                                        <td>

                                        {/* Text of the translation string in selected language */}
                                        <Form.Control
                                            onChange={e => {
                                                const newItem = [...item]
                                                newItem[i].value = e.target.value
                                                setItem(newItem)
                                            }}
                                            value={line.value || ''}
                                            isInvalid={error && !line.value} //invalid if empty (but show only after attempt to submit form)
                                        />
                                        </td>
                                        <td style={{width:35}}>

                                            {/* button to remove current line completely (no confirmation needed) */}
                                            <Button 
                                                // size='sm' 
                                                variant='outline-danger'
                                                onClick={() => {
                                                    const newItem = [...item]
                                                    newItem.splice(i,1)
                                                    setItem(newItem)
                                                }}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })
                        }

                        {/* 
                            after already added languages, there is a control to select a new language.
                            If nothing is selected, this control does no affect the form submission.
                            When user select language here, this adds new item to current languages array,
                            with empty string. It is then shown in "item.map" above, while this control
                            again represents a new item
                        */}
                        <tr>
                            <td style={{verticalAlign:'middle'}}><FaPlus/></td>
                            <td>
                                <LanguageSelect 
                                    index={null}
                                    languages={notUsedLanguages}
                                    error={error}
                                    change={e=>handleLanguageChange(e,null)}
                                />
                                </td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>

            {/* Footer shows errors and "submit" button */}
            <Modal.Footer>
                {
                    //if there are less than two languages, submit button is disabled and user is shown a notification
                    item.length<2 &&
                    <div style={{marginRight:10}}>
                        Please add at least two languages before save
                    </div>
                }
                {
                    //when user tries to submit corrupt items, error is shown
                    //saveErr is passed when Firebase was not able to save element in the database
                    error &&
                    <div style={{marginRight:10, color:'red', fontWeight:'bold'}}>
                        {
                            saveErr || 'There are some errors in your glossary record. Please check empty values or not selected languages'
                        }
                    </div>
                }
                <Button 
                    variant="primary" 
                    onClick={saveHandler}
                    disabled={item.length<2}                        
                >   
                    Save
                </Button>
                <Button 
                    variant="danger" 
                    onClick={() => onDismiss(false)}                        
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )

}