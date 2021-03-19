import React from 'react'
import fetch from 'node-fetch'
import { Container, Button, Row, Col, Form, Accordion, Card, Table } from 'react-bootstrap';

import fb from './firebase' //glossary is represented by firestore database
import { Popup } from './Popup';

//Google Translate API is used serverlessly, by sending POST requests
const translateURL = `https://translation.googleapis.com/language/translate/v2?key=${fb.api}`

//all the translation work is done here
export function Translator() {
    //load glossary when the page is loaded
    const [glossary, setGlossary] = React.useState({loading:false, data:[]})

    //JSON keys state: what keys there are,  to translate, etc...
    const [displayKeys, setDisplayKeys] = React.useState(false)
    const [keys, setKeys] = React.useState([])
    const [translationStatus, setTranslationStatus] = React.useState(null)
    const [translationKeys, setTranslationKeys] = React.useState([])
    
    // manages the state of modal window that allows for manual translation
    const [popupVisible, setPopupVisible] = React.useState(false)
    const [popupData, setPopupData] = React.useState({})
    
    //default translation options
    //currently there's no options to change source lang manually, it is detected by Google
    //source lang is currently used only to update glossary
    const [targetLang, setTargetLang] = React.useState('ru')
    const [sourceLang, setSourceLang] = React.useState('en')
    
    //input file name and data (used to create a new file to download)
    const [file, setFile] = React.useState({})

    //state of translation or file reading error
    const [error, setError] = React.useState(false)

    //name of the output file, used to initiate its download
    const [fileName, setFileName] = React.useState('')

    //ref used to emulate user click on link to download file
    const aRef = React.useRef()


    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        //when the name of the output file is set, initiate its download
        //by emulating the clicking 
        if (fileName) {
            aRef.current.click()
            setFileName('')
        }
        //start glossary loading immediately when the page is shown
        if(!glossary.loading){
            setGlossary({loading:true, data:[]})
            fb.loadGlossary().then(res =>handleGlossary(res))
        }
    })

    //when the glossary is loaded, apply it and save to the page state
    const handleGlossary = gl =>{
        //if something is translated, apply glossary translation to it
        //used when glossary is modified, to update all items that use same glossary string
        if (translationKeys.length){
            const newKeys = translationKeys.map(key=>{

                //search if item is affected by glossary change
                const i = gl.findIndex(item=>item[sourceLang]===key.from)

                //if some strings are translated manually but are affected by glossary change, we keep manual translation
                const condition = i>=0 && gl[i] && gl[i][targetLang]
                return {
                    ...key,
                    to: condition ? gl[i][targetLang] : key.to,
                    fromGlossary: condition //used to color-code a source of the translation
                }
            })

            //update state of translated items
            setTranslationKeys(newKeys)
        }

        //send to state
        setGlossary({loading:true, data:gl})
    }

    //upload the JSON file
    //does not fire when user has a file uploaded and tries to upload it again
    const handleChange = e => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onloadend = () => {
            //if the file is JSON, process it and sand to state
            try {
                const parsed = JSON.parse(fileReader.result)
                setFile({name:e.target.files[0].name, data:parsed})
                getKeys(parsed) //parse JSON keys

                //cleanup if there was some previous work with another file
                setError(false)
                setTranslationStatus(null)
                setTranslationKeys([])
                setDisplayKeys(false)
            }catch(e){
                //show error that file is not JSON
                setError(true)
            }
        };
    }

    //recursive JSON keys parsing
    const getKeys = obj => {
        //all keys of the JSON object will be here
        const keyArray = [];

        //recursive part to get to nested objects/arrays in JSON
        //we keep only those keys that have string or number as value
        const recurse = (key, value) => {
            if (Array.isArray(value)) {
                //if value is an array, we keep the key and and parse an array until we get strings/numbers
                value.forEach(item=>recurse(key, item))
            } else if (value instanceof Object) {
                //if value is a nested object, recursively parse all its keys
                Object.entries(value).forEach(([k, val]) => { 
                    recurse(k, val)
                })
            } else if(!!value) {keyArray.push(key)} //when finally found strings/numbers, save the key to the array
        }
        recurse('',obj)

        //as a result of recursive function, we get an array with all keys
        //we need to show only unique ones, however, the quantity of items for these keys will be shown
        const resultArray = Array.from(new Set(keyArray))
        const result = resultArray.map(key => {
            const count = keyArray.filter(item=>item===key).length //get then quantity of items with this key
            return {
                key,
                count,
                checked: false //state for future translation
            }
        })

        //send all keys to state
        setKeys(result)
    }

    //check the key to translate
    //when any key is checked or unchecked, we need to perform translation again
    const checkKey = i => {
        const newKeys = [...keys]
        newKeys[i].checked = !newKeys[i].checked
        setKeys(newKeys)

        //cleanup of current translation status
        setTranslationStatus(null)
        setTranslationKeys([])
    }

    //this will show number of keys on the "Translate" button
    const checkedCount = keys.filter(item => item.checked).length

    //automated translation process using Google API
    //recursive as it again loops through all nested items in the JSON object
    const translate = () => {
        //cleanup
        setError(false)

        //disables the "Translate" button
        setTranslationStatus('progress')

        //get all the keys that must be translated
        let checkedKeys = checkedCount ? keys.filter(item => item.checked) : [...keys]
        checkedKeys = checkedKeys.map(item=>item.key)

        //translations will be store here
        const keyArray = []

        //recursive part, same as with key parsing
        const recurse = (key, value) => {
            if (Array.isArray(value)) {
                //keep the key, parse array items
                value.forEach(item=>recurse(key, item))
            } else if (value instanceof Object) {
                //parse all keys of the nested object
                Object.entries(value).forEach(([k, val]) => { 
                    recurse(k, val)
                })
            //found the string/number -> check if the key must be translated
            } else if(checkedKeys.includes(key) && value) {
                //if yes, add the key and value to the translation array
                keyArray.push({
                        key,
                        from: value,
                        to:value,
                        fromGlossary: false
            })}
        }
        recurse('', file.data)

        //stringify numbers (otherwise Google will throw an error)
        const translations = keyArray.map(item=>typeof item.from==='string' ? item.from: item.from.toString())

        //split array of strings to parts of 100
        //I don't know max length of array for translation, but ~170 items were too much, Google threw an error
        const parts = Math.ceil(translations.length/100)
        const finalTranslatedArray=[]

        //translation with POST request to the API
        //100 items per request
        //recursion is used instead of loop because each next step 
        //must be invoked only after the previous one is finished (inside ".then")
        //otherwise parts of initial translation array will be mixed up
        const recursiveTranslation = ind =>{
            //split array of strings to parts of 100
            const translationPart = translations.slice(ind*100,(ind+1)*100)

            //send POST request, link with API key is declared on top of the file
            fetch(translateURL, {
                method:'POST',
                body:JSON.stringify({
                    q:translationPart,
                    target: targetLang
                })
            })
            .then(res => res.json())
            .then(res=>{
                const translatedArray = res?.data?.translations
                //translations are returned in an array
                //if something went wrong, there will be no array, but some error code instead
                if(Array.isArray(translatedArray)){
                    finalTranslatedArray.push(...translatedArray)
                } else {
                    console.log(res)
                    setError('Translation error, try again')
                }

                //if this is the last part, of the initial array,
                //process all the data, save it to state update the page
                if(ind===parts-1){

                    //trying to get source language of the text (used to write new strings to glossary)
                    //first, get the detected language of each translated string
                    const detectedLangArray = finalTranslatedArray.map(item=>item.detectedSourceLanguage)

                    //then, get all unique detected languages and number of strings that are supposed to be in this language
                    const detectedLang = Array.from(new Set(detectedLangArray))
                        .map(item=>{
                            return {
                                lang:item,
                                count: detectedLangArray.filter(l=>l===item)?.length || 0
                            }
                        })
                        //pop the language with most strings on top
                        .sort((a,b)=>b.count-a.count)

                    //the JSON file is assumed to be written in only one language
                    //to the language that is detected most times would be the correct one
                    if(detectedLang.length && detectedLang[0].lang!==sourceLang){
                        setSourceLang(detectedLang[0].lang)
                    }

                    //if there's something to output, assign translations to the original strings and check glossary
                    if(finalTranslatedArray.length){
                        setTranslationKeys(keyArray.map((item,i)=>{
                            //use the detected language or English (because it is the most used one in this app)
                            const lang = finalTranslatedArray[i]?.detectedSourceLanguage

                            //find strings in glossary that match original string that needs to be translated
                            const glossaryCheck = glossary.data.filter(gl=>[gl.en, gl[lang]].includes(item.from))

                            //keep %placeholders% that tend to be translated wrong in some cases
                            //if nothing is found in the glossary, this will be used
                            let to = replacements(finalTranslatedArray[i]?.translatedText)

                            //if something found in glossary, replace Google translation with a glossary string
                            let fromGlossary = false;
                            if(glossaryCheck.length && glossaryCheck[0][targetLang]){
                                to=glossaryCheck[0][targetLang]
                                fromGlossary = true
                            }
                            return {
                                ...item,
                                to,
                                fromGlossary
                            }
                        }))
                    } else {
                        //if Google translation returned an error, we could still show the original strings for selected keys
                        setTranslationKeys(keyArray)
                    }
                    //indicates that translation is done, unblocks the "Translate" button
                    setTranslationStatus('done')
                } else {
                    //if the translated part is not the last, call the translation of the next part
                    recursiveTranslation(ind+1)
                }
            })
            .catch(e=>{
                setError(e.message)
            })
        }
        //call the translation of the first part
        recursiveTranslation(0)
    }

    //some %placeholders% are not translated correctly. We don't want to keep them in the glossary, so just replace right here
    const replacements = string =>{
        if(!string){return ''}
        //items that are translated incorrectly
        const replArray=[
            {from:'%см%', to:'%cm%'},
            {from:'% см%', to:'%cm%'},
            {from:'%кг%', to:'%kg%'},
            {from:'% кг%', to:'%kg%'},
        ]

        //replace on number will throw an error
        //TODO: actually, in this case function can just return the passed string
        let result = typeof string === 'number' ? string.toString() : string;

        //loop through all the replacement vars and find all inclusions (using "gi" regexp)
        replArray.forEach(item=>{
            const re = new RegExp(item.from, 'gi');
            result = result.replace(re,item.to)
        })
        return result
    }

    //Google Translate API is free for first 500k chars a month
    //so this counter will give an idea of how much is used for each translations
    const charCount = translationKeys.map(item => typeof item.from ==='string' ? item.from : item.from.toString()).reduce((a, b) => a + b.length, 0)
    
    //opens modal window to edit the translation manually
    const rowClick = (item, index) => {
        setPopupData({
            ...item,
            index, //uses array index to update the correct string
            tempValue:''
        })
        setPopupVisible(true)
    }

    //manages the manual translation:replaces the particular string and invokes the glossary update if needed
    //save stand for saving the manually edited translation as a glossary string
    const newTranslation = (value, i, save) => {

        //updates translation
        const newKeys = [...translationKeys]
        newKeys[i] = {
            ...translationKeys[i],
            to: value,
            manual:!save //if save, the translation will be from glossary, otherwise it is just manual
        }
        if(save){
            //save sting to database and only then update the state of the app
            fb.addToGlossary(newKeys[i].from, value,glossary.data, targetLang, sourceLang).then(()=>{
                //update current translation
                setTranslationKeys(newKeys)

                //reset the glossary state, that will invoke the update of all stings 
                //that are affected by the glossary change (from useEffect hook)
                setGlossary({loading:false, data:[]})
            })
        } else {
            //update app state
            setTranslationKeys(newKeys)
        }
    }

    //create file with translated keys
    //recursive, uses the same logic as key parsing
    const makeFile = () => {

        //easy way to create a new object from the uploaded file data
        //we mutate output, but do not want to mutate the data from uploaded file
        //note: spread will not help on a nested level
        const output = JSON.parse(JSON.stringify(file.data))

        if (translationKeys.length) {
            //iterator is used to take the correct string from the translated array
            //iterator will increase each time when recursive function finds match
            let i = 0

            //unlike previous two, this recursion takes the third parameter
            //result is a nested part of the output object that will be mutated
            const recurse = (key, value, result) => {
                if (Array.isArray(value)) {
                    //inside the array we have to check all items
                    //if items is an array or object, go to the deeper level
                    //but is array item is string (or number), we want to check if it needs to be updated with translation
                    value.forEach((item, index) => {
                        //translationKeys[i] is to check if there is next translation item or if we are done
                        if(translationKeys[i] && ['string','number'].includes(typeof item) && translationKeys[i].from === item ){
                            //if translation for this string is found, update output with the translated string
                            //numbers  in translation array are stored as strings and must be converted back to numbers
                            if(result[key] && result[key][index]){
                                result[key][index] = typeof item==='number' ? Number(translationKeys[i].to) : translationKeys[i].to
                            }
                            //move to next translated string in the array
                            i++
                        } else {
                            //if array item is not a string/number, move to the next level of nesting
                            //for arrays, key is not passed to the recursion, previous level key must be used
                            //if there's already no key passed in this iteration, we are in the nested array and we pass the whole array to mutate
                            recurse('', item, key ? result[key][index] : result, index)
                        }
                    })
                } else if (value instanceof Object) {
                    //loop through all keys of the nested object
                    Object.entries(value).forEach(([k, val]) => {
                        //if no key passed to this iteration, we are inside the array and we pass the whole array to be mutated
                        recurse(k, val, key ? result[key] : result)
                    })
                //if we found a string/number, update it with the translated one by mutating the result
                } else if (translationKeys[i] && (translationKeys[i].key === key || key==='') && translationKeys[i].from === value) {
                    //if result is a string or an array, we could not mutate it
                    //this should not happen, but to avoid errors, "if" wrapper is used
                    if(result instanceof Object){
                        //numbers  in translation array are stored as strings and must be converted back to numbers
                        result[key] = typeof value==='number' ? Number(translationKeys[i].to) : translationKeys[i].to
                    }
                    //move to next translated string in the array
                    i++
                }
            }

            //start recursion from the top level (whole file)
            recurse('',output, output)
        }

        //create a file with the new JSON object
        const blob = new Blob([JSON.stringify(output, null, 4)]);

        //create a URL that is then used in a "ref" element
        //to emulate user click on a download link and actually download the file
        const fileDownloadUrl = URL.createObjectURL(blob);

        //invokes click on a "ref" item from useEffect hook
        setFileName(fileDownloadUrl)
    }

    return (
        <Container fluid>
            <Row className='top-row' xs={1} sm={1} md={3} lg={3} xl={3} >
                <Col>
                    <Form.Label>Upload file in JSON format: </Form.Label>
                    <Form.Control
                        type='file'
                        onChange={handleChange}
                    />
                    {
                        error && 
                        <div className='error'>
                            {error!==true ? error : 'Error: file is not a valid JSON'}
                        </div>
                    }
                </Col>
                <Col>
                    <Form.Label>Target language: </Form.Label>
                    <Form.Control
                        as='select'
                        value={targetLang}
                        custom
                        onChange={e=>{
                            setTargetLang(e.target.value)
                            setTranslationStatus(null)
                            setTranslationKeys([])
                        }}
                    >
                        <option value='ru'>Russian</option>
                        <option value='en'>English</option>
                    </Form.Control>
                </Col>
                <Col style={{textAlign:'right'}}>
                    <Button variant='secondary' onClick={()=>fb.auth.signOut()}>Sign out</Button>
                </Col>
            </Row>
            <Row>
                <Col style={{padding:0}}>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Toggle 
                            as={Card.Header} 
                            eventKey="0" 
                            className='hoverable'
                            onClick={()=>setDisplayKeys(!displayKeys)}
                        >
                            {
                                file.name ? `${displayKeys 
                                    ? 'Hide':'Show'} JSON keys (${keys ? keys.length : 0})` 
                                    : 'No keys as you need to upload file first'
                            }
                        </Accordion.Toggle>
                        {
                            keys.length>0 &&
                            <Accordion.Collapse eventKey="0">
                                <Card.Body className='border-bottom'>
                                    <Row xs={1} sm={3} md={5} lg={7} xl={12} >
                                    {
                                        keys.map((item, i) => {
                                            return (
                                                <Form.Check 
                                                    key={'key_' + i}
                                                    id={`custom-${i}`}
                                                    label={`${item.key} (${item.count})`}
                                                    onChange={()=>checkKey(i)}
                                                    checked={item.checked}
                                                />
                                            )
                                        })
                                    }
                                    </Row>
                                </Card.Body>
                            </Accordion.Collapse>
                        }
                    </Accordion>
                </Col>
            </Row>
            <Row className='margin-row'>
                <Col>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        block
                        onClick={translate}
                        disabled={translationStatus === 'progress' || !file.name}
                    >
                        {
                            translationStatus !== 'progress'
                                ? file.name 
                                    ? `Translate ${checkedCount ? 'selected ' : 'all '}
                                        keys using Google Translate ${checkedCount ? '(' + checkedCount + ')' : ''}`
                                    : 'Translation is not possible before you upload a file'
                                : `Loading translation`
                        }
                    </Button>
                </Col>
            </Row>
            <Row> 
                <Col>
                    {
                        translationStatus==='done' &&
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Key</th>
                                    <th>Original ({charCount} chars)</th>
                                    <th>
                                        Translation&nbsp;
                                        <span style={{color:'black', fontWeight:'normal'}}>
                                            (color coding: 
                                            <span className='manual'> manually</span>, 
                                            <span className='glossary'> from glossary</span>, 
                                            <span> automatic</span>)
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                translationKeys.map((item,i) => {
                                    return (
                                        <tr
                                            key={'result_item_' + i}
                                            className='hoverable'
                                            onClick={()=>rowClick(item,i)}
                                        >
                                            <td>{i + 1}</td>
                                            <td>{item.key}</td>
                                            <td>{item.from}</td>
                                            <td className={`${item.manual ? 'manual':''} ${item.fromGlossary ? 'glossary' : ''}`}>{item.to}</td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </Table>
                    }
                </Col>
            </Row>
            <Row className='margin-row'>
                <Col>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        block
                        onClick={makeFile}
                        disabled={!file.name}
                    >
                        {
                            file.name
                                ? `Download ${translationStatus==='done' ? 'translated' : 'original (but formatted)'} JSON`
                                : 'Nothing to download: please upload file first'
                        }
                    </Button>
                </Col>
            </Row>
            <a
                style={{ display: 'none' }}
                download={file.name || 'download.json'}
                href={fileName}
                ref={aRef}
            >
                1
            </a>
            <Popup
                visible={popupVisible}
                onDismiss={() => setPopupVisible(false)}
                onSave={(value, i, save) => newTranslation(value, i, save)}
                value={popupData.tempValue || popupData.to}
                onChange={(value) => setPopupData({
                    ...popupData,
                    tempValue:value
                })}
                {...popupData}
                />
        </Container>
    )
}