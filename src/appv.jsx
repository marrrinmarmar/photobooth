import { useRef, useState, useEffect } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [filter, setFilter] = useState("none");
  const [strip, setStrip] = useState("horizontal");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }).catch(err => {
      alert("Tidak bisa akses kamera: " + err.message);
    });
  }, []);

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.filter = filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);
  };

  const handlePrint = () => {
    const win = window.open();
    win.document.write(`
      <img src="${photo}" style="width:100%" onload="window.print();window.close()" />
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 space-y-6">
      <h1 className="text-3xl font-bold">📸 PhotoBooth</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-xl border-4 border-white w-full max-w-md"
        style={{ filter }}
      />

      <div className="flex flex-wrap justify-center gap-4">
        <select
          className="bg-white text-black p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="none">Normal</option>
          <option value="grayscale(100%)">Grayscale</option>
          <option value="sepia(100%)">Sepia</option>
          <option value="invert(100%)">Invert</option>
        </select>

        <select
          className="bg-white text-black p-2 rounded"
          value={strip}
          onChange={(e) => setStrip(e.target.value)}
        >
          <option value="horizontal">Strip Horizontal</option>
          <option value="vertical">Strip Vertikal</option>
        </select>

        <button
          onClick={takePhoto}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
        >
          Ambil Foto
        </button>

        <button
          onClick={handlePrint}
          disabled={!photo}
          className={`px-4 py-2 rounded ${photo ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}`}
        >
          Cetak
        </button>
      </div>

      {photo && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className={`${strip === "horizontal" ? "flex" : "flex-col"} gap-2`}>
            {[...Array(3)].map((_, i) => (
              <img
                key={i}
                src={photo}
                alt={`Foto ${i + 1}`}
                className="w-32 border-2 border-white rounded"
              />
            ))}
          </div>

          <div className="flex gap-4">
            <a
              href={photo}
              download="photo.png"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Download
            </a>
          </div>
        </div>
      )}


      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

export default App;
