import React, { useRef } from 'react';

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/png');
    onCapture(photo);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <video ref={videoRef} autoPlay className="w-60 h-80 rounded bg-black" />
      <div className="flex space-x-2">
        <button onClick={startCamera} className="btn">Start</button>
        <button onClick={takePhoto} className="btn">Capture</button>
      </div>
    </div>
  );
};

export default CameraCapture;
