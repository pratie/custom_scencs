Example:

input:
{
  "image_url": "https://v3.fal.media/files/penguin/RDPqsKTxU51aydBiKIc5x_J7B-NttdZil37NGzQDYIw.jpeg",
  "text_input": "talking about how good the product is",
  "voice": "Jessica",
  "prompt": "a teen women showing the product to camera",
  "num_frames": 145,
  "resolution": "480p",
  "seed": 42,
  "acceleration": "regular"
}


output:
{
  "video": {
    "url": "https://v3.fal.media/files/zebra/9lKo5rPNggwWkkYXLTfCL_44763838ac414a1e873295e2ceb4ca19.mp4",
    "content_type": "application/octet-stream",
    "file_name": "44763838ac414a1e873295e2ceb4ca19.mp4",
    "file_size": 242193
  },
  "seed": 42
}




api docs:

About
MultiTalk model generates a talking avatar video from an image and text. Converts text to speech automatically, then generates the avatar speaking with lip-sync.

1. Calling the API
#
Install the client
#
The client provides a convenient way to interact with the model API.

npmyarnpnpmbun

npm install --save @fal-ai/client
Migrate to @fal-ai/client
The @fal-ai/serverless-client package has been deprecated in favor of @fal-ai/client. Please check the migration guide for more information.

Setup your API Key
#
Set FAL_KEY as an environment variable in your runtime.


export FAL_KEY="YOUR_API_KEY"
Submit a request
#
The client API handles the API submit protocol. It will handle the request status updates and return the result when the request is completed.


import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/infinitalk/single-text", {
  input: {
    image_url: "https://v3.fal.media/files/panda/HuM21CXMf0q7OO2zbvwhV_c4533aada79a495b90e50e32dc9b83a8.png",
    text_input: "Spend more time with people who make you feel alive, and less with things that drain your soul.",
    voice: "Bill",
    prompt: "An elderly man with a white beard and headphones records audio with a microphone. He appears engaged and expressive, suggesting a podcast or voiceover."
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
2. Authentication
#
The API uses an API Key for authentication. It is recommended you set the FAL_KEY environment variable in your runtime when possible.

API Key
#
In case your app is running in an environment where you cannot set environment variables, you can set the API Key manually as a client configuration.

import { fal } from "@fal-ai/client";

fal.config({
  credentials: "YOUR_FAL_KEY"
});
Protect your API Key
When running code on the client-side (e.g. in a browser, mobile app or GUI applications), make sure to not expose your FAL_KEY. Instead, use a server-side proxy to make requests to the API. For more information, check out our server-side integration guide.

3. Queue
#
Long-running requests
For long-running requests, such as training jobs or models with slower inference times, it is recommended to check the Queue status and rely on Webhooks instead of blocking while waiting for the result.

Submit a request
#
The client API provides a convenient way to submit requests to the model.


import { fal } from "@fal-ai/client";

const { request_id } = await fal.queue.submit("fal-ai/infinitalk/single-text", {
  input: {
    image_url: "https://v3.fal.media/files/panda/HuM21CXMf0q7OO2zbvwhV_c4533aada79a495b90e50e32dc9b83a8.png",
    text_input: "Spend more time with people who make you feel alive, and less with things that drain your soul.",
    voice: "Bill",
    prompt: "An elderly man with a white beard and headphones records audio with a microphone. He appears engaged and expressive, suggesting a podcast or voiceover."
  },
  webhookUrl: "https://optional.webhook.url/for/results",
});
Fetch request status
#
You can fetch the status of a request to check if it is completed or still in progress.


import { fal } from "@fal-ai/client";

const status = await fal.queue.status("fal-ai/infinitalk/single-text", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
Get the result
#
Once the request is completed, you can fetch the result. See the Output Schema for the expected result format.


import { fal } from "@fal-ai/client";

const result = await fal.queue.result("fal-ai/infinitalk/single-text", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b"
});
console.log(result.data);
console.log(result.requestId);
4. Files
#
Some attributes in the API accept file URLs as input. Whenever that's the case you can pass your own URL or a Base64 data URI.

Data URI (base64)
#
You can pass a Base64 data URI as a file input. The API will handle the file decoding for you. Keep in mind that for large files, this alternative although convenient can impact the request performance.

Hosted files (URL)
#
You can also pass your own URLs as long as they are publicly accessible. Be aware that some hosts might block cross-site requests, rate-limit, or consider the request as a bot.

Uploading files
#
We provide a convenient file storage that allows you to upload files and use them in your requests. You can upload files using the client API and use the returned URL in your requests.


import { fal } from "@fal-ai/client";

const file = new File(["Hello, World!"], "hello.txt", { type: "text/plain" });
const url = await fal.storage.upload(file);
Auto uploads
The client will auto-upload the file for you if you pass a binary object (e.g. File, Data).

Read more about file handling in our file upload guide.

5. Schema
#
Input
#
image_url string
URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.

text_input string
The text input to guide video generation.

voice VoiceEnum
The voice to use for speech generation

Possible enum values: Aria, Roger, Sarah, Laura, Charlie, George, Callum, River, Liam, Charlotte, Alice, Matilda, Will, Jessica, Eric, Chris, Brian, Daniel, Lily, Bill

prompt string
The text prompt to guide video generation.

num_frames integer
Number of frames to generate. Must be between 41 to 721. Default value: 145

resolution ResolutionEnum
Resolution of the video to generate. Must be either 480p or 720p. Default value: "480p"

Possible enum values: 480p, 720p

seed integer
Random seed for reproducibility. If None, a random seed is chosen. Default value: 42

acceleration AccelerationEnum
The acceleration level to use for generation. Default value: "regular"

Possible enum values: none, regular, high


{
  "image_url": "https://v3.fal.media/files/panda/HuM21CXMf0q7OO2zbvwhV_c4533aada79a495b90e50e32dc9b83a8.png",
  "text_input": "Spend more time with people who make you feel alive, and less with things that drain your soul.",
  "voice": "Bill",
  "prompt": "An elderly man with a white beard and headphones records audio with a microphone. He appears engaged and expressive, suggesting a podcast or voiceover.",
  "num_frames": 145,
  "resolution": "480p",
  "seed": 42,
  "acceleration": "regular"
}
Output
#
video File
The generated video file.

seed integer
The seed used for generation.


{
  "video": {
    "file_size": 797478,
    "file_name": "6c9dd31e1d9a4482877747a52a661a0a.mp4",
    "content_type": "application/octet-stream",
    "url": "https://v3.fal.media/files/elephant/-huMN0zTaXmBr2CqzCMps_6c9dd31e1d9a4482877747a52a661a0a.mp4"
  }
}
Other types
#
InfiniTalkSingleAudioRequest
#
image_url string
URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.

audio_url string
The URL of the audio file.

prompt string
The text prompt to guide video generation.

num_frames integer
Number of frames to generate. Must be between 41 to 721. Default value: 145

resolution ResolutionEnum
Resolution of the video to generate. Must be either 480p or 720p. Default value: "480p"

Possible enum values: 480p, 720p

seed integer
Random seed for reproducibility. If None, a random seed is chosen. Default value: 42

acceleration AccelerationEnum
The acceleration level to use for generation. Default value: "regular"

Possible enum values: none, regular, high

AvatarSingleAudioResponse
#
video File
The generated video file.

seed integer
The seed used for generation.

File
#
url string
The URL where the file can be downloaded from.

content_type string
The mime type of the file.

file_name string
The name of the file. It will be auto-generated if not provided.

file_size integer
The size of the file in bytes.