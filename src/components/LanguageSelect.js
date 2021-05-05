import React from 'react';
import { Form } from 'react-bootstrap';
import supportedLanguages from '../lang.json';

//select control that allows to choose language

export function LanguageSelect({code, index, languages,change, error}) {
    /*
        languages passed as argument are not always equal to supported languages
        when editing glossary item, we want to make sure that no language is duplicated
        so we remove languages, that are already used in glossary edit form
        but we still need to show current (selected) language, if there is one
    */

    //check if current language is already in the list
    let languageList=[...languages]
    const existingI = languages.findIndex(l=>l.code===code)

    //if there is no such language, add it to the top of the list
    if(existingI===-1){
        const langI = supportedLanguages.findIndex(l=>l.code===code)
        
        //if no language is selected, show invitation to select one
        const currentLang= langI>=0 ? supportedLanguages[langI] : {code:'_', name: "Select Language"}
        languageList=[currentLang,...languages]
    }

    return (
        <Form.Control
            as="select"
            custom
            isInvalid={error && (!code) && index!==null}
            onChange={e => change(e)}
            value={code || '_'}
        >
            {languageList.map(item => {
                return (
                    <option key={item.code} value={item.code}>
                        {item.name}
                    </option>
                );
            })}
        </Form.Control>
    )
}