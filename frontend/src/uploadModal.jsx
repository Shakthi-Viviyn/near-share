import React, {useState, useEffect} from "react";
import lodash from "lodash";
import "./styles/modal.css";
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UploadModal({setUploadModal, position, setReload, user}) {

    const [completed, setCompleted] = useState(false);
    const [expireTime, setExpireTime] = useState(5);
    const [selectedFile, setSelectedFile] = useState(null);
    const [acknowledged, setAcknowledged] = useState(false);
    const [showClose, setShowClose] = useState(true);

    useEffect(() => {
        if (selectedFile === null || !acknowledged){
            setShowClose(true);
            setCompleted(false);
        } else {
            setShowClose(false);
            setCompleted(true);
        }
    })


    function shortenName(originalName){
        let fileName = originalName;
        if (fileName.length > 20){
            fileName = fileName.substring(0, 20) + "...";
        }
        return fileName;
    }

    function makeWebSafeFileName(fileName) {
        // Remove special characters except for dots, underscores, and hyphens
        const sanitized = lodash.replace(fileName, /[^\w\s.-]/g, '');
        // Replace spaces with dashes
        const webSafeName = lodash.replace(sanitized, / /g, '-');
        return webSafeName;
      }

    function handleFileSelection(e){

        if (e.target.files.length > 0){
            if (e.target.files[0].size <= 20971520){
                setSelectedFile(e.target.files[0]);
            }else{
                toast.error("Max file size is 20MB!");
            }
        }
    }

    function handleAcknowledgement(e){
        setAcknowledged(e.target.checked);
    }

    async function handleUpload(){

        if (!completed){
            toast.error("Please fill all the fields!");
            return;
        }
        if (position === null){
            toast.error("Please allow location access to use Near Share!");
            return;
        }
        if (user === null){
            toast.error("Please sign in to upload files!");
            return;
        }

        const accessToken = window.localStorage.getItem(`CognitoIdentityServiceProvider.1fk1ahdh848p6adnpt6q0stvqp.${user.username}.accessToken`);

        const originalName = makeWebSafeFileName(selectedFile.name);
        const latitude = String(position.latitude);
        const longitude = String(position.longitude);
        const ownerId = user.username;
        const expiryDuration = String(expireTime * 60);

        let url = "https://lfiv3sde5b.execute-api.ca-central-1.amazonaws.com/default/getPresignedUrl"
        let payload = {
            "fileName": originalName,
            "latitude": latitude,
            "longitude": longitude,
            "ownerId": ownerId,
            "expiryDuration": expiryDuration
        }

        
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 400){
            toast.error("Max 5 files can be live at a time");
            setShowClose(true);
            return;
        }
        if (response.status !== 200){
            toast.error("Please try again later!");
            setShowClose(true);
            return;
        }

        response = await response.json();
        let presignedUrl = response["uploadUrl"];

        let uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: selectedFile,
            headers: {
                // 'Content-Type': selectedFile.type,
                'x-amz-meta-originalName': originalName,
                'x-amz-meta-longitude': longitude,
                'x-amz-meta-latitude': latitude,
                'x-amz-meta-ownerId': ownerId,
                'x-amz-meta-expiryDuration': expiryDuration,
            }
        });
        
        if (uploadResponse.status === 200){
            toast.success("File uploaded!");
            setUploadModal(false);
            setReload(true);
        }else{
            toast.error("Please try again later!");
            setShowClose(true);
        }
    }

    return (
        <div className="overlay">
            <ToastContainer 
                autoClose={3000}
                hideProgressBar={true}
                theme="dark"
                pauseOnHover
            />
            <div className="modal">
                <div className="modalHeader">
                    <h1>Upload file</h1>
                    {showClose && <img src="/icons/close.svg" className="closeIcon" onClick={() => setUploadModal(false)}/>}
                </div>
                <div className="modalBody">
                    <div className="addFileContainer">
                        <div id="addFileButton" onClick={() => document.getElementById("file").click()}>
                            <img src="/icons/plus.svg" id="plusIcon"/>
                        </div>
                        <input type="file" id="file" name="file" onChange={handleFileSelection}/>
                        <p className="fileNameText">{selectedFile === null ? "No file chosen" : shortenName(selectedFile.name)}</p>
                    </div>
                    <div className="sliderContainer">
                        <div className="sliderHeaderContainer">
                            <p>Expiration duration:</p>
                        </div>
                        <div className="slider">
                            <Slider
                                defaultValue={5}
                                valueLabelDisplay="auto"
                                id="modalExpirySlider"
                                step={5}
                                marks
                                min={5}
                                max={20}
                                onChange={(e, val) => setExpireTime(val)}
                                sx={{color: '#164863'}}
                            />
                        </div>
                    </div>
                    <div className="disclaimerContainer">
                        <p>Note:</p>
                        <ul className="textContainer">
                            <li>File would be automatically deleted after <b>{expireTime} minutes</b></li>
                            <li>File is made openly available</li>
                            <li>File could be accessed by anyone in 100m radius</li>
                        </ul>
                        <FormControlLabel control={<Checkbox onChange={handleAcknowledgement}/>} label="I understand" />
                    </div>
                    <input type="button" id="uploadBtn" onClick={handleUpload} value="Upload" className={completed ? "uploadBtnEnabled" : "uploadBtnDisabled"}/>
                </div>
                <div className="modalFooter">
                </div>
            </div>
        </div>
    );
}