// Console log to indicate the initialization of the script
console.log("Initializing script");

// Initialize variables
let curSong = new Audio();
let curFolder;
let songs;
let songNames;

// Function to fetch and display song names in the specified folder
async function getSongNames(folder) {
  curFolder = folder;
  let a = await fetch(`https://pranay-spotify.000webhostapp.com/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");
  let songs = [];
  
  // Iterate through anchor elements and extract song names
  for (let index = 0; index < anc.length; index++) {
    const element = anc[index];
    if (element.innerHTML.endsWith(".mp3")) {
      songs.push(element.innerHTML);
    }
  }
  
  // Display the song list in the HTML
  let songol = document
    .querySelector(".song-list")
    .getElementsByTagName("ol")[0];
  songol.innerHTML = "";
  for (const song of songs) {
    songol.innerHTML =
      songol.innerHTML +
      `<li>
        <img class="invert aspect2" src="assets/music.svg" alt="music">
        <div class="song-name">${song}</div>
        <img class="invert aspect2" src="assets/play.svg" alt="play">
      </li>`;
  }

  // Add click event listeners to each song item
  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      // Pause the current song if playing
      if (curSong.played) {
        curSong.pause();
      }
      
      // Play the selected audio track
      playaudio(e.innerText);
      
      // Update time and progress as the audio plays
      curSong.addEventListener("timeupdate", () => {
        document.querySelector(
          ".song-time"
        ).innerHTML = `${secondsToMinutesSeconds(
          curSong.currentTime
        )}/${secondsToMinutesSeconds(curSong.duration)}`;
        document.querySelector(".circle").style.left =
          (curSong.currentTime / curSong.duration) * 100 + "%";
      });
    });
  });
  
  return songs;
}

// Function to fetch and return the list of audio tracks in the specified folder
async function getSongs(folder) {
  curFolder = folder;
  let a = await fetch(`https://pranay-spotify.000webhostapp.com/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");
  let songs = [];
  
  // Iterate through anchor elements and extract audio track URLs
  for (let index = 0; index < anc.length; index++) {
    const element = anc[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  
  return songs;
}

// Function to play the specified audio track
function playaudio(track, pause = false) {
  curSong = new Audio(`/${curFolder}/` + track);
  if (!pause) {
    // Play the audio track and update play button icon
    curSong.play();
    play.src = "assets/pause.svg";
  }
  
  // Update song information in the HTML
  document.querySelector(".song-info").innerHTML = track;
  document.querySelector(".song-time").innerHTML = "00:00/00:00";
  
  // Update time and progress as the audio plays
  curSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(
      curSong.currentTime
    )}/${secondsToMinutesSeconds(curSong.duration)}`;
    document.querySelector(".circle").style.left =
      (curSong.currentTime / curSong.duration) * 100 + "%";
  });
}

// Function to convert seconds to formatted minutes and seconds
function secondsToMinutesSeconds(seconds) {
  // Ensure the input is a non-negative number
  if (typeof seconds !== "number" || seconds < 0) {
    return "Invalid input";
  }

  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros if necessary
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch and display album information
async function dispayAlbums() {
  let a = await fetch(`https://pranay-spotify.000webhostapp.com/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");
  let array = Array.from(anc);
  
  // Iterate through anchor elements to display album cards
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      folder = e.innerText.slice(0, e.innerText.length - 1);
      
      // Fetch album information from JSON file
      let a = await fetch(`https://pranay-spotify.000webhostapp.com/songs/${folder}/info.json`);
      let response = await a.json();
      
      // Display album card in the HTML
      let cardContainer = document.querySelector(".card-container");
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card m2">
          <div class="play">
            <img src="assets/play.svg" height="16" width="12" alt="play">         
          </div>
          <img src="https://pranay-spotify.000webhostapp.com/songs/${folder}/cover.jpg" alt="">
          <h4>${response.title}</h4>
          <p>${response.description}</p>
        </div>`;
    }
  }
  
  // Add click event listeners to each album card
  Array.from(document.getElementsByClassName("card")).forEach((element) => {
    element.addEventListener("click", async (e) => {
      // Pause the current song if playing
      if (curSong.played) {
        curSong.pause();
        songs = await getSongs(`songs/${element.dataset.folder}`);
        songNames = await getSongNames(`songs/${element.dataset.folder}`);
        playaudio(songNames[0], false);
      } else {
        songs = await getSongs(`songs/${element.dataset.folder}`);
        songNames = await getSongNames(`songs/${element.dataset.folder}`);
        playaudio(songNames[0], true);
      }
    });
  });
  
  // Add click event listener to play/pause button
  play.addEventListener("click", () => {
    if (curSong.paused) {
      curSong.play();
      play.src = "assets/pause.svg";
    } else {
      curSong.pause();
      play.src = "assets/play.svg";
    }
  });
  
  // Add click event listener to seekbar for changing playback position
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    curSong.currentTime = (curSong.duration * percent) / 100;
  });
  
  // Add click event listener to hamburger icon for opening the menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
    document.body.style.overflow = "hidden";
  });
  
  // Add click event listener to close icon for closing the menu
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
    document.body.style.overflow = "visible";
  });
  
  // Add click event listeners to previous and next buttons
  prev.addEventListener("click", () => {
    let index = songs.indexOf(curSong.src);
    if (index - 1 > -1) {
      curSong.pause();
      playaudio(songNames[index - 1]);
      curSong.addEventListener("timeupdate", () => {
        document.querySelector(
          ".song-time"
        ).innerHTML = `${secondsToMinutesSeconds(
          curSong.currentTime
        )}/${secondsToMinutesSeconds(curSong.duration)}`;
        document.querySelector(".circle").style.left =
          (curSong.currentTime / curSong.duration) * 100 + "%";
      });
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(curSong.src);
    if (index + 1 < songs.length) {
      curSong.pause();
      playaudio(songNames[index + 1]);
      curSong.addEventListener("timeupdate", () => {
        document.querySelector(
          ".song-time"
        ).innerHTML = `${secondsToMinutesSeconds(
          curSong.currentTime
        )}/${secondsToMinutesSeconds(curSong.duration)}`;
        document.querySelector(".circle").style.left =
          (curSong.currentTime / curSong.duration) * 100 + "%";
      });
    }
  });
  
  // Add event listener for changing volume using the volume slider
  let volume = document.getElementById("volume");
  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      curSong.volume = parseInt(e.target.value) / 100;
      volume.src = "assets/volume.svg";
    });
  
  // Add click event listener to volume icon for muting/unmuting
  volume.addEventListener("click", () => {
    if (curSong.volume != 0) {
      volume.src = "assets/mute.svg";
      curSong.volume = 0;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      volume.src = "assets/volume.svg";
      curSong.volume = 0.2;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 20;
    }
  });
  
  // Fetch initial list of songs and song names and play the first song
}

// Main function to initiate the music player
async function main() {
  dispayAlbums();
}

// Call the main function to start the music player
main();
