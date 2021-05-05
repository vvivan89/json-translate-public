import React from 'react';
import {
	Container,
} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { BsPlus } from 'react-icons/bs';

//represents large rectangle where user can drop files (or click to select it in a classical way)
export function FileDropArea({handleFileUpload, error, show}){

    //shows only when no file is already uploaded
    if(!show){return null}

    return (
        <Container style={{marginTop:15}}>
            <Dropzone onDrop={acceptedFiles => handleFileUpload(acceptedFiles)}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div {...getRootProps()} className="dropZone">
                            <input
                                {...getInputProps()}
                                multiple={false}
                                accept=".json"
                                onChange={e => handleFileUpload(e.target.files)}
                            />
                            <div>
                                <p>Drag JSON file here or click to select</p>
                                <p>
                                    <BsPlus style={{ fontSize: '80px' }} />
                                </p>
                                {error && (
                                    <p className="translationError">
                                        Selected file is not a valid JSON. Please select another
                                        file.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </Dropzone>
        </Container>
    )
}