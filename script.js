const slides = document.querySelectorAll(".slide");
let currentSlideIndex = 0;
const refreshBtn = document.getElementById("refresh");
const nextBtn = document.getElementById("next");
const previousBtn = document.getElementById("previous");
const startBtn = document.getElementById("start");
const cover = document.querySelector(".cover");

// Previous point coordinates
let lastX = null;
let lastY = null;

// Hide cover on start
startBtn.addEventListener("click", () => {
  if (cover) {
    cover.style.display = "none";
  }
});

let slide5ClickCount = 0;

// Function to display a specific slide
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? "block" : "none";
  });

  // Enable/disable navigation buttons
  previousBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;

  // Reset drawing coordinates (new line for new slide)
  lastX = null;
  lastY = null;

  // Handle special rules for slide 5
  if (index === 4) {
    // Slide 5 is at index 4 (zero-based indexing)
    slide5ClickCount = 0; // Reset click count when entering slide 5
    nextBtn.disabled = true; // Disable next button initially
  } else {
    nextBtn.disabled = false; // Enable next button for other slides
  }
  if (index === 6) {
    // Slide 7 is at index 6
    const videoElement = document.getElementById("user-video");
    if (videoElement) {
      initializeCamera(videoElement);
    }
  }
}

// Initialize: Show the first slide
showSlide(currentSlideIndex);

// Next button
nextBtn.addEventListener("click", () => {
  if (currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
  }
});

// Previous button
previousBtn.addEventListener("click", () => {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    showSlide(currentSlideIndex);
  }
});

// Refresh button
refreshBtn.addEventListener("click", () => {
  const currentCanvas = getCurrentCanvas();
  if (currentCanvas) {
    const ctx = currentCanvas.getContext("2d");
    ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
  }
  lastX = null;
  lastY = null;
});

// Get the canvas of the current slide
function getCurrentCanvas() {
  return slides[currentSlideIndex].querySelector(".drawing-canvas");
}

// Initialize the canvas
function initializeCanvas(canvas) {
  const ctx = canvas.getContext("2d");

  // Set fixed canvas dimensions
  const width = 756; // Style width
  const height = 650; // Style height

  // Apply style dimensions
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Support high-resolution displays (devicePixelRatio)
  const ratio = window.devicePixelRatio || 1;

  // Set actual pixel dimensions
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  // Apply scaling
  ctx.scale(ratio, ratio);

  // Add click event for drawing
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect(); // Canvas boundary coordinates

    // Convert viewport coordinates to canvas coordinates
    const x = ((e.clientX - rect.left) * (canvas.width / rect.width)) / ratio;
    const y = ((e.clientY - rect.top) * (canvas.height / rect.height)) / ratio;

    // Draw a point
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2); // 3px radius
    ctx.fillStyle = "#f54e42"; // Point color
    ctx.fill();

    // Draw a line to the previous point if it exists
    if (lastX !== null && lastY !== null) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY); // Move to the last point
      ctx.lineTo(x, y); // Draw to the current point
      ctx.strokeStyle = "#f54e42"; // Line color
      ctx.lineWidth = 2; // Line thickness
      ctx.stroke();
    }

    // Update last coordinates
    lastX = x;
    lastY = y;

    // Special rule for slide 5
    if (currentSlideIndex === 4) {
      // Slide 5 is at index 4
      slide5ClickCount++; // Increment click count

      if (slide5ClickCount >= 8) {
        alert("I feel odd"); // Show alert when 8 or more clicks
        nextBtn.disabled = false; // Enable next button after 8 clicks
      }
    }

    if (currentSlideIndex === 5) {
      // Slide 6 is at index 5 (zero-based)
      alert("I am scared!ヾ( •́д•̀ ;)ﾉ");
    }
  });
}

// Initialize all canvases
slides.forEach((slide) => {
  const canvas = slide.querySelector(".drawing-canvas");
  if (canvas) {
    initializeCanvas(canvas);
  }
});

function initializeCamera(videoElement) {
  // Check for media device support
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true }) // Request video stream
      .then((stream) => {
        videoElement.srcObject = stream; // Assign stream to video element
      })
      .catch((error) => {
        console.error("Camera access denied or unavailable:", error);
        alert("Unable to access your camera. Please enable it in your browser.");
      });
  } else {
    alert("Camera not supported on this device.");
  }
}
