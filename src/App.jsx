import { useRef, useState } from "react";
import "./App.css";

// SVG Icons as components
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

const RedoIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M6 6h12v12H6z" />
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 3c-4.97 0-9 3.19-9 7 0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v1c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-1h1c.55 0 1-.45 1-1v-1.26c1.81-1.27 3-3.36 3-5.74 0-3.81-4.03-7-9-7zm-5 7c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm3 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm3 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm3 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z" />
  </svg>
);

// Frame options
const frameOptions = [
  {
    name: "Classic",
    thumbnail: "/frames/classic-thumb.jpg",
    asset: "/frames/classic-frame.png"
  },
  {
    name: "Modern",
    thumbnail: "/frames/modern-thumb.jpg",
    asset: "/frames/modern-frame.png"
  },
  {
    name: "Vintage",
    thumbnail: "/frames/vintage-thumb.jpg",
    asset: "/frames/vintage-frame.png"
  },
  {
    name: "Polaroid",
    thumbnail: "/frames/polaroid-thumb.jpg",
    asset: "/frames/polaroid-frame.png"
  }
];

function App() {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stripPreviewRef = useRef(null);

  // State
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(frameOptions[0]);
  const [showFramePicker, setShowFramePicker] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Start/stop camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user' 
          } 
        });
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera. Please check permissions.");
      }
    }
  };

  // Capture photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoData = canvas.toDataURL("image/jpeg", 0.9);
    const updatedPhotos = [...photos, photoData];
    
    setPhotos(updatedPhotos);
    setCurrentIndex(updatedPhotos.length);
    
    if (updatedPhotos.length === 4) {
      toggleCamera();
      generateStripPreview();
    }
  };

  // Retake photo
  const retakePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    setCurrentIndex(index);
    if (!isCameraActive) toggleCamera();
  };

  // Generate strip preview
  const generateStripPreview = () => {
    setIsPrinting(true);
    setTimeout(() => setIsPrinting(false), 1500);
  };

  // Download photo strip
  const downloadStrip = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 1800;
      const ctx = canvas.getContext("2d");
      
      // Draw white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw photos
      const photoHeight = canvas.height / 4;
      
      // Load all photos first
      const photoImages = await Promise.all(photos.map(photo => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = photo;
        });
      }));

      // Draw each photo
      photoImages.forEach((img, i) => {
        // Calculate aspect-correct dimensions
        const aspect = img.width / img.height;
        let width, height, x, y;
        
        if (aspect > (canvas.width / photoHeight)) {
          // Wider than frame - fit to height
          height = photoHeight;
          width = height * aspect;
          x = (canvas.width - width) / 2;
          y = i * photoHeight;
        } else {
          // Taller than frame - fit to width
          width = canvas.width;
          height = width / aspect;
          x = 0;
          y = i * photoHeight + (photoHeight - height) / 2;
        }
        
        ctx.drawImage(img, x, y, width, height);
      });
      
      // Load and draw frame overlay
      const frameImg = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = selectedFrame.asset;
      });
      
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `photobooth-${new Date().toISOString().slice(0,10)}.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error("Error downloading strip:", error);
      alert("Failed to download photo strip. Please try again.");
    }
  };

  // Reset session
  const resetSession = () => {
    setPhotos([]);
    setCurrentIndex(0);
    if (isCameraActive) toggleCamera();
  };

  return (
    <div className="photobooth-app">
      {/* Header */}
      <header className="app-header">
        <h1>Marin Photobooth</h1>
        <p>Capture your special moments</p>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Camera Section */}
        <section className={`camera-section ${photos.length === 4 ? 'hidden' : ''}`}>
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`camera-view ${isCameraActive ? 'active' : ''}`}
            />
            {!isCameraActive && (
              <div className="camera-placeholder">
                <div className="placeholder-icon">
                  <CameraIcon />
                </div>
                <p>Camera is off</p>
              </div>
            )}
          </div>

          <div className="camera-controls">
            <button
              onClick={toggleCamera}
              className={`control-btn ${isCameraActive ? 'stop-btn' : 'start-btn'}`}
            >
              {isCameraActive ? <StopIcon /> : <PlayIcon />}
              {isCameraActive ? ' Stop Camera' : ' Start Camera'}
            </button>

            <button
              onClick={capturePhoto}
              disabled={!isCameraActive || photos.length === 4}
              className="control-btn capture-btn"
            >
              <CameraIcon />
              Capture Photo ({currentIndex + 1}/4)
            </button>

            <button
              onClick={() => setShowFramePicker(!showFramePicker)}
              className="control-btn frame-btn"
            >
              <PaletteIcon />
              {showFramePicker ? 'Hide Frames' : 'Choose Frame'}
            </button>
          </div>
        </section>

        {/* Frame Picker */}
        {showFramePicker && (
          <section className="frame-picker">
            <h3>Select Frame Style:</h3>
            <div className="frame-grid">
              {frameOptions.map((frame) => (
                <div
                  key={frame.name}
                  className={`frame-option ${selectedFrame.name === frame.name ? 'selected' : ''}`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  <img
                    src={frame.thumbnail}
                    alt={frame.name}
                    className="frame-thumbnail"
                  />
                  <span>{frame.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Preview */}
        {photos.length > 0 && (
          <section className="preview-section">
            <h3>Your Photos:</h3>
            <div className="photo-previews">
              {photos.map((photo, index) => (
                <div key={index} className="photo-preview">
                  <img src={photo} alt={`Preview ${index + 1}`} />
                  <button
                    onClick={() => retakePhoto(index)}
                    className="retake-btn"
                  >
                    <RedoIcon /> Retake
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Strip Output */}
        {photos.length === 4 && (
          <section className={`output-section ${isPrinting ? 'printing' : ''}`}>
            <div className="strip-preview" ref={stripPreviewRef}>
              <div className="strip-photos">
                {photos.map((photo, index) => (
                  <div key={index} className="strip-photo">
                    <img src={photo} alt={`Strip Photo ${index + 1}`} />
                  </div>
                ))}
              </div>
              <img
                src={selectedFrame.asset}
                alt="Selected frame"
                className="strip-frame"
              />
            </div>

            <div className="output-actions">
              <button onClick={downloadStrip} className="action-btn download-btn">
                <DownloadIcon /> Download Strip
              </button>
              <button onClick={resetSession} className="action-btn reset-btn">
                <RedoIcon /> New Session
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Marin Photobooth</p>
      </footer>
    </div>
  );
}

export default App;