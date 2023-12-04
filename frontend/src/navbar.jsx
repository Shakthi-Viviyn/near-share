import React from "react";
import "./styles/navbar.css";

export default function Header({setUploadModal, setReload, authStatus, setShowAuth, signOut, position}) {

    function handleUploadModalClick(){
        if (position){
            setUploadModal(true);
        }
    }


    return (
        <div className="headerContainer">
            <h1 id="Title">Near Share</h1>

            <div className="headerMenu">
                <img src="/icons/refresh.svg" onClick={() => setReload(prevState => !prevState)} id="refreshBtn"/>
                {
                    (authStatus === "authenticated") ?
                    <>
                        <button className="menuBtn" id="uploadModalBtn" onClick={handleUploadModalClick}>Upload file</button>
                        <button className="menuBtn" id="signOutBtn" onClick={signOut}>Sign Out</button>
                    </>
                    :
                    <button className="menuBtn" id="signInBtn" onClick={() => setShowAuth(true)}>Sign In</button>
                }
            </div>
        </div>
    );
}