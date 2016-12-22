// Handle requests for passwords
chrome.runtime.onMessage.addListener(function(request) {
    var ext = request.mimeType.split("/");
    if (ext.length>1){
        ext = ext[1];
    }
    else ext = "webm";
    chrome.downloads.download({url:request.url,filename:"test."+ext}, function(){
    });

});
chrome.webNavigation.onHistoryStateUpdated.addListener(details=>{
    console.log("tab changed");
    chrome.tabs.sendMessage(details.tabId, 
          {action:"instrument",data:null},
          {frameId: 0 },
          function(result){});
}, {url: [{urlMatches: 'https://avocadoo.slack.com/messages/*'}]});
