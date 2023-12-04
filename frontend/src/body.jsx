import React, { useEffect, useState } from "react";

export default function Body({position}) {

    const [fileData, setFileData] = useState([]);


    useEffect(() => {
            (async() => {
                try {
                    const url = "https://lfiv3sde5b.execute-api.ca-central-1.amazonaws.com/default/queryForNearbyObjects"
                    const body = {
                        "latitude": position.latitude,
                        "longitude": position.longitude
                    }
                    let response = await fetch(url, {
                        method: "POST",
                        body: JSON.stringify(body)
                    });
                    response = await response.json();
                    setFileData(response);
                } catch (error) {
                    console.log(error);
                }

            })();
    }, [position]);

    function fetchImage(fileName){
        let extension = fileName.split(".")[1];
        switch(extension){
            case "png":
                return "/icons/image.svg";
            case "jpg":
                return "/icons/image.svg";
            case "jpeg":
                return "/icons/image.svg";
            case "gif":
                return "/icons/image.svg";
            case "pdf":
                return "/icons/pdf.svg";
            case "docx":
                return "/icons/word.svg";
            case "doc":
                return "/icons/word.svg";
            case "ppt":
                return "/icons/slideshow.svg";
            case "pptx":
                return "/icons/slideshow.svg";
            case "xls":
                return "/icons/spreadsheet.svg";
            case "csv":
                return "/icons/spreadsheet.svg";
            case "xlsx":
                return "/icons/spreadsheet.svg";
            case "zip":
                return "/icons/zip.svg";
            case "rar":
                return "/icons/zip.svg";
            case "mp3":
                return "/icons/audio.svg";
            case "mp4":
                return "/icons/video.svg";
            default:
                return "/icons/file.svg";
        }
    }

    function downloadFile(url, fileName) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.style.display = 'none';
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(error => console.error(error));
    }

    function shortenName(originalName){
        let fileName = originalName;
        if (fileName.length > 20){
            fileName = fileName.substring(0, 30) + "...";
        }
        return fileName;
    }

    return (
        <div className="fileContainer">
            <div className="fileList">
                {fileData && fileData.map((file, index) => {
                    return (
                        <div className="file" key={index} onClick={() => {downloadFile(file.url, file.originalName)}}>
                            <img className="fileImage" src={fetchImage(file.originalName)} alt="file" />
                            <p className="fileText">{shortenName(file.originalName)}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}