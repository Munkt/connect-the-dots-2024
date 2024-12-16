const slides = document.querySelectorAll(".slide");
let currentSlideIndex = 0;
const refreshBtn = document.getElementById("refresh");
const nextBtn = document.getElementById("next");
const previousBtn = document.getElementById("previous");
const startBtn = document.getElementById("start");
const cover = document.querySelector(".cover");
const RED_COLOR = "#f54e42";

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

  previousBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;

  lastX = null;
  lastY = null;

  if (index >= 0 && index <= 5) {
    const currentCanvas = slides[index].querySelector(".drawing-canvas");
    if (currentCanvas) {
      initializeCanvas(currentCanvas);
    }
  }

  if (index === 6) {
    // Initialize camera on slide 7
    const videoElement = document.getElementById("user-video");
    if (videoElement) {
      initializeCamera(videoElement);
    }
  } else if (index === 7 && cameraStream) {
    // Stop the camera when moving to slide 8
    stopCamera();
  }

  if (index === 8) {
    initializeSlide9(); // Initialize slide 9 functionality
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

  let slide5ClickCount = 0;
  let alertShownForSlide5 = false; // Slide 5 alert 표시 여부
  // let alertShownForSlide6 = false; // Slide 6 alert 표시 여부
  // Add click event for drawing with slide-specific logic
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect(); // Canvas boundary coordinates

    // Convert viewport coordinates to canvas coordinates
    const x = ((e.clientX - rect.left) * (canvas.width / rect.width)) / ratio;
    const y = ((e.clientY - rect.top) * (canvas.height / rect.height)) / ratio;

    // Draw a point
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2); // 3px radius
    ctx.fillStyle = RED_COLOR; // Point color
    ctx.fill();

    // Draw a line to the previous point if it exists
    if (lastX !== null && lastY !== null) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY); // Move to the last point
      ctx.lineTo(x, y); // Draw to the current point
      ctx.strokeStyle = RED_COLOR; // Line color
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Update last coordinates
    lastX = x;
    lastY = y;

    // Special rule for slide 5
    if (currentSlideIndex === 4) {
      slide5ClickCount++; // Increment click count
      if (slide5ClickCount >= 8 && !alertShownForSlide5) {
        alert("I feel odd...");
        alertShownForSlide5 = true; // Ensure alert only shows once
        nextBtn.disabled = false; // Enable next button
      }
    }

    // Special rule for slide 6
    if (currentSlideIndex === 5) {
      alert("I am scared."); // Show alert every click
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
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        cameraStream = stream; // Store the stream
        videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error("Camera access denied or unavailable:", error);
        alert("Unable to access your camera. Please enable it in your browser.");
      });
  } else {
    alert("Camera not supported on this device.");
  }
}

function stopCamera() {
  if (cameraStream) {
    const tracks = cameraStream.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all tracks
    cameraStream = null;
  }
}

function initializeSlide8Canvas(canvas) {
  const ctx = canvas.getContext("2d");

  // 고해상도 디스플레이 지원을 위한 ratio 계산
  const ratio = window.devicePixelRatio || 1;

  // 캔버스 중앙 점의 좌표
  const centerX = canvas.width / 2 / ratio; // 캔버스 중앙 X 좌표
  const centerY = canvas.height / 2 / ratio; // 캔버스 중앙 Y 좌표

  // 선 색상 배열
  const colors = ["#f7c4c4", "#f4a69e", "#f0867a", "#ec6358", "#d82121"];

  // 선을 그리는 함수
  function drawLine(x, y) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)]; // 랜덤 색상 선택

    // 선 그리기
    ctx.beginPath();
    ctx.moveTo(centerX, centerY); // 중앙에서 시작
    ctx.lineTo(x, y); // 마우스 좌표로 이어짐
    ctx.strokeStyle = randomColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 끝점에 동일한 점 그리기
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2); // 3px 반지름
    ctx.fillStyle = randomColor;
    ctx.fill();
  }

  // 마우스 움직임 이벤트 추가
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect(); // 캔버스의 경계 좌표
    const x = ((e.clientX - rect.left) * (canvas.width / rect.width)) / ratio; // 마우스 X 좌표
    const y = ((e.clientY - rect.top) * (canvas.height / rect.height)) / ratio; // 마우스 Y 좌표

    drawLine(x, y); // 선 그리기 호출
  });

  // 중앙 점 그리기
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2); // 3px 반지름
  ctx.fillStyle = RED_COLOR; // 중앙 점 색상
  ctx.fill();
}

