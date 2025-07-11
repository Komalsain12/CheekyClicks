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

// Apply filter visually to video
function applyFilter(filterName) {
  currentFilter = filterName;

  if (filterName === "none") {
    video.style.filter = "none";
  } else {
    video.style.filter = `url(#${filterName})`; // Safari-compatible SVG filters
  }
}

// Capture photo from video
function capturePhoto() {
  if (photos.length >= 4) {
    alert("You can only capture up to 4 selfies per strip.");
    return;
  }

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);

  // Save the plain image (server can apply filter later if needed)
  const imageDataURL = canvas.toDataURL("image/jpeg");
  photos.push(imageDataURL);

  // Show preview image with same filter
  const img = document.createElement("img");
  img.src = imageDataURL;
  img.className = "preview-photo";

  if (currentFilter !== "none") {
    img.style.filter = `url(#${currentFilter})`;
  }

  strip.appendChild(img);

  if (photos.length === 1) {
    document.getElementById("timestamp").innerText = `Captured: ${new Date().toLocaleString()}`;
    document.getElementById("final-buttons").style.display = "block";
  }
}

// Submit strip to Flask backend
function submitStrip() {
  if (photos.length === 0) {
    alert("Please take at least one selfie!");
    return;
  }

  const timestamp = new Date().toLocaleString();

  fetch("/save_strip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      images: photos,
      timestamp: timestamp
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
      alert("Something went wrong while generating the strip.");
    });
}


// Reset the strip
function resetStrip() {
  photos = [];
  strip.innerHTML = "";
  document.getElementById("timestamp").innerText = "";
  document.getElementById("final-buttons").style.display = "none";
}
