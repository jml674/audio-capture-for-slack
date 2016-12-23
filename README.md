# audio-capture
Demo of HTML5 audio capture in the context of slack.The code goes up to creating 3 buttons inside the slack message flow window.
- a microphone button allows to start and stop the recording
- a play button let's the user hear the audio capture
- a download button loads the browser with the generated audio file. Additionnaly, the background script gets full information required to integrate the file into the slack message flow ie username, channel name and recorded data.


***Important note:***
This demo integrates audio capture feature inside a slack window BUT does not go all the way:
- inclusion of the audio file is not provided (a slack API call would be recommended)

The result has been privileged over programming style given the target is not a product.

**Next steps**
- it would be fairly easy to extend the code to cover for BOTH video and audio capture

