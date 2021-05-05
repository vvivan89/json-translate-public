import firebase from 'firebase'
import 'firebase/firestore'
import "firebase/auth";

//create config for firestore login, that is stored in local ".env" file
const apiKey = process.env.REACT_APP_apiKey
const authDomain = process.env.REACT_APP_authDomain
const projectId = process.env.REACT_APP_projectId
const storageBucket = process.env.REACT_APP_storageBucket
const messagingSenderId = process.env.REACT_APP_messagingSenderId
const measurementId = process.env.REACT_APP_measurementId
const appId = process.env.REACT_APP_appId

const firebaseConfig = {apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId};

//initialize firestore if it is not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

//using only two functions: cloud firestore to save glossary and auth to prevent paid usage of Translate API
const db = firebase.firestore()
const auth = firebase.auth()


//updates glossary database
const addToGlossary = async (glossary, uid) =>{
    await  db.collection('glossary').doc(uid).set({ keys: glossary })
    return glossary
}

//updates Google API key in two cases: when user just signed up and when user edits API key on Profile page
async function updateUser(key, uid) {
   await  db.collection('users').doc(uid).set({ key })
}

//requests data from database: API key, usage statistics and glossary
async function getUserData(uid) {
    //get API key and usage
    const collectionData = await db.collection('users').doc(uid)
        .get()
        .catch(e => console.log(e))
    const data = collectionData?.exists ? collectionData.data() : {}

    //get glossary
    const glossaryData = await db.collection('glossary').doc(uid)
        .get()
        .catch(e => console.log(e))
    const glossary = glossaryData?.exists ? glossaryData.data() : {keys:[]}

    return { ...data, glossary:glossary.keys }
}

//updates API usage statistics: searches for current date and ads chars to it 
//or creates a new line with current date
async function updateUsage(chars,uid){
    //first, get current usage data
    const collectionData = await db.collection('users').doc(uid).get()
    const data = collectionData?.exists ? collectionData.data() : {}

    //get today's date without time
    const d=new Date()
    const firebaseDate=new Date(d.getFullYear(),d.getMonth(),d.getDate())

    //check if there's already statistics for today
    const i=data.usage?.findIndex(item=>item.date===firebaseDate.toString())
    const newUsage= data.usage ? [...data.usage] : []

    //if there is statistics, add number of characters in new translation
    if(i>=0){
        newUsage[i].chars+=chars
    } else {
        //if this is the first use for today, create a new array item
        newUsage.push({date: firebaseDate.toString(), chars})
    }

    //store updated stats to database
    await db.collection('users').doc(uid).update({usage: newUsage})
}

/*
    user removal is a two step process: we need to delete user data first (API key, glossary, etc.)
    because it will not be accessible after firebase deletes user profile (due to Firestore rules).
    But if firebase cannot delete user profile due to "not recent" authentication, there is
    a chance that user will change their mind. In this case we have to restore user data.
*/
async function deleteUser(){

    //return Promise so that it will be decided what to show within the component
    return new Promise(async (resolve, reject)=>{

        //first, get all user data in case we have to restore it
        const user = auth.currentUser
        const userCollection = await db.collection('users').doc(user.uid).get()
        const userData = userCollection?.exists ? userCollection.data() : {}
        const glossaryCollection = await db.collection('users').doc(user.uid).get()
        const glossaryData = glossaryCollection?.exists ? glossaryCollection.data() : {}

        //then delete documents from database
        await db.collection('glossary').doc(user.uid).delete()
        await db.collection('users').doc(user.uid).delete()

        //delete user
        try {
            await user.delete()
            resolve()
        } catch (err) {
            //if user cannot be deleted, send notification and restore user data
            await db.collection('glossary').doc(user.uid).set(glossaryData)
            await db.collection('users').doc(user.uid).set(userData)
            reject(err.message)
        }
    })
}

//export functions
// eslint-disable-next-line
export default {
    addToGlossary,
    updateUser,
    getUserData,
    updateUsage,
    deleteUser,
    auth
}