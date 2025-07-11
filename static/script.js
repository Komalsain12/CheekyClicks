const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const strip = document.getElementById("strip");
let photos = [];
let currentFilter = "none";

// 🎥 Start webcam with permission check
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Camera error:", err);
      alert("⚠️ Please allow camera access. Click the lock icon 🔒 in the address bar and enable the camera.");
    });
}

// 🎨 Apply filter to the live video
function applyFilter(filter) {
  currentFilter = filter;
  video.style.filter = filter;
}

// 📸 Capture a photo
function capturePhoto() {
  if (photos.length >= 4) return;

  const width = video.videoWidth;
  const height = video.videoHeight;

  // Create a temporary offscreen canvas
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = width;
  tempCanvas.height = height;

  // Apply the selected filter to the canvas context
  tempCtx.filter = currentFilter;

  // Draw the video frame with filter
  tempCtx.drawImage(video, 0, 0, width, height);

  // Get the final filtered image
  const dataUrl = tempCanvas.toDataURL("image/jpeg");
  photos.push(dataUrl);

  // Show preview strip
  const img = document.createElement("img");
  img.src = dataUrl;
  img.className = "preview-photo";
  strip.appendChild(img);

  // Show timestamp and buttons
  if (photos.length === 1) {
    document.getElementById("timestamp").innerText = `Captured: ${new Date().toLocaleString()}`;
    document.getElementById("final-buttons").style.display = "block";
  }
}



// 💾 Submit photos to Flask backend
function submitStrip() {
  if (photos.length === 0) {
    alert("Please take at least one selfie!");
    return;
  }

  fetch("/save_strip", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images: imageList,
      timestamp: capturedTime
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = "photo_strip_final.zip";
        a.click();
      } else {
        alert("Failed to generate strip. Please try again.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error while generating photo strip.");
    });
}

// 🔁 Reset the photo strip
function resetStrip() {
  photos = [];
  strip.innerHTML = "";
  document.getElementById("timestamp").innerText = "";
  document.getElementById("final-buttons").style.display = "none";
}

// ✅ Start the camera after DOM loads
window.onload = startCamera;
