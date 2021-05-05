import React from 'react'
import {BrowserRouter as Router,Switch,Route} from "react-router-dom";

//export pages
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Signup } from './pages/Signup'

//export navigation
import { Header } from './navigation/Header';
import { Footer } from './navigation/Footer';

//static element, represented as const, not a function
import { Privacy } from './pages/Privacy' 

import fb from './firebase'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  //authentication state to update other components
  const [user, setUser] = React.useState(null)

  //translation variables, received from database
  const [api,setApi]=React.useState({key:'', usage:null,chars:0, glossary:[]})

  //API usage data for chart
  const [usageStats, setUsageStats] = React.useState([])

  //this is to show alert is user deleted their profile
  const [recentlyDeletedProfile,setRecentlyDeletedProfile] = React.useState(null)

  //hook to listen to authentication state and re-render components
  fb.auth.onAuthStateChanged(u=>setUser(u))

  React.useEffect(() => {
    //when user logs in, calculate initial usage statistics
    if(user){
      //get data from Firestore
      fb.getUserData(user.uid).then(user => {

        //now we have to aggregate daily usage stats to monthly
        //TODO: maybe add daily stats too
        const {usage} = user
        let currentChars=0
        if(usage){

          //create current month string in MM.YYYY format
          const today = new Date()
          const currentMonth = `${(today.getMonth()+1).toString().padStart(2,"0")}.${today.getFullYear()}`

          //add months
          const stats=[]
          usage.forEach(day=>{

            //for each day create a month string in MM.YYYY format
            const d = new Date(day.date)
            const month = `${(d.getMonth()+1).toString().padStart(2,"0")}.${d.getFullYear()}`

            //update current stats
            if(month===currentMonth){currentChars+=day.chars}

            //update monthly stats in array
            const i=stats.findIndex(item=>item.string===month)
            if(i>=0){
              stats[i].chars+=day.chars
            } else {
              stats.push({string:month, chars: day.chars, year:d.getFullYear(), month:d.getMonth()})
            }
          })
          setUsageStats(stats)
        }
        
        //make string with percentage out of chars usage
        //percentage is calculated with .00 based on 500,000 chars of free usage per month
        const currentUsage = currentChars ? `${currentChars.toLocaleString()} (${Math.round(currentChars/50)/100}%)` : null

        //store translation-related data to the App state
        setApi({ key: user.key, usage: currentUsage, chars: currentChars, glossary:user.glossary })
      })
    } else {
      //when user logs out, clear usage and API key
      setApi({key:'', usage:null,chars:0, glossary:[]})
    }
  },[user])
  
  //updates API chars with the number of chars from the most recent translation (if Google API was used)
  const calculateApiUsage = newUsage=>{

    let chars=api.chars+newUsage

    //make string with percentage out of updated chars usage
    const usage = `${chars.toLocaleString()} (${Math.round(chars/50)/100}%)`

    //if user is logged, store new usage to database
    if(user){
      fb.updateUsage(newUsage,user.uid)

      //also update monthly stats for the chart
      const d = new Date()
      const month = `${(d.getMonth()+1).toString().padStart(2,"0")}.${d.getFullYear()}`
      const i=usageStats.findIndex(item=>item.string===month)
      const newStats=[...usageStats]
      if(i>=0){
        newStats[i].chars+=newUsage
      } else {
        newStats.push({string: month, chars:newUsage, year:d.getFullYear(), month:d.getMonth()})
      }
      setUsageStats(newStats)
    }

    //update state
    setApi({...api, usage,chars})
  }

  //update glossary: either from the translation page, when user saves something, or from the profile page
  const glossaryUpdate =(update, index, del=false) => {
    const newGlossary = [...api.glossary]

    //if index exists, we update the existing glossary item
    if(index!==null){

      //remove item
      if(del){
        newGlossary.splice(index,1)
      } else {
        //update item to whatever is sent
        newGlossary[index]=update
      }
    } else {
      //if there's no index, we add new glossary item
      newGlossary.push(update)
    }

    //update state with new glossary
    setApi({...api, glossary: newGlossary})

    //if user is logged, save updated glossary to database
    if(user){
      return fb.addToGlossary(newGlossary, user.uid)
    }
    return newGlossary
  }

  //when user adds item to glossary from the translation page
  //as opposed to profile page, where the necessary data processing is already done
  const newGlossaryItem = (from, to,  targetLang, sourceLang) =>{

    //first, create the Object with languages as keys
    const result={}

    //original string from the file and the language that is detected by Google API
    Object.defineProperty(result, sourceLang,{
      value: from,
      enumerable: true
    })

    //translation and the language, Google API was used to translate to
    Object.defineProperty(result, targetLang,{
      value: to,
      enumerable: true
    })

    //look if we already have such item in glossary - then we need to update it, not to add a new one
    //search is only done by source language, because there can be more than one phrases 
    //that should be translated to the target language identically
    const search = api.glossary.findIndex(item=>item[sourceLang]===from)
    if(search>=0){
      return glossaryUpdate({...api.glossary[search],...result}, search)
    } else {
      //if there's no such item, add new
      return glossaryUpdate(result, null)
    }
  }

  //notify user of deleted profile for 3 seconds, then remove notification
  const deletedProfileNotification = uid=>{
    setRecentlyDeletedProfile(uid)
    setTimeout(()=>setRecentlyDeletedProfile(null),3000)
  }

  return (
    <Router>

      {/* manages Google API and login/logout */}
      <Header 
        userData={{
          isLogged: !!user,
          logOut:()=>fb.auth.signOut(),
          logIn: (user) => fb.auth.signInWithEmailAndPassword(user.email, user.password),
          reset: (email)=>fb.auth.sendPasswordResetEmail(email),
          setAPI: (key)=>setApi({...user,key}),
          api,
          email: user?.email
        }}
      />

      <Switch>

        {/* profile should only be available when user is logged in */}
        {
          user &&
          <Route path="/profile">
            <Profile
              user={user}
              apiKey={api.key}
              glossary={{
                glossary: api.glossary,
                glossaryUpdate
              }}
              updateAPI={(key) => {
                setApi({ ...api, key })
                return fb.updateUser(key, user.uid) //returns promise to catch error if update is not possible
              }}
              stats={usageStats}
              deleteUser={fb.deleteUser}
              recentlyDeletedProfile={(uid)=>deletedProfileNotification(uid)}
            />
          </Route>
        }

        {/* signup should only be available when user is not logged in */}
        {
          !user &&
          <Route path="/signup">
            <Signup
              create={(usr) => fb.auth.createUserWithEmailAndPassword(usr.email, usr.password)}
              update={(key,uid)=>fb.updateUser(key,uid)}
            />
          </Route>
        }
        {/* static page, that is why it is added as const, not as component */}
        <Route path="/privacy">{Privacy}</Route>

        {/* main translation page. Should be last in Switch because it will be rendered if there's no matches above */}
        <Route path="/">
          <Home 
            api={api} 
            logged={!!user} 
            setUsage={calculateApiUsage}
            addToGlossary={newGlossaryItem}
            recentlyDeletedProfile={recentlyDeletedProfile}
          />
        </Route>
      </Switch>

      {/* this div is to lift content above the footer +10px */}
      <div style={{height:40, width:'100%'}}/> 

      <Footer/>
    </Router>
  );
}

export default App;
