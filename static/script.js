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
  if (photos.length >= 4) {
    alert("You can only take 4 selfies per strip.");
    return;
  }

  // Set canvas size
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Trick: draw the video onto canvas with filters applied in DOM
  // To preserve the filter visually, we use a temporary trick
  const tempVideo = video.cloneNode(true);
  tempVideo.style.position = 'absolute';
  tempVideo.style.top = '-10000px'; // offscreen
  tempVideo.style.filter = video.style.filter; // apply same filter

  document.body.appendChild(tempVideo);

  // Wait 100ms for video to fully load (especially on Safari)
  setTimeout(() => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");

    photos.push(dataUrl);

    const img = document.createElement("img");
    img.src = dataUrl;
    img.className = "preview-photo";
    strip.appendChild(img);

    if (photos.length === 1) {
      document.getElementById("timestamp").innerText = `Captured: ${new Date().toLocaleString()}`;
      document.getElementById("final-buttons").style.display = "block";
    }

    tempVideo.remove(); // clean up
  }, 100);
}



// 💾 Submit photos to Flask backend
function submitStrip() {
  if (photos.length === 0) {
    alert("Please take at least one selfie!");
    return;
  }

  const capturedTime = new Date().toLocaleString();

  fetch("/save_strip", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images: photos,
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
