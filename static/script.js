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
let currentFilter = 'none';

function applyFilter(name) {
  currentFilter = name;

  // For Safari: use SVG filter instead of CSS filter
  if (name === 'none') {
    video.style.filter = 'none';
  } else {
    video.style.filter = `url(#${name})`;
  }
}

// 📸 Capture a photo
function capturePhoto() {
  if (photos.length >= 4) return;

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);

  let imgDataUrl = canvas.toDataURL("image/jpeg");

  // Save unfiltered image to pass to server
  photos.push(imgDataUrl);

  // Show it as preview with the same filter applied for visual matching
  const img = document.createElement("img");
  img.src = imgDataUrl;
  img.className = "preview-photo";

  if (currentFilter !== 'none') {
    img.style.filter = `url(#${currentFilter})`; // Works in Safari
  }

  strip.appendChild(img);

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
    body: JSON.stringify({ images: photos })
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
