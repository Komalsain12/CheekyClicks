const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const strip = document.getElementById("strip");
let photos = [];
let currentFilter = "none";

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// Apply filter
function applyFilter(filter) {
  currentFilter = filter;
  video.style.filter = filter;
}

// Capture photo
function capturePhoto() {
  if (photos.length >= 4) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg");
  photos.push(dataUrl);

  const img = document.createElement("img");
  img.src = dataUrl;
  img.className = "preview-photo";
  strip.appendChild(img);

  // Show timestamp only once
  if (photos.length === 1) {
    document.getElementById("timestamp").innerText = `Captured: ${new Date().toLocaleString()}`;
  }

  // Enable download and retake buttons
  if (photos.length >= 1) {
    document.getElementById("final-buttons").style.display = "block";
  }
}

// Send data to Flask backend
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

// Reset the photo strip
function resetStrip() {
  photos = [];
  strip.innerHTML = "";
  document.getElementById("timestamp").innerText = "";
  document.getElementById("final-buttons").style.display = "none";
}