// 8번 슬라이드의 캔버스 초기화 호출
const slide8Canvas = document.querySelector("#slide8 .drawing-canvas");
if (slide8Canvas) {
  // 고해상도 디스플레이 지원 설정
  const ctx = slide8Canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = 756;
  const height = 650;

  slide8Canvas.style.width = `${width}px`;
  slide8Canvas.style.height = `${height}px`;
  slide8Canvas.width = width * ratio;
  slide8Canvas.height = height * ratio;

  ctx.scale(ratio, ratio);
  initializeSlide8Canvas(slide8Canvas);
}

function initializeSlide9() {
  const svgPath = document.querySelector("#slide9 .svg-stroke path");

  if (!svgPath) {
    console.error("SVG path not found for slide 9");
    return;
  }

  // Get the total length of the SVG path
  const pathLength = svgPath.getTotalLength();

  // Initialize the stroke properties
  svgPath.style.strokeDasharray = pathLength; // Set the dasharray to the total length
  svgPath.style.strokeDashoffset = pathLength; // Initially hide the stroke

  let currentOffset = pathLength; // Initialize the current offset
  let targetOffset = pathLength; // Target offset to animate toward
  let lastMouseX = null; // Track last mouse position for movement detection

  // Ease function
  function ease(current, target, easeFactor = 0.1) {
    return current + (target - current) * easeFactor;
  }

  // Animation loop for smooth easing
  function animate() {
    currentOffset = ease(currentOffset, targetOffset);
    svgPath.style.strokeDashoffset = currentOffset;

    if (Math.abs(currentOffset - targetOffset) > 0.1) {
      requestAnimationFrame(animate);
    }
  }

  // Mouse move event on the document
  document.addEventListener("mousemove", (e) => {
    const rect = document.body.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X relative to the body

    if (lastMouseX !== null) {
      // Calculate distance moved since last mouse position
      const distanceMoved = Math.abs(x - lastMouseX);

      // Reduce targetOffset based on movement
      targetOffset = Math.max(0, targetOffset - distanceMoved * 0.5); // Scale distance for slower stroke
      animate(); // Trigger animation
    }

    lastMouseX = x; // Update last mouse position
  });

  // Reset lastMouseX on mouse leave
  document.addEventListener("mouseleave", () => {
    lastMouseX = null;
  });
}

// 슬라이드 10번 전용 모션 초기화 함수
function initializeSlide10Canvas(canvas) {
  const ctx = canvas.getContext("2d");
  const colors = ["#f7c4c4", "#f4a69e", "#f0867a", "#ec6358", "#d82121"];

  // 고해상도 디스플레이 지원
  const ratio = window.devicePixelRatio || 1;
  const width = 756;
  const height = 650;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);

  let points = []; // 점들의 배열

  // 점 생성 함수
  function createDot(baseX, baseY) {
    const x = baseX + (Math.random() * 40 - 20); // 마우스 근처에 20~60px 범위 랜덤 위치
    const y = baseY + (Math.random() * 40 - 20);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const radius = Math.random() * 3 + 1; // 1~4px 크기

    points.push({ x, y, color, radius });
  }

  // 점과 점 연결 함수
  function connectNearbyDots() {
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (distance < 100) {
          // 100px 이내의 점들 연결
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = points[i].color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // 애니메이션 함수
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화

    // 점 그리기
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
    });

    // 점들 간 연결
    connectNearbyDots();

    requestAnimationFrame(animate); // 애니메이션 반복 호출
  }

  let lastMouseTime = 0;

  // 마우스 움직임 이벤트
  canvas.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastMouseTime < 100) return; // 0.1초 간격으로 점 생성 (반응 속도 증가)

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (canvas.width / rect.width)) / ratio;
    const y = ((e.clientY - rect.top) * (canvas.height / rect.height)) / ratio;

    createDot(x, y); // 점 생성
    lastMouseTime = now;
  });

  canvas.addEventListener("mouseleave", () => {
    lastMouseTime = 0;
  });

  animate(); // 애니메이션 시작

  // Refresh 버튼 동작 추가
  const refreshBtn = document.getElementById("refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      points = []; // 점 배열 초기화
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
    });
  }
}

// 슬라이드 10번 캔버스 초기화
const slide10Canvas = document.querySelector("#slide10 .drawing-canvas");
if (slide10Canvas) {
  initializeSlide10Canvas(slide10Canvas);
}

// Function to download the current canvas as an image
function saveArtwork() {
  const currentCanvas = getCurrentCanvas(); // Get the current canvas
  if (currentCanvas) {
    // Create a temporary link element
    const link = document.createElement("a");

    // Convert the canvas content to a data URL
    link.href = currentCanvas.toDataURL("image/png");

    // Set the download attribute to specify the filename
    link.download = `artwork-slide-${currentSlideIndex + 1}.png`;

    // Programmatically trigger the click event on the link
    link.click();
  } else {
    alert("No artwork found to save!");
  }
}

// Attach the saveArtwork function to the save button
document.getElementById("save-artwork").addEventListener("click", saveArtwork);
