import React from 'react';
import frame from '../assets/frame.png';

const PhotoStrip = ({ photos, onRetake, onDownload }) => {
  return (
    <div className="relative w-[300px] h-[1000px] bg-cover" style={{ backgroundImage: `url(${frame})` }}>
      {photos.map((photo, index) => (
        <div key={index} className="absolute left-[20px]" style={{ top: `${130 + index * 210}px` }}>
          <img src={photo} alt={`Photo ${index + 1}`} className="w-[260px] h-[200px] object-cover rounded" />
          <button onClick={() => onRetake(index)} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">Retake</button>
        </div>
      ))}
      {photos.length === 4 && (
        <button onClick={onDownload} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded">Download</button>
      )}
    </div>
  );
};

export default PhotoStrip;
