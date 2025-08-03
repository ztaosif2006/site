import { songs } from './songs.js';

const audio = document.getElementById("audio");
const progress = document.getElementById("progress");
const playPauseBtn = document.querySelector(".play-pause-btn");
const prevBtn = document.querySelector(".backward");
const nextBtn = document.querySelector(".forward");
const shuffleBtn = document.querySelector(".shuffle");
const loopBtn = document.querySelector(".loop");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");
const swiperWrapper = document.getElementById("swiper-wrapper");
const currentTimeDisplay = document.getElementById("current-time");
const totalTimeDisplay = document.getElementById("total-time");
const songListBtn = document.getElementById("song-list-btn");
const songListOverlay = document.getElementById("song-list-overlay");
const songList = document.getElementById("song-list");
const closeOverlayBtn = document.getElementById("close-overlay");

let currentTrackIndex = 0;
let isShuffle = false;
let isLoop = false;
let isUserSlidingSwiper = false;
let swiper;
let lastBackwardClickTime = 0;
const backwardDoubleClickThreshold = 300; // ms

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateTrackAndUI() {
  const song = songs[currentTrackIndex];
  songTitle.textContent = song.title;
  artistName.textContent = song.name;
  audio.src = song.source;
  progress.value = 0;
  
  const songItems = document.querySelectorAll('#song-list li');
  songItems.forEach(item => item.classList.remove('active'));
  if (songItems[currentTrackIndex]) {
    songItems[currentTrackIndex].classList.add('active');
  }

  audio.addEventListener('loadedmetadata', () => {
    progress.max = audio.duration;
    totalTimeDisplay.textContent = formatTime(audio.duration);
  }, { once: true });
}

function playAudio() {
  audio.play()
    .then(() => {
      playPauseBtn.innerHTML = '<img src="https://ar3ne.pages.dev/resources/images/main/button/pause.svg" alt="Pause">';
      playPauseBtn.title = "Pause";
    })
    .catch(e => console.log("Playback prevented:", e));
}

function pauseAudio() {
  audio.pause();
  playPauseBtn.innerHTML = '<img src="https://ar3ne.pages.dev/resources/images/main/button/play.svg" alt="Play">';
  playPauseBtn.title = "Play";
}

function togglePlayPause() {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function slideToIndex(index) {
  isUserSlidingSwiper = false;
  swiper.slideTo(index);
}

function playNextTrack() {
  if (isLoop) {
    audio.currentTime = 0;
    return playAudio();
  }
  
  if (isShuffle) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === currentTrackIndex && songs.length > 1);
    currentTrackIndex = nextIndex;
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % songs.length;
  }
  
  updateTrackAndUI();
  slideToIndex(currentTrackIndex);
  playAudio();
}

function handleBackwardClick() {
  const now = Date.now();
  if (now - lastBackwardClickTime < backwardDoubleClickThreshold) {
    lastBackwardClickTime = 0;
    if (isShuffle) {
      let prevIndex;
      do {
        prevIndex = Math.floor(Math.random() * songs.length);
      } while (prevIndex === currentTrackIndex && songs.length > 1);
      currentTrackIndex = prevIndex;
    } else {
      currentTrackIndex = (currentTrackIndex - 1 + songs.length) % songs.length;
    }
    updateTrackAndUI();
    slideToIndex(currentTrackIndex);
    playAudio();
  } else {
    lastBackwardClickTime = now;
    audio.currentTime = 0;
    if (audio.paused) {
      playAudio();
    }
  }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  if (isShuffle) {
    isLoop = false;
    loopBtn.classList.remove("active");
  }
}

function toggleLoop() {
  isLoop = !isLoop;
  loopBtn.classList.toggle("active", isLoop);
  if (isLoop) {
    isShuffle = false;
    shuffleBtn.classList.remove("active");
  }
}

function showSongList() {
  songListOverlay.classList.add("active");
  songList.innerHTML = songs.map((song, index) =>
    `<li data-index="${index}" class="${index === currentTrackIndex ? 'active' : ''}">${song.title} - ${song.name}</li>`
  ).join('');
}

function closeSongList() {
  songListOverlay.classList.remove("active");
}

function initSwiperAndSlides() {
  swiperWrapper.innerHTML = "";
  songs.forEach((song, index) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    slide.dataset.index = index;
    const img = document.createElement("img");
    img.src = song.cover;
    img.alt = song.title;
    img.loading = "lazy";
    slide.appendChild(img);
    swiperWrapper.appendChild(slide);
    
    slide.addEventListener("click", () => {
      if (currentTrackIndex !== index) {
        currentTrackIndex = index;
        updateTrackAndUI();
        slideToIndex(index);
        playAudio();
      }
    });
    
    slide.addEventListener('mousedown', () => {
      isUserSlidingSwiper = true;
    });
  });

  swiper = new Swiper(".swiper", {
    effect: "coverflow",
    centeredSlides: true,
    slidesPerView: "auto",
    grabCursor: true,
    spaceBetween: 40,
    initialSlide: currentTrackIndex,
    coverflowEffect: {
      rotate: 25,
      stretch: 0,
      depth: 50,
      modifier: 1,
      slideShadows: false,
    }
  });

  swiper.on("slideChange", () => {
    if (isUserSlidingSwiper) {
      currentTrackIndex = swiper.activeIndex;
      updateTrackAndUI();
      playAudio();
      isUserSlidingSwiper = false;
    }
  });
}

function handleKeyDown(e) {
  switch(e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowRight':
      playNextTrack();
      break;
    case 'ArrowLeft':
      handleBackwardClick();
      break;
    case 'KeyS':
      toggleShuffle();
      break;
    case 'KeyL':
      toggleLoop();
      break;
    case 'KeyM':
      if (songListOverlay.classList.contains('active')) {
        closeSongList();
      } else {
        showSongList();
      }
      break;
  }
}

function init() {
  initSwiperAndSlides();
  updateTrackAndUI();
  
  audio.play().catch(e => console.log("Autoplay blocked:", e));

  // Event listeners
  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", () => {
    isUserSlidingSwiper = true;
    playNextTrack();
  });
  prevBtn.addEventListener("click", handleBackwardClick);
  shuffleBtn.addEventListener("click", toggleShuffle);
  loopBtn.addEventListener("click", toggleLoop);
  songListBtn.addEventListener("click", showSongList);
  closeOverlayBtn.addEventListener("click", closeSongList);

  audio.addEventListener("timeupdate", () => {
    progress.value = audio.currentTime;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
  });
  
  audio.addEventListener("loadedmetadata", () => {
    progress.max = audio.duration;
    totalTimeDisplay.textContent = formatTime(audio.duration);
  });
  
  progress.addEventListener("input", () => {
    audio.currentTime = progress.value;
  });

  progress.addEventListener("change", () => {
    if (audio.paused) {
      playAudio();
    }
  });
  
  audio.addEventListener("ended", playNextTrack);
  
  audio.addEventListener('error', () => {
    console.error("Error loading audio");
    playNextTrack();
  });

  songList.addEventListener("click", (event) => {
    if (event.target.tagName === 'LI') {
      currentTrackIndex = parseInt(event.target.dataset.index);
      updateTrackAndUI();
      closeSongList();
      playAudio();
      slideToIndex(currentTrackIndex);
    }
  });

  document.addEventListener('keydown', handleKeyDown);
}

document.addEventListener("DOMContentLoaded", init);
