/***
 * The main js file which contains all the required functions
 */

const fs = require("fs");
const url = require("url");
var CryptoJS = require("crypto-js");
const cryptoJs = require("crypto-js");

let base_url = "https://gogoanime.gg/";
const entry = {};
const videoUrl = {};
let hls = new Hls();
videoUrl.enc_key_api =
  "https://raw.githubusercontent.com/justfoolingaround/animdl-provider-benchmarks/master/api/gogoanime.json";
videoUrl.ajax_url = "/encrypt-ajax.php?";

//TODO
function haveToDone(){
  alert("We will add functionality soon.. :)");
}

function takeQuery() {
  /***
   * Takes input from user and passes it to another function
   */
  let param = document.getElementById("anime_query").value;
  document.getElementById("searchAnime").disabled = true;
  searchAnime(param);
}

function searchAnime(search_param) {
  /***
   *  Get all category links and names of a query and passes them to another function.
   */
  let search_url = base_url + "/search.html?keyword=" + search_param;
  fetch(search_url)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.text();
    })
    .then((data) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(data, "text/html");
      let x = htmlDoc.getElementsByClassName("img");
      let names = [];
      let links = [];

      for (let i = 0; i < x.length; i++) {
        names.push(x[i].innerHTML.split("=")[2].split(">")[0]);
        links.push(x[i].innerHTML.split("=")[1].split(" ")[0]);
      }
      console.log(names);
      console.log(links);
      chooseShow(names, links);
    });
}

function chooseShow(names, links) {
  /***
   * Shows search results of query
   */
  let mylist = document.getElementById("itsmylist");
  console.log(names.length);
  for (let i = 0; i < names.length; i++) {
    let newbt = document.createElement("button");
    newbt.type = "button";
    newbt.className = "list-group-item list-group-item-action";
    newbt.id = links[i].replace(/"/g, "");
    newbt.setAttribute("onclick", "showSelected(this.id, this.textContent)");
    newbt.textContent = names[i].replace(/"/g, "");
    mylist.appendChild(newbt);
  }
  document.getElementById("searchAnime").disabled = false;
  let backbtn = document.getElementById("searchAnime");
  backbtn.innerHTML = `<i class="fas fa-arrow-left" style="font-size: 22px;"></i>`;
  backbtn.setAttribute("onclick", "goBackfromShowList()");
  console.log("success");
}

function goBackfromShowList() {
  let par = document.getElementById("itsmylist");
  removeAllChildNodes(par);
  let backbtn = document.getElementById("searchAnime");
  backbtn.innerHTML = `<i class="fa fa-search"></i>`;
  backbtn.setAttribute("onclick", "takeQuery()");
  document.getElementById("anime_query").focus();
}

function removeAllChildNodes(parent) {
  /***
   * Removes all childeNodes of given parent
   */
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function showSelected(link, name) {
  /***
   * Fetches the number of episodes in a selected show
   */
  let par = document.getElementById("itsmylist");
  removeAllChildNodes(par);
  let search_url = base_url + link;
  entry.category_url = search_url;
  entry.show_name = name;
  fetch(search_url)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.text();
    })
    .then((data) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(data, "text/html");
      let x = htmlDoc.getElementById("episode_page");
      let y = x.getElementsByClassName("active");
      let ep_end = y[0].getAttribute("ep_end");
      let find_id = htmlDoc.getElementById("movie_id");
      entry.category_id = find_id.value;
      entry.ep_end = ep_end;
      printEpisodes(ep_end);
    });
}

function printEpisodes(ep_end) {
  /***
   * Shows episodes available for selected show
   */
  console.log(ep_end);
  let myeplist = document.getElementById("epList");
  for (let i = 1; i <= ep_end; i++) {
    let newbt = document.createElement("button");
    newbt.className = "epibtn";
    newbt.setAttribute("onclick", "episodeSelected(this.textContent)");
    newbt.textContent = i;
    myeplist.appendChild(newbt);
  }
  let backbtn = document.getElementById("searchAnime");
  backbtn.setAttribute("onclick", "goBackfromEpisodes()");
}

