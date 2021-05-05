import React from 'react';
import {
    Table,
    Button
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import supportedLanguages from '../lang.json';
import { GlossaryPopup } from './GlossaryPopup'

//part of profile page
//represents table that shows all glossary items current user has
//allows to add/modify/delete glossary items
export function GlossaryEditor({ glossary }) {

    //when user adds/modifies the item in glossary, it is done in a modal window
    const [popupData, setPopupData]=React.useState({visible:false, element:{},id:null})

    //error occurs if some strings are empty or there are less than 2 languages in the edited item 
    const [saveErr, setSaveErr] = React.useState(null)

    //avoid errors if glossary is not loaded for some reason
    if (!glossary?.glossary) { return null }

    return (
        <Table hover responsive size='sm'>
            <thead>
                <tr>
                <th>#</th>

                {/* translations are represented by nested table with two columns: language and string */}
                <th>Translations</th>

                {/* "add new item" button is shown in the table header */}
                <th style={{textAlign:'right'}}>
                    <Button size='sm' variant='success' onClick={() => setPopupData({visible:true, element:{}, id:null})}>
                        <FaPlus/>
                    </Button>
                </th>
                </tr>
            </thead>
            <tbody>
                {   
                    //show all existing glossary items
                    glossary?.glossary.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td style={{verticalAlign:'middle'}}>{index + 1}</td>
                                <td>
                                    {/* translations are represented by nested table with two columns: language and string */}
                                    <Table borderless responsive size='sm' style={{width:'100%',marginBottom:0}}>
                                        <tbody>
                                            {   
                                                //for each key in a single glossary item, show it's language (the key itself)
                                                // and the translation string (value of the key)
                                                Object.entries(item).map(([key, value], i) => {
                                                        //in glossary, languages are stored by their Google Translation code
                                                        //but we want to show the language name instead
                                                        const lngI=supportedLanguages.findIndex(item=>item.code===key)
                                                        const sourceLangName = lngI>=0 ? supportedLanguages[lngI].name : key

                                                    //return a row of two columns for each key
                                                    return (
                                                        <tr key={index + key} style={i>0 ? {borderTop:'1px dashed lightgrey'} : null}>
                                                            <td style={{width:150}}>{sourceLangName}</td>
                                                            <td>{value}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </td>

                                {/* 
                                    separate table cell for 'modify' and 'delete' buttons 
                                    no confirmation for delete here, as it may be bothersome when deleting several items
                                */}
                                <td style={{textAlign:'right',verticalAlign:'middle'}}>
                                    <Button 
                                        size='sm' 
                                        variant='secondary' 
                                        onClick={() => setPopupData({visible:true, element:item, id:index})}
                                    >
                                        <FaEdit />
                                    </Button>
                                    <span> </span>
                                    <Button 
                                        size='sm' 
                                        variant='outline-danger'
                                        onClick={() => glossary.glossaryUpdate({}, index, true)}
                                    >
                                        <FaTimes />
                                    </Button>
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>

            {/* Modal window to add new item or edit an existing one */}
            <GlossaryPopup
                data={popupData}
                saveErr={saveErr}
                onDismiss={(save, element, index)=>{
                    setSaveErr(null)
                    if(save){
                        const a = glossary.glossaryUpdate(element, index, false)
                        if(a){
                            a.then(()=>setPopupData({visible:false, element:{}, id: null}))
                                .catch(err=> setSaveErr(err))
                        }
                    } else {
                        setPopupData({visible:false, element:{}, id: null})
                    }
                }}
            />
        </Table>
    )
 }