const slides = document.querySelectorAll(".slide");
let currentSlideIndex = 0;
const refreshBtn = document.getElementById("refresh");
const nextBtn = document.getElementById("next");
const previousBtn = document.getElementById("previous");
const startBtn = document.getElementById("start");
const cover = document.querySelector(".cover");

// 슬라이드별 문구 데이터
const slideDescriptions = [
  "Life, they say, is about connecting the right dots.",
  "These predetermined dots trace once path, a single way forward.",
  "Everyone follows the same trail , chasing the same purpose,",
  "rarely questioning what is truly right for them.",
  "But this opportunity is not for everyone. ",
  "Choosing a different path means confronting fear.",
  "It feels safe to follow others.",
  "Groups form, clustering individual into one among many.",
  "We are constantly connected, we feel complete and safe.",
  "Yet an invisible line divides each individual, an unspoken competition.",
  "To progress quickly, a hierarchical structure is deemed efficient. ",
  "We instinctively conform to it to survive, rarely questioning the direction and decisions.",
  "As everyone complies, raising objection feels abnormal.",
  "This who do are labeled as ‘peculiar’. ",
  "And something inside us slowly withers. ",
  "This realm of normality is painfully narrow.",
  "Some quietly veer off course from this structure. ",
  "It takes immense courage to do so, but it doesn’t mean weakness or abnormality.",
  "Once stepped outside, it feels nice. ",
  "And we can place our own dots wherever we desire.",
  "Or we might not need guidelines at all.",
  "What we draw shapes who we are. ",
  "What matters is what I feel and think, not others.",
];

// 이전 점의 좌표
let lastX = null;
let lastY = null;

// 커버 숨기기
startBtn.addEventListener("click", () => {
  if (cover) {
    cover.style.display = "none";
  }
});

// 슬라이드 표시 함수
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? "block" : "none";
  });

  // 버튼 활성화/비활성화
  previousBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;

  // 슬라이드 카운터와 문구 업데이트
  const counter = document.querySelector(".description p:first-child");
  const description = document.getElementById("slide-description");

  if (counter) {
    counter.textContent = `${index + 1}/${slides.length}`; // 슬라이드 카운터
  }

  if (description) {
    description.textContent = slideDescriptions[index]; // 슬라이드 문구
  }

  // 이전 점 초기화 (새 슬라이드에서 새로운 선 그리기)
  lastX = null;
  lastY = null;
}

// 초기화: 첫 번째 슬라이드 표시
showSlide(currentSlideIndex);

// 다음 버튼
nextBtn.addEventListener("click", () => {
  if (currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
  }
});

// 이전 버튼
previousBtn.addEventListener("click", () => {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    showSlide(currentSlideIndex);
  }
});

// 새로고침 버튼
refreshBtn.addEventListener("click", () => {
  const currentCanvas = getCurrentCanvas();
  if (currentCanvas) {
    const ctx = currentCanvas.getContext("2d");
    ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
  }
  lastX = null;
  lastY = null;
});

// 현재 슬라이드의 캔버스를 가져오기
function getCurrentCanvas() {
  return slides[currentSlideIndex].querySelector(".drawing-canvas");
}

// 캔버스 초기화
function initializeCanvas(canvas) {
  const ctx = canvas.getContext("2d");

  // 고정된 캔버스 스타일 크기
  const width = 756; // 스타일 너비
  const height = 650; // 스타일 높이

  // 캔버스의 스타일 크기를 설정
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // 고해상도 디스플레이 지원 (devicePixelRatio)
  const ratio = window.devicePixelRatio || 1;

  // 캔버스의 실제 픽셀 크기를 설정
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  // 스케일링 적용 (고해상도 디스플레이 대응)
  ctx.scale(ratio, ratio);

  // 클릭 이벤트 추가
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect(); // 캔버스의 경계 좌표

    // 뷰포트 기준 좌표를 캔버스 내부 좌표로 변환
    const x = ((e.clientX - rect.left) * (canvas.width / rect.width)) / ratio;
    const y = ((e.clientY - rect.top) * (canvas.height / rect.height)) / ratio;

    // 점 찍기
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2); // 반지름 3px의 원
    ctx.fillStyle = "#f54e42"; // 점 색상
    ctx.fill();

    // 이전 점이 있다면 선을 그림
    if (lastX !== null && lastY !== null) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY); // 이전 점
      ctx.lineTo(x, y); // 현재 점
      ctx.strokeStyle = "#f54e42"; // 선 색상
      ctx.lineWidth = 2; // 선 두께
      ctx.stroke();
    }

    // 현재 점을 이전 점으로 저장
    lastX = x;
    lastY = y;
  });

  // 더블 클릭 이벤트 추가
  canvas.addEventListener("dblclick", () => {
    // 이전 점 초기화 (새로운 선 시작)
    lastX = null;
    lastY = null;
  });
}

// 모든 슬라이드의 캔버스 초기화
slides.forEach((slide) => {
  const canvas = slide.querySelector(".drawing-canvas");
  if (canvas) {
    initializeCanvas(canvas);
  }
});
