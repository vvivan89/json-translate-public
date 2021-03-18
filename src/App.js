import React from 'react'
//no state management or navigation used is app is simplistic
//all state is inside the components with useState hooks
//react-bootstrap used for form components

import { Translator } from './Translator';
import { Login } from './Login';
import fb from './firebase'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  //authentication is required because Google Translate API free tier is limited and I'm not paying
  const [user, setUser] = React.useState(null)
  fb.auth.onAuthStateChanged(u=>setUser(u))

  //two pages only: sign in (no sign up, sorry) and the core translator functionality itself
  return (
    <div style={{ overflow: 'hidden' }}>
      {user ? <Translator /> : <Login auth={fb.auth}/>}
    </div>
  );
}

export default App;