function goBackfromEpisodes() {
  let myeplist = document.getElementById("epList");
  removeAllChildNodes(myeplist);
  let backbtn = document.getElementById("searchAnime");
  backbtn.innerHTML = `<i class="fa fa-search"></i>`;
  backbtn.setAttribute("onclick", "takeQuery()");
  document.getElementById("anime_query").focus();
}

function hideVisibility(element) {
  element.style.visibility = "hidden";
}

/***
 * Functions down below fetches embed and stream url
 */

function episodeSelected(ep_num) {
  let myeplist = document.getElementById("epList");
  hideVisibility(myeplist);
  document.getElementById("searchAnime").disabled = true;
  let animeImg = document.getElementById("anime-img");
  if (animeImg === null) {
    // const hls = new Hls();
    // let video = document.getElementById("my-player");
    // hls.attachMedia(video);
    hls.stopLoad();
    hls.destroy();
    hls = new Hls();

    // return;
    console.log("first");
    videoUrl.ajax_url = "/encrypt-ajax.php?";
  } else {
    let video = document.createElement("video");
    video.id = "my-player";
    video.setAttribute("controls", "true");
    animeImg.replaceWith(video);
  }

  console.log(ep_num);
  console.log(entry.category_id);
  let url = new URL("https://ajax.gogo-load.com/ajax/load-list-episode");
  url.search = new URLSearchParams({
    ep_start: ep_num,
    ep_end: ep_num,
    id: entry.category_id,
  });
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.text();
    })
    .then((data) => {
      // console.log(data);
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(data, "text/html");
      let x = htmlDoc.getElementsByTagName("a");
      entry.ep_url = base_url + x[0].getAttribute("href").trim();
      console.log(x[0].getAttribute("href"));
      embedUrl();
    });
}

function embedUrl() {
  fetch(entry.ep_url)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.text();
    })
    .then((data) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(data, "text/html");
      let x = htmlDoc.getElementsByClassName("active");
      entry.embed_url = "https:" + x[0].getAttribute("data-video");
      console.log(entry.embed_url);

      let urlObject = url.parse(entry.embed_url, true);
      videoUrl.ajax_url =
        urlObject.protocol + "//" + urlObject.host + videoUrl.ajax_url;
      console.log(videoUrl.ajax_url);
      get_data();
    });
}

function get_data() {
  let crypt;
  fetch(entry.embed_url)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.text();
    })
    .then((data) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(data, "text/html");
      let x = htmlDoc.getElementsByTagName("script");
      for (let i = 0; i < x.length; i++) {
        if (x[i].hasAttribute("data-name")) {
          if (x[i].getAttribute("data-name") === "episode") {
            crypt = x[i].getAttribute("data-value");
            break;
          }
        }
      }

      console.log(crypt);
      getEncryKeys(crypt);
    });
}

function getEncryKeys(crypt) {
  fetch(videoUrl.enc_key_api)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.json();
    })
    .then((data) => {
      videoUrl.iv = data.iv;
      videoUrl.key = data.key;
      videoUrl.second_key = data.second_key;
      console.log(videoUrl.iv);
      console.log(videoUrl.key);
      console.log(videoUrl.second_key);
      crypting(crypt);
    });
}

function crypting(crypt) {
  console.log("inside");
  data = crypt;
  key = cryptoJs.enc.Utf8.parse(videoUrl.key);
  iv = cryptoJs.enc.Utf8.parse(videoUrl.iv);

  var cipherParams = cryptoJs.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(data),
  });

  var decryptedFromText = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv });
  let decoded = decryptedFromText.toString(CryptoJS.enc.Utf8);
  console.log(decoded);
  let jugad = "https://geeksforgeeks.org/projects?" + decoded;
  let urlObject = url.parse(jugad, true);
  console.log(urlObject.query);
  videoUrl.data = urlObject.query;

  let uobj = url.parse(entry.embed_url, true);
  console.log(uobj.query.id);
  videoUrl.em_id = uobj.query.id;

  let temp = videoUrl.em_id;

  var encryptedCP = CryptoJS.AES.encrypt(temp, key, { iv: iv });
  var cryptText = encryptedCP.toString();
  console.log(cryptText);
  videoUrl.data.id = cryptText;
  console.log(videoUrl.data);
  get_jason();
}

function get_jason() {
  const params = new URLSearchParams({});
  for (let keys in videoUrl.data) {
    params.append(keys, videoUrl.data[keys]);
  }
  console.log(params.toString());
  let dataToSparams = params.toString();
  let search_url =
    videoUrl.ajax_url + dataToSparams + "&alias=" + videoUrl.em_id;
  parameters = {
    method: "POST",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      referer: entry.embed_url,
    },
  };
  fetch(search_url, parameters)
    .then((response) => {
      if (!response.ok) {
        throw console.error("EROOOOOOR");
      }
      return response.json();
    })
    .then((data) => {
      console.log(JSON.stringify(data));
      key = cryptoJs.enc.Utf8.parse(videoUrl.second_key);
      iv = cryptoJs.enc.Utf8.parse(videoUrl.iv);
      var cipherParams = cryptoJs.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(data.data),
      });
      var decryptedFromText = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
      });
      let decoded = decryptedFromText.toString(CryptoJS.enc.Utf8);
      decoded = JSON.parse(decoded);
      console.log(decoded["source"]);
      let source_data = [];
      for (let x in decoded["source"]) {
        source_data.push(decoded["source"][x]);
      }

      set_quality(source_data);
    });
}

function set_quality(jason_data) {
  /***
   * To DO :- Add functionality to choose quality
   */
  entry.quality = "";
  console.log(jason_data[0]["file"]);
  creat_player(jason_data[0]["file"]);
}

function creat_player(stream_url) {
  /***
   * Plays video
   */
  let video = document.getElementById("my-player");
  let videoSrc = stream_url;
  if (Hls.isSupported()) {
    // const hls = new Hls();
    console.log(videoSrc);
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = videoSrc;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  }

  let myeplist = document.getElementById("epList");
  showVisibility(myeplist);
}

function showVisibility(element) {
  console.log("inside shsowvisi");
  element.style.visibility = "visible";
  document.getElementById("searchAnime").disabled = false;
  let backbtn = document.getElementById("searchAnime");
  backbtn.setAttribute("onclick", "gofromStream()");
  // let btns = element.getElementsByClassName("epibtn");
  // for (let i = 0; i < btns.length; i++) {
  //   btns[i].setAttribute("onclick", "changeEpi(this.textcontent)");
  // }
}

function gofromStream() {
  hls.stopLoad();
  hls.destroy();
  hls = new Hls();
  let animeImg = document.createElement("img");
  animeImg.setAttribute("src", "../public/image-removebg.png");
  animeImg.setAttribute("id", "anime-img");
  let video = document.getElementById("my-player");
  video.replaceWith(animeImg);
  let par = document.getElementById("epList");
  removeAllChildNodes(par);
  let backbtn = document.getElementById("searchAnime");
  backbtn.innerHTML = `<i class="fa fa-search"></i>`;
  backbtn.setAttribute("onclick", "takeQuery()");
  document.getElementById("anime_query").focus();
}

function changeEpi(ep_num) {
  console.log("inside changeEpi");
  let video = document.getElementById("my-player");
  hls.attachMedia(video);
  hls.stopLoad();
  // hls.destroy();
  console.log("first");
  videoUrl.ajax_url = "/encrypt-ajax.php?";
  episodeSelected(ep_num);
}
