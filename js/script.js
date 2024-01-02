console.log("initilizing script");
let curSong = new Audio();
let curFolder;
let songs;
let songNames;
async function getSongNames(folder) {
  curFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < anc.length; index++) {
    const element = anc[index];
    if (element.innerHTML.endsWith(".mp3")) {
      songs.push(element.innerHTML);
    }
  }
  let songol = document
    .querySelector(".song-list")
    .getElementsByTagName("ol")[0];
  songol.innerHTML = "";
  for (const song of songs) {
    songol.innerHTML =
      songol.innerHTML +
      `<li>
    <img class="invert aspect2" src="assets/music.svg" alt="music">
    <div class="song-name">${song}
    </div>
      <img class="invert aspect2" src="assets/play.svg" alt="play">
  </li>`;
  }
  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      if (curSong.played) {
        curSong.pause();
      }
      playaudio(e.innerText);
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
async function getSongs(folder) {
  curFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < anc.length; index++) {
    const element = anc[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
}
function playaudio(track, pause = false) {
  curSong = new Audio(`/${curFolder}/` + track);
  if (!pause) {
    curSong.play();
    play.src = "assets/pause.svg";
  }
  document.querySelector(".song-info").innerHTML = track;
  document.querySelector(".song-time").innerHTML = "00:00/00:00";
  curSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(
      curSong.currentTime
    )}/${secondsToMinutesSeconds(curSong.duration)}`;
    document.querySelector(".circle").style.left =
      (curSong.currentTime / curSong.duration) * 100 + "%";
  });
}
function secondsToMinutesSeconds(seconds) {
  // Ensure the input is a non-negative number
  if (typeof seconds !== "number" || seconds < 0) {
    return "Invalid input";
  }

  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function dispayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anc = div.getElementsByTagName("a");
  let array = Array.from(anc);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      folder = e.innerText.slice(0, e.innerText.length - 1);
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      let cardContainer = document.querySelector(".card-container");
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card m2">
      <div class="play">
        <img src="assets/play.svg" height="16" width="12" alt="play">         
      </div>
      <img src="http://127.0.0.1:3000/songs/${folder}/cover.jpg" alt="">
      <h4>${response.title}</h4>
      <p>${response.description}</p>
    </div>`;
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach((element) => {
    element.addEventListener("click", async (e) => {
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
  play.addEventListener("click", () => {
    if (curSong.paused) {
      curSong.play();
      play.src = "assets/pause.svg";
    } else {
      curSong.pause();
      play.src = "assets/play.svg";
    }
  });
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    curSong.currentTime = (curSong.duration * percent) / 100;
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
    document.body.style.overflow = "hidden";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
    document.body.style.overflow = "visible";
  });
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
  let volume = document.getElementById("volume");
  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      curSong.volume = parseInt(e.target.value) / 100;
      volume.src = "assets/volume.svg";
    });
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
  songs = await getSongs(
    `songs/${document.querySelector(".card").dataset.folder}`
  );
  songNames = await getSongNames(
    `songs/${document.querySelector(".card").dataset.folder}`
  );
  playaudio(songNames[0], true);
}

async function main() {
  dispayAlbums();
}
main();
