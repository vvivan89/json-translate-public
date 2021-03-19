import firebase from 'firebase'
import 'firebase/firestore'
import "firebase/auth";

//create config for firestore login
const apiKey = process.env.REACT_APP_apiKey
const authDomain = process.env.REACT_APP_authDomain
const databaseURL = process.env.REACT_APP_databaseURL
const projectId = process.env.REACT_APP_projectId
const storageBucket = process.env.REACT_APP_storageBucket
const messagingSenderId = process.env.REACT_APP_messagingSenderId
const measurementId = process.env.REACT_APP_measurementId
const appId = process.env.REACT_APP_appId
const firebaseConfig = {apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId, measurementId};

//initialize firestore if it is not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

//using only two functions: cloud firestore to save glossary and auth to prevent paid usage of Translate API
const db = firebase.firestore()
const auth = firebase.auth()

//loads all items from glossary
const loadGlossary = async ()=>{
    const value = [];
    const collectionData = await db.collection('glossary')
            .get()
            .catch(e => console.log(e))
    if (collectionData?.docs?.length) {
        collectionData.forEach(doc => value.push({id: doc.id, ...doc.data()}))
    }
    return value
}

//adds or modifies items in glossary
const addToGlossary = async (from, to, glossary, targetLang, sourceLang) =>{

    //find if there is such item already
    const filtered = glossary.filter(item=>item[sourceLang]===from)

    //if there's no item, we add it
    if(!filtered.length){
        const newItem = {}
        Object.defineProperty(newItem, targetLang,{value:to, enumerable:true})
        Object.defineProperty(newItem, sourceLang,{value:from, enumerable:true})
        await db.collection('glossary').add(newItem)
    } else {
    //if the item exists, we modify the string in the target language
        const id = filtered[0].id
        const newItem={...filtered[0]}
        delete newItem.id
        newItem[targetLang] = to
        await db.collection('glossary').doc(id).set(newItem)
    }
}

//export functions and Google Translate API key as well (which is the same as Firebase API key)
// eslint-disable-next-line
export default {
    api:firebaseConfig.apiKey,
    loadGlossary,
    addToGlossary,
    auth
}