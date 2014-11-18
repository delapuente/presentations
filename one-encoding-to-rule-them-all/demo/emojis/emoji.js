
(function () {
  'use strict';

  get('./emoji.txt').then(function (messagebytes) {

    printBuffer(messagebytes);
    console.log(messagebytes.length);

    // Transform to code points
    var unicode = decodeToUnicode(messagebytes);
    console.log(unicode);
    console.log(unicode.length);

    var result = encodeToHTML(unicode);
    document.querySelector('#result').appendChild(result);
  });

  function get(url) {
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        resolve(new Uint8Array(xhr.response));
      };
      xhr.send();
    });
  }

  function printBuffer(buffer) {
    var array = new Uint8Array(buffer);
    var bytes = [];
    for (var i = 0, b; (b = array[i]); i++) {
      bytes.push(b.toString(16));
    }
    console.log(bytes);
  }

  function decodeToUnicode(utf8data) {
    var codepoints = [];
    var i = 0, codeunit;
    var b0, b1, b2, b3;
    while (i < utf8data.length) {
      codeunit = utf8data[i];

      // 4 code units for a glyph
      if (codeunit >= 0xf0) {
        b3 = (codeunit & 0x07) << 18;
        b2 = (utf8data[i+1] & 0x3f) << 12;
        b1 = (utf8data[i+2] & 0x3f) << 6;
        b0 = (utf8data[i+3] & 0x3f);
        codepoints.push(b3 | b2 | b1 | b0);
        i += 4;
      }

      // 3 code units for a glyph
      else if (codeunit >= 0xe0) {
        b2 = (codeunit & 0x0f) << 12;
        b1 = (utf8data[i+1] & 0x3f) << 6;
        b0 = (utf8data[i+2] & 0x3f);
        codepoints.push(b2 | b1 | b0);
        i += 3;
      }

      // 2 code units for a glyph
      else if (codeunit >= 0xc0) {
        b1 = (codeunit & 0x1f) << 6;
        b0 = (utf8data[i+1] & 0x3f);
        codepoints.push(b1 | b0);
        i += 2;
      }

      // 1 code unit for a glyph
      else if (codeunit < 0x80) {
        codepoints.push(codeunit);
        i += 1;
      }
      else {
        console.error('Unknown code!');
        i++;
      }
    }
    return codepoints;
  }

  function encodeToHTML(unicode) {
    var node, emojiClass;
    var buffer = document.createDocumentFragment();
    var isEmoji = function (cp) { return cp > (0x01 << 16); };
    // Is Regional Symbol Indicator
    var isRIS = function (cp) { return cp >= 0x1f1e6 && cp <= 0x1f1ff; };

    for (var i = 0, codepoint; (codepoint = unicode[i]); i++) {
      if (!node) { node = document.createTextNode(''); }

      if (isEmoji(codepoint)) {
        // Append last text node
        buffer.appendChild(node);

        // Create the emoji node
        node = document.createElement('span');
        node.classList.add('emoji');
        emojiClass = 'emoji' + codepoint.toString(16);
        // Fuse RIS emojis
        if (isRIS(codepoint)) {
          emojiClass += '-' + unicode[i+1].toString(16);
          i++;
        }
        node.classList.add(emojiClass);
        buffer.appendChild(node);

        node = null;
      }
      else {
        node.textContent += String.fromCharCode(codepoint);
      }
    }
    if (node) { buffer.appendChild(node); }
    return buffer;
  }
}());
