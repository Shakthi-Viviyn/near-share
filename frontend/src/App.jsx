import React, {useState, useEffect} from 'react';
import './styles/App.css';
import Body from './body.jsx';
import Navbar from './navbar.jsx';
import UploadModal from './uploadModal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Amplify} from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsexports from './awsexports.js';
import { useAuthenticator } from '@aws-amplify/ui-react';

Amplify.configure(awsexports);

export default function App() {


  const [uploadModal, setUploadModal] = useState(false);
  const [position, setPosition] = useState(null);
  const [reload, setReload] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const { authStatus, user, signOut } = useAuthenticator(context => [context.authStatus, context.user]);


  useEffect(() => {
    if (authStatus === "authenticated" && showAuth === true) {
      setShowAuth(false);
    }
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log("Latitude: " + latitude + ", Longitude: " + longitude);
        setPosition({latitude, longitude});

      }, function(error) {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Please allow location access to use Near Share!");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable");
            break;
          case error.TIMEOUT:
            toast.error("Reload the page and try again");
            break;
          case error.UNKNOWN_ERROR:
            toast.error("Please try again later");
            break;
        }
      }, {enableHighAccuracy: true});
    } else {
      toast.error("Unsupported browser");
    }
  }, [reload])

  return (
    <div className="App">
      <ToastContainer
        autoClose={3000}
        hideProgressBar={true}
        theme="dark"
        pauseOnHover
      />
      {showAuth 
        ? 
        <div className='authContainer'>
          <div className='authContentContainer'>
            <div className='cancelButtonContainer' onClick={() => setShowAuth(false)}>
              {/* <img src="/icons/leftarrow.svg" alt="back"/> */}
              <p><u>Go back</u></p>
            </div>
            <Authenticator onStateChange={(state) => handleAuthStateChange(state)}/>
          </div>
        </div> 
        :
        <>
          <header className="App-header">
            <Navbar setUploadModal={setUploadModal} authStatus={authStatus} setReload={setReload} setShowAuth={setShowAuth} signOut={signOut} position={position}/>
          </header>
          <div className="App-body">
            {position && <Body position={position}/>}
          </div>
          {uploadModal && <UploadModal setUploadModal={setUploadModal} position={position} setReload={setReload} user={user}/>}
        </>
      }
    </div>
  );
}