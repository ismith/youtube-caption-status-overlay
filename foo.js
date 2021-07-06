/*
 * python3 -m http.server 8000
 *
 * var script = document.createElement("script");
 * script.src="http://localhost:8000/foo.js";
 * document.body.appendChild(script)
 */

// START

function getAllVideoThumbnails() { // -> [Node]
  const selector = "a.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail";
  var nodes = document.documentElement.querySelectorAll(selector);

  // NodeList -> [obj (Node)]
  return Array.prototype.slice.call(nodes);
}

// -> {}, or {baseUrl: string, isTranslatable: bool, kind: string?, languageCode: string, name: { simpleText: string }, vss.Id: string}
//
// languageCode values seen so far: undefined|en|en-US
// kind: undefined|asr
function thumbnailCaptions(e) {
  const url = e.href;

  return fetch(url)
    .then(r => r.text())
    .then(t => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(t, 'text/html');
      const script = Array.prototype.slice.call(doc.documentElement.querySelectorAll('body script'))
        .find(e => e.innerText.includes('var ytInitialPlayerResponse'))

      const s = script.innerText.replace('var ytInitialPlayerResponse = ', '')
        .replace(/;var meta.*/, '')

      const j = JSON.parse(s);

      return j
    })
     .then(j => {
       if (j.captions === undefined) {
         return []
       } else {
         return j.captions.playerCaptionsTracklistRenderer.captionTracks;
       }
     })
}

function nodeDisplayToggle(e) {
  if (e.style.display === 'none') {
    e.style.display = null;
  } else {
    e.style.display = 'none'
  }
}

function nodeAddClass(e, newClass) {
  e.classList += (" " + newClass)
}

// annotates with either 'captions-none' or a list of
// 'captions-asr-{{languageCode}}' and 'captions-{{languageCode}}' classes
function annotateThumbnails() {
  const thumbnails = getAllVideoThumbnails();
  const base = "captions";

  thumbnails.forEach(tn => {
    const captions = thumbnailCaptions(e)
      .then(e => { e
          .map(c => {
      if (c.kind === undefined && c.languageCode === undefined) {
        return base + "-undefined";
      } else if (c.kind === undefined) {
        return base + "-" + c.languageCode
      } else {
        return base + "-asr-" + c.languageCode
      }
      })
      })
  });

// most of below should be in a promise, not sure where.
    if (captions.length === 0) {
      const newClasses = "captions-none"
    } else {
      const newClasses = captions.join(" ")
    }

    console.log("New classes: " + newClasses)

    tn.classList += (" " + newClasses);
  })
}
