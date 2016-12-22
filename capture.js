var intervalId = setInterval(function(){
  if (instrument()){
    clearInterval(intervalId);
  }
},1000);

//var mediaSource = new MediaSource();
//mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var options;

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
  audio: true,
  video: false
};


function successCallback(stream) {
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  startMediaRecorder();
  /*if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }*/
}

function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}


var recordButton;
var playButton;
var downloadButton;

function instrument(){
  var result = false;
  var $container=$("#client_header > div.channel_header > div.messages_header > div.channel_title_info");
  if ($container.length){
    result = true;
    recordButton  = $("<button class='channel_header_icon channel_calls_button voice_call btn_unstyle ts_tip ts_tip_bottom ts_tip_multiline ts_tip_delay_300 blue_on_hover'></button>");
    var $span = $('<span class="ts_tip_tip"><span class="ts_tip_multiline_inner">Record audio</span></span>');
    var $icon =$('<img class="record-button-off"  aria-hidden="true"></img>');
    $.data($(recordButton)[0],"value","off");
    recordButton.append($span,$icon);
    //playButton  = $("<button></button>").text("Play");
    downloadButton  = $("<button></button>").text("Upload");
    downloadButton.attr("disabled",true);
    
    $container.append(recordButton,playButton,downloadButton);
    
    downloadButton.on("click",function(){
      console.log("downloadButton button clicked");
      download();
    });
    recordButton.on("click",function(){
      console.log("recordButton button clicked");
        if ($.data(recordButton[0],"value") === 'off') {
          recordButton.find("img").toggleClass("record-button-on")
          recordButton.find("img").toggleClass("record-button-off")

          startRecording();
        } 
        else {
          stopRecording();
          $.data($(recordButton)[0],"value","off");
          downloadButton.attr("disabled",false);
        }
    });
  }
  return result;
}
function startRecording() {
  navigator.getUserMedia(constraints, successCallback, errorCallback);
}
function startMediaRecorder(){
  options = {mimeType: 'audio/webm'};
  recordedBlobs = [];
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  }
  catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {mimeType: 'audio/mp3'};
      mediaRecorder = new MediaRecorder(window.stream);//, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'audio/mp3'; // Chrome 47
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' +
            'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
    }
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    $.data($(recordButton)[0],"value","on");

    downloadButton.attr("disabled",true)
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
 }
 function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  //recordedVideo.controls = true;
  recordButton.find("img").toggleClass("record-button-on")
  recordButton.find("img").toggleClass("record-button-off")

  window.stream.getTracks().map(function (val) {
    val.stop();
  });
}

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('audio/mp3');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function download() {
  var blob = new Blob(recordedBlobs, {type: options.mimeType});
  var reader = new FileReader();
  reader.addEventListener("loadend", function() {
   // reader.result contains the contents of blob as a typed array
    console.log("file:"+reader.result);
  });
  reader.readAsArrayBuffer(blob);
  var url1 = window.URL.createObjectURL(blob);
  chrome.runtime.sendMessage({ action: "download", url: url1 , mimeType: options.mimeType}, result=> {
      console.log("Got reply:", result);
  });
  //$("body").trigger('dragover',{dataTransfer:{files:[url1]}});
  //$("body").trigger('drop',{dataTransfer:{files:[url1]}});
  //triggerDragAndDrop("body","body")
  $("#file_upload").val(url1);
  /*
  var x = new XMLHttpRequest();
  x.open('GET', url1);
  x.responseType = 'blob';
  x.onload = function() {
        var url = URL.createObjectURL(x.response);
    // Example: blob:http%3A//example.com/17e9d36c-f5cd-48e6-b6b9-589890de1d23
    // Now pass url to the page, e.g. using postMessage
  chrome.runtime.sendMessage({ action: "download", url: url }, result=> {
      console.log("Got reply:", result);
  });

    /*var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.id="captureID";
    a.download = 'test.mp3';
    document.body.appendChild(a);
    setTimeout(function() {
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    },100);
    
  };
  x.send();*/
  
}

function DumpSupportedMimeTypes(){
  var types=['video/webm;codecs=vp9','audio/webm','audio/ogg','video/mp4','audio/mp3'];
  
  types.forEach(type =>{
    var result = MediaRecorder.isTypeSupported(type);
    console.log("MimeType: "+type+ ' '+result);
  });
}

DumpSupportedMimeTypes();

chrome.runtime.onMessage.addListener(function(message, from, reply){
  if (message.action =="instrument"){
    instrument();
  }
});

