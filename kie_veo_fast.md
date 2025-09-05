# Generate Veo 3 AI Video(Fast&Quality)

> Create a new video generation task using the Veo3 AI model.

## OpenAPI

````yaml veo3-api/veo3-api.json post /api/v1/veo/generate
paths:
  path: /api/v1/veo/generate
  method: post
  servers:
    - url: https://api.kie.ai
      description: API Server
  request:
    security:
      - title: BearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                All APIs require authentication via Bearer Token.


                Get API Key: 

                1. Visit [API Key Management Page](https://kie.ai/api-key) to
                get your API Key


                Usage:

                Add to request header:

                Authorization: Bearer YOUR_API_KEY
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              prompt:
                allOf:
                  - type: string
                    description: >-
                      Text prompt describing the desired video content. Required
                      for all generation modes.


                      - Should be detailed and specific in describing video
                      content

                      - Can include actions, scenes, style and other information

                      - For image-to-video, describe how you want the image to
                      come alive
                    example: A dog playing in a park
              imageUrls:
                allOf:
                  - type: array
                    items:
                      type: string
                    description: >-
                      Image URL list (used in image-to-video mode, only 1 image
                      supported for now).


                      - Must be valid image URLs

                      - Images must be accessible to the API server
                    example:
                      - http://example.com/image1.jpg
              model:
                allOf:
                  - type: string
                    description: >-
                      Select the model type to use.


                      - veo3: Veo 3 Quality, supports both text-to-video and
                      image-to-video generation

                      - veo3_fast: Fast generation model, supports both
                      text-to-video and image-to-video generation
                    enum:
                      - veo3
                      - veo3_fast
                    default: veo3
                    example: veo3
              watermark:
                allOf:
                  - type: string
                    description: >-
                      Watermark text.


                      - Optional parameter

                      - If provided, a watermark will be added to the generated
                      video
                    example: MyBrand
              aspectRatio:
                allOf:
                  - type: string
                    description: >-
                      Video aspect ratio. Specifies the dimension ratio of the
                      generated video. Available options:


                      - 16:9: Landscape video format, supports 1080P HD video
                      generation (**Only 16:9 aspect ratio supports 1080P**)

                      - 9:16: Portrait video format, suitable for mobile short
                      videos


                      Default value is 16:9.
                    enum:
                      - '16:9'
                      - '9:16'
                    default: '16:9'
                    example: '16:9'
              seeds:
                allOf:
                  - type: integer
                    description: >-
                      (Optional) Random seed parameter to control the randomness
                      of the generated content. Value range: 10000-99999. The
                      same seed will generate similar video content, different
                      seeds will generate different content. If not provided,
                      the system will assign one automatically.
                    minimum: 10000
                    maximum: 99999
                    example: 12345
              callBackUrl:
                allOf:
                  - type: string
                    description: >-
                      Completion callback URL for receiving video generation
                      status updates.


                      - Optional but recommended for production use

                      - System will POST task completion status to this URL when
                      the video generation is completed

                      - Callback will include task results, video URLs, and
                      status information

                      - Your callback endpoint should accept POST requests with
                      JSON payload

                      - For detailed callback format and implementation guide,
                      see [Callback
                      Documentation](./generate-veo-3-video-callbacks)

                      - Alternatively, use the Get Video Details endpoint to
                      poll task status
                    example: http://your-callback-url.com/complete
              enableFallback:
                allOf:
                  - type: boolean
                    description: >-
                      Enable fallback functionality. When set to true, if the
                      official Veo3 video generation service is unavailable or
                      encounters exceptions, the system will automatically
                      switch to a backup model for video generation to ensure
                      task continuity and reliability. Default value is false.


                      - When fallback is enabled, backup model will be used for
                      the following errors:
                        - public error minor upload
                        - Your prompt was flagged by Website as violating content policies
                        - public error prominent people upload
                      - Fallback mode requires 16:9 aspect ratio and uses 1080p
                      resolution by default

                      - **Note**: Videos generated through fallback mode cannot
                      be accessed via the Get 1080P Video endpoint

                      - **Credit Consumption**: Successful fallback has
                      different credit consumption, please see
                      https://kie.ai/billing for billing details
                    default: false
                    example: false
            required: true
            requiredProperties:
              - prompt
            example:
              prompt: A dog playing in a park
              imageUrls:
                - http://example.com/image1.jpg
              model: veo3
              watermark: MyBrand
              callBackUrl: http://your-callback-url.com/complete
              aspectRatio: '16:9'
              seeds: 12345
              enableFallback: false
        examples:
          example:
            value:
              prompt: A dog playing in a park
              imageUrls:
                - http://example.com/image1.jpg
              model: veo3
              watermark: MyBrand
              callBackUrl: http://your-callback-url.com/complete
              aspectRatio: '16:9'
              seeds: 12345
              enableFallback: false
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              code:
                allOf:
                  - type: integer
                    enum:
                      - 200
                      - 400
                      - 401
                      - 402
                      - 404
                      - 422
                      - 429
                      - 455
                      - 500
                      - 501
                      - 505
                    description: >-
                      Response status code


                      - **200**: Success - Request has been processed
                      successfully

                      - **400**: 1080P is processing. It should be ready in 1-2
                      minutes. Please check back shortly.

                      - **401**: Unauthorized - Authentication credentials are
                      missing or invalid

                      - **402**: Insufficient Credits - Account does not have
                      enough credits to perform the operation

                      - **404**: Not Found - The requested resource or endpoint
                      does not exist

                      - **422**: Validation Error - Request parameters failed
                      validation. When fallback is not enabled and generation
                      fails, error message format: Your request was rejected by
                      Flow(original error message). You may consider using our
                      other fallback channels, which are likely to succeed.
                      Please refer to the documentation.

                      - **429**: Rate Limited - Request limit has been exceeded
                      for this resource

                      - **455**: Service Unavailable - System is currently
                      undergoing maintenance

                      - **500**: Server Error - An unexpected error occurred
                      while processing the request

                      - **501**: Generation Failed - Video generation task
                      failed

                      - **505**: Feature Disabled - The requested feature is
                      currently disabled
              msg:
                allOf:
                  - type: string
                    description: Error message when code != 200
                    example: success
              data:
                allOf:
                  - type: object
                    properties:
                      taskId:
                        type: string
                        description: >-
                          Task ID, can be used with Get Video Details endpoint
                          to query task status
                        example: veo_task_abcdef123456
        examples:
          example:
            value:
              code: 200
              msg: success
              data:
                taskId: veo_task_abcdef123456
        description: Request successful
    '500':
      _mintlify/placeholder:
        schemaArray:
          - type: any
            description: Server Error
        examples: {}
        description: Server Error
  deprecated: false
  type: path
components:
  schemas: {}

````


# Veo3 Video Generation Callbacks

> The system will call this callback to notify results when video generation is completed

When you submit a video generation task to the Veo3 API, you can set a callback address through the `callBackUrl` parameter. After the task is completed, the system will automatically push the results to your specified address.

## Callback Mechanism Overview

<Info>
  The callback mechanism avoids the need for you to poll the API for task status, as the system will actively push task completion results to your server.
</Info>

### Callback Timing

The system will send callback notifications in the following situations:

* Video generation task completed successfully
* Video generation task failed
* Error occurred during task processing

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout Setting**: 15 seconds

## Callback Request Format

After the task is completed, the system will send a POST request to your `callBackUrl` in the following format:

<CodeGroup>
  ```json Success Callback
  {
    "code": 200,
    "msg": "Veo3 video generated successfully.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "info": {
        "resultUrls": ["http://example.com/video1.mp4"],
        "originUrls": ["http://example.com/original_video1.mp4"],
        "resolution": "1080p"
      },
      "fallbackFlag": false
    }
  }
  ```

  ```json Failure Callback
  {
    "code": 400,
    "msg": "Your prompt was flagged by Website as violating content policies.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "fallbackFlag": false
    }
  }
  ```

  ```json Fallback Failed Callback
  {
    "code": 422,
    "msg": "Your request was rejected by Flow(Your prompt was flagged by Website as violating content policies). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "fallbackFlag": false
    }
  }
  ```

  ```json Fallback Success Callback
  {
    "code": 200,
    "msg": "Veo3 video generated successfully (using fallback model).",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "info": {
        "resultUrls": ["http://example.com/video1.mp4"],
        "resolution": "1080p"
      },
      "fallbackFlag": true
    }
  }
  ```
</CodeGroup>

## Status Code Description

<ParamField path="code" type="integer" required>
  Callback status code indicating task processing result:

  | Status Code | Description                                                                                                                                                                                                                                                                            |
  | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 200         | Success - Video generation task successfully                                                                                                                                                                                                                                           |
  | 400         | Client error - Prompt violates content policies or other input errors                                                                                                                                                                                                                  |
  | 422         | Fallback failed - When fallback is not enabled and specific errors occur, returns error message format: Your request was rejected by Flow(original error message). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation. |
  | 500         | Internal error - Please try again later, internal error or timeout                                                                                                                                                                                                                     |
  | 501         | Failed - Video generation task failed                                                                                                                                                                                                                                                  |
</ParamField>

<ParamField path="msg" type="string" required>
  Status message providing detailed status description. Different status codes correspond to different error messages:

  **400 Status Code Error Messages:**

  * Your prompt was flagged by Website as violating content policies
  * Only English prompts are supported at this time
  * Failed to fetch the image. Kindly verify any access limits set by you or your service provider
  * Public error: unsafe image upload

  **422 Status Code Error Messages:**

  * Your request was rejected by Flow(original error message). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation.

  **Fallback Mechanism Description:**
  When `enableFallback` is enabled and the following errors occur, the system will attempt to use the backup model:

  * public error minor upload
  * Your prompt was flagged by Website as violating content policies
  * public error prominent people upload
</ParamField>

<ParamField path="data.taskId" type="string" required>
  Task ID, consistent with the taskId returned when you submitted the task
</ParamField>

<ParamField path="data.info.resultUrls" type="array">
  Generated video URL array (returned only on success)
</ParamField>

<ParamField path="data.info.originUrls" type="array">
  Original video URL array (returned only on success), only has value when aspectRatio is not 16:9
</ParamField>

<ParamField path="data.info.resolution" type="string">
  Video resolution information (returned only on success), indicates the resolution of the generated video
</ParamField>

<ParamField path="data.fallbackFlag" type="boolean">
  Whether generated using fallback model. True means backup model was used, false means primary model was used
</ParamField>

## Fallback Functionality Description

<Info>
  The fallback functionality is an intelligent backup generation mechanism. When the primary model encounters specific errors, it automatically switches to a backup model to continue generation, improving task success rates.
</Info>

### Enabling Conditions

The fallback functionality requires the following conditions to be met simultaneously:

1. `enableFallback` parameter is set to `true` in the request
2. Aspect ratio is `16:9`
3. One of the following specific errors occurs:
   * public error minor upload
   * Your prompt was flagged by Website as violating content policies
   * public error prominent people upload

### Fallback Limitations

* **Resolution**: Fallback-generated videos are created in 1080p resolution by default and cannot be accessed via the Get 1080P Video endpoint
* **Image Requirements**: If using image-to-video generation, images must be in 16:9 ratio, otherwise automatic cropping will occur
* **Credit Calculation**: Successful fallback has different credit consumption, please see [https://kie.ai/billing](https://kie.ai/billing) for billing details

### Error Handling

* **Fallback Enabled**: Automatically switch to backup model when specific errors occur, task continues execution
* **Fallback Not Enabled**: Returns 422 status code when specific errors occur, suggesting to enable fallback functionality

<Warning>
  The fallback functionality only takes effect in specific error scenarios. For other types of errors (such as insufficient credits, network issues, etc.), the fallback functionality will not be activated.
</Warning>

## Callback Reception Examples

Here are example codes for receiving callbacks in popular programming languages:

<Tabs>
  <Tab title="Node.js">
    ```javascript
    const express = require('express');
    const fs = require('fs');
    const https = require('https');
    const app = express();

    app.use(express.json());

    app.post('/veo3-callback', (req, res) => {
      const { code, msg, data } = req.body;
      
      console.log('Received Veo3 video generation callback:', {
        taskId: data.taskId,
        status: code,
        message: msg
      });
      
      if (code === 200) {
        // Video generation successful
        const { taskId, info, fallbackFlag } = data;
        const { resultUrls, originUrls, resolution } = info;
        
        console.log('Video generation successful!');
        console.log(`Task ID: ${taskId}`);
        console.log(`Generated video URLs: ${resultUrls}`);
        console.log(`Video resolution: ${resolution}`);
        console.log(`Using fallback model: ${fallbackFlag ? 'Yes' : 'No'}`);
        if (originUrls) {
          console.log(`Original video URLs: ${originUrls}`);
        }
        
        // Download generated video files
        resultUrls.forEach((url, index) => {
          if (url) {
            downloadFile(url, `veo3_generated_${taskId}_${index}.mp4`)
              .then(() => console.log(`Video ${index + 1} downloaded successfully`))
              .catch(err => console.error(`Video ${index + 1} download failed:`, err));
          }
        });
        
        // Download original video files (if exists)
        if (originUrls) {
          originUrls.forEach((url, index) => {
            if (url) {
              downloadFile(url, `veo3_original_${taskId}_${index}.mp4`)
                .then(() => console.log(`Original video ${index + 1} downloaded successfully`))
                .catch(err => console.error(`Original video ${index + 1} download failed:`, err));
            }
          });
        }
        
      } else {
        // Video generation failed
        console.log('Veo3 video generation failed:', msg);
        
        // Handle specific error types
        if (code === 400) {
          console.log('Client error - Check prompts and content policies');
        } else if (code === 422) {
          console.log('Fallback failed - Consider enabling fallback functionality (enableFallback: true)');
        } else if (code === 500) {
          console.log('Server internal error - Please try again later');
        } else if (code === 501) {
          console.log('Task failed - Video generation failed');
        }
      }
      
      // Return 200 status code to confirm callback received
      res.status(200).json({ code: 200, msg: 'success' });
    });

    // Helper function: Download file
    function downloadFile(url, filename) {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        }).on('error', reject);
      });
    }

    app.listen(3000, () => {
      console.log('Callback server running on port 3000');
    });
    ```
  </Tab>

  <Tab title="Python">
    ```python
    from flask import Flask, request, jsonify
    import requests
    import json
    import os

    app = Flask(__name__)

    @app.route('/veo3-callback', methods=['POST'])
    def handle_callback():
        data = request.json
        
        code = data.get('code')
        msg = data.get('msg')
        callback_data = data.get('data', {})
        task_id = callback_data.get('taskId')
        
        print(f"Received Veo3 video generation callback:")
        print(f"Task ID: {task_id}")
        print(f"Status: {code}, Message: {msg}")
        
        if code == 200:
        # Video generation successful
        info = callback_data.get('info', {})
        result_urls = info.get('resultUrls')
        origin_urls = info.get('originUrls')
        resolution = info.get('resolution')
        fallback_flag = callback_data.get('fallbackFlag', False)
        
        print("Video generation successful!")
        print(f"Generated video URLs: {result_urls}")
        print(f"Video resolution: {resolution}")
        print(f"Using fallback model: {'Yes' if fallback_flag else 'No'}")
        if origin_urls:
            print(f"Original video URLs: {origin_urls}")
        
        # Download generated video files
        if result_urls:
            for i, url in enumerate(result_urls):
                if url:
                    try:
                        video_filename = f"veo3_generated_{task_id}_{i}.mp4"
                        download_file(url, video_filename)
                        print(f"Video {i + 1} downloaded successfully")
                    except Exception as e:
                        print(f"Video {i + 1} download failed: {e}")
        
        # Download original video files (if exists)
        if origin_urls:
            for i, url in enumerate(origin_urls):
                if url:
                    try:
                        original_filename = f"veo3_original_{task_id}_{i}.mp4"
                        download_file(url, original_filename)
                        print(f"Original video {i + 1} downloaded successfully")
                    except Exception as e:
                        print(f"Original video {i + 1} download failed: {e}")

    else:
        # Video generation failed
        print(f"Veo3 video generation failed: {msg}")
        
        # Handle specific error types
        if code == 400:
            print("Client error - Check prompts and content policies")
            if 'content policies' in msg:
                print("Content review failed - Please modify prompts")
            elif 'English prompts' in msg:
                print("Language error - Only English prompts are supported")
            elif 'unsafe image' in msg:
                print("Image safety check failed - Please change image")
        elif code == 422:
            print("Fallback failed - Consider enabling fallback functionality (enableFallback: true)")
        elif code == 500:
            print("Server internal error - Please try again later")
        elif code == 501:
            print("Task failed - Video generation failed")
        
        # Return 200 status code to confirm callback received
        return jsonify({'code': 200, 'msg': 'success'}), 200

    def download_file(url, filename):
        """Download file from URL and save to local"""
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        os.makedirs('downloads', exist_ok=True)
        filepath = os.path.join('downloads', filename)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=3000)
    ```
  </Tab>

  <Tab title="PHP">
    ```php
    <?php
    header('Content-Type: application/json');

    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $code = $data['code'] ?? null;
    $msg = $data['msg'] ?? '';
    $callbackData = $data['data'] ?? [];
    $taskId = $callbackData['taskId'] ?? '';

    error_log("Received Veo3 video generation callback:");
    error_log("Task ID: $taskId");
    error_log("Status: $code, Message: $msg");

    if ($code === 200) {
        // Video generation successful
        $info = $callbackData['info'] ?? [];
        $resultUrls = $info['resultUrls'] ?? '';
        $originUrls = $info['originUrls'] ?? '';
        $resolution = $info['resolution'] ?? '';
        $fallbackFlag = $callbackData['fallbackFlag'] ?? false;
        
        error_log("Video generation successful!");
        error_log("Generated video URLs: $resultUrls");
        error_log("Video resolution: $resolution");
        error_log("Using fallback model: " . ($fallbackFlag ? 'Yes' : 'No'));
        if (!empty($originUrls)) {
            error_log("Original video URLs: $originUrls");
        }
        
        // Download generated video files
        if (!empty($resultUrls) && is_array($resultUrls)) {
            foreach ($resultUrls as $index => $url) {
                if (!empty($url)) {
                    try {
                        $videoFilename = "veo3_generated_{$taskId}_{$index}.mp4";
                        downloadFile($url, $videoFilename);
                        error_log("Video " . ($index + 1) . " downloaded successfully");
                    } catch (Exception $e) {
                        error_log("Video " . ($index + 1) . " download failed: " . $e->getMessage());
                    }
                }
            }
        }
        
        // Download original video files (if exists)
        if (!empty($originUrls) && is_array($originUrls)) {
            foreach ($originUrls as $index => $url) {
                if (!empty($url)) {
                    try {
                        $originalFilename = "veo3_original_{$taskId}_{$index}.mp4";
                        downloadFile($url, $originalFilename);
                        error_log("Original video " . ($index + 1) . " downloaded successfully");
                    } catch (Exception $e) {
                        error_log("Original video " . ($index + 1) . " download failed: " . $e->getMessage());
                    }
                }
            }
        }
        
    } else {
        // Video generation failed
        error_log("Veo3 video generation failed: $msg");
        
        // Handle specific error types
        if ($code === 400) {
            error_log("Client error - Check prompts and content policies");
            if (strpos($msg, 'content policies') !== false) {
                error_log("Content review failed - Please modify prompts");
            } elseif (strpos($msg, 'English prompts') !== false) {
                error_log("Language error - Only English prompts are supported");
            } elseif (strpos($msg, 'unsafe image') !== false) {
                error_log("Image safety check failed - Please change image");
            }
        } elseif ($code === 422) {
            error_log("Fallback failed - Consider enabling fallback functionality (enableFallback: true)");
        } elseif ($code === 500) {
            error_log("Server internal error - Please try again later");
        } elseif ($code === 501) {
            error_log("Task failed - Video generation failed");
        }
    }

    // Return 200 status code to confirm callback received
    http_response_code(200);
    echo json_encode(['code' => 200, 'msg' => 'success']);

    function downloadFile($url, $filename) {
        $downloadDir = 'downloads';
        if (!is_dir($downloadDir)) {
            mkdir($downloadDir, 0755, true);
        }
        
        $filepath = $downloadDir . '/' . $filename;
        
        $fileContent = file_get_contents($url);
        if ($fileContent === false) {
            throw new Exception("Failed to download file from URL");
        }
        
        $result = file_put_contents($filepath, $fileContent);
        if ($result === false) {
            throw new Exception("Failed to save file locally");
        }
    }
    ?>
    ```
  </Tab>
</Tabs>

## Best Practices

<Tip>
  ### Callback URL Configuration Recommendations

  1. **Use HTTPS**: Ensure callback URL uses HTTPS protocol to guarantee data transmission security
  2. **Verify Source**: Verify the legitimacy of request sources in callback processing
  3. **Idempotent Processing**: The same taskId may receive multiple callbacks, ensure processing logic is idempotent
  4. **Quick Response**: Callback processing should return 200 status code as soon as possible to avoid timeout
  5. **Asynchronous Processing**: Complex business logic should be processed asynchronously to avoid blocking callback response
  6. **Timely Download**: Video URLs have certain validity period, please download and save promptly
  7. **Array Handling**: resultUrls and originUrls are direct array formats that can be iterated directly
  8. **English Prompts**: Ensure using English prompts to avoid language-related errors
</Tip>

<Warning>
  ### Important Reminders

  * Callback URL must be publicly accessible
  * Server must respond within 15 seconds, otherwise it will be considered timeout
  * After 3 consecutive retry failures, the system will stop sending callbacks
  * **Only English prompts are supported**, please ensure prompts use English
  * Please ensure the stability of callback processing logic to avoid callback failures due to exceptions
  * Properly handle content review errors to ensure input content complies with platform policies
  * resultUrls and originUrls return direct array formats that can be iterated directly
  * originUrls only has value when aspectRatio is not 16:9
  * Pay attention to image upload security checks to avoid uploading unsafe images
</Warning>

## Troubleshooting

If you don't receive callback notifications, please check the following:

<AccordionGroup>
  <Accordion title="Network Connection Issues">
    * Confirm callback URL is accessible from public network
    * Check firewall settings to ensure inbound requests are not blocked
    * Verify domain name resolution is correct
  </Accordion>

  <Accordion title="Server Response Issues">
    * Ensure server returns HTTP 200 status code within 15 seconds
    * Check error information in server logs
    * Verify interface path and HTTP method are correct
  </Accordion>

  <Accordion title="Content Format Issues">
    * Confirm received POST request body is JSON format
    * Check if Content-Type is application/json
    * Verify JSON parsing is correct
    * Correctly handle resultUrls and originUrls array formats
  </Accordion>

  <Accordion title="Video Processing Issues">
    * Confirm video URLs are accessible
    * Check video download permissions and network connection
    * Verify video save path and permissions
    * Pay attention to video URL validity period limitations
    * Backup videos to long-term storage system promptly
  </Accordion>

  <Accordion title="Content Review Issues">
    * Review content review error messages
    * Ensure prompts use English
    * Ensure input images don't contain inappropriate content
    * Check if prompts comply with platform content policies
    * Avoid using sensitive or violating descriptive words
    * Ensure image uploads are safe and in correct format
  </Accordion>

  <Accordion title="Generation Quality Issues">
    * Check generated video quality and resolution
    * Verify video duration meets expectations
    * Evaluate generated video quality and style
    * Ensure video content meets expectations
    * If originUrls exist, compare differences between original and generated videos
  </Accordion>
</AccordionGroup>

## Veo3 Specific Notes

<Note>
  ### Veo3 Video Generation Features

  Veo3 AI video generation functionality has the following characteristics:

  1. **High-Quality Generation**: Veo3 provides high-quality AI video generation capabilities
  2. **Multiple Aspect Ratio Support**: Supports various aspect ratios, provides original video when not 16:9
  3. **English Prompts**: Only supports English prompts, please ensure input is in English
  4. **Content Safety**: Strict content review mechanism to ensure generated content is safe and compliant
  5. **Flexible Output**: resultUrls may contain multiple video files
  6. **Original Preservation**: When aspect ratio is not 16:9, original size video will be preserved
</Note>

## Alternative Solutions

If you cannot use the callback mechanism, you can also use polling:

<Card title="Poll Query Results" icon="radar" href="/veo3-api/get-veo-3-video-details">
  Use the Get Veo3 Video Details interface to periodically query task status, recommend querying every 30 seconds.
</Card>


# Veo3 Video Generation Callbacks

> The system will call this callback to notify results when video generation is completed

When you submit a video generation task to the Veo3 API, you can set a callback address through the `callBackUrl` parameter. After the task is completed, the system will automatically push the results to your specified address.

## Callback Mechanism Overview

<Info>
  The callback mechanism avoids the need for you to poll the API for task status, as the system will actively push task completion results to your server.
</Info>

### Callback Timing

The system will send callback notifications in the following situations:

* Video generation task completed successfully
* Video generation task failed
* Error occurred during task processing

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout Setting**: 15 seconds

## Callback Request Format

After the task is completed, the system will send a POST request to your `callBackUrl` in the following format:

<CodeGroup>
  ```json Success Callback
  {
    "code": 200,
    "msg": "Veo3 video generated successfully.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "info": {
        "resultUrls": ["http://example.com/video1.mp4"],
        "originUrls": ["http://example.com/original_video1.mp4"],
        "resolution": "1080p"
      },
      "fallbackFlag": false
    }
  }
  ```

  ```json Failure Callback
  {
    "code": 400,
    "msg": "Your prompt was flagged by Website as violating content policies.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "fallbackFlag": false
    }
  }
  ```

  ```json Fallback Failed Callback
  {
    "code": 422,
    "msg": "Your request was rejected by Flow(Your prompt was flagged by Website as violating content policies). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "fallbackFlag": false
    }
  }
  ```

  ```json Fallback Success Callback
  {
    "code": 200,
    "msg": "Veo3 video generated successfully (using fallback model).",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "info": {
        "resultUrls": ["http://example.com/video1.mp4"],
        "resolution": "1080p"
      },
      "fallbackFlag": true
    }
  }
  ```
</CodeGroup>

## Status Code Description

<ParamField path="code" type="integer" required>
  Callback status code indicating task processing result:

  | Status Code | Description                                                                                                                                                                                                                                                                            |
  | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 200         | Success - Video generation task successfully                                                                                                                                                                                                                                           |
  | 400         | Client error - Prompt violates content policies or other input errors                                                                                                                                                                                                                  |
  | 422         | Fallback failed - When fallback is not enabled and specific errors occur, returns error message format: Your request was rejected by Flow(original error message). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation. |
  | 500         | Internal error - Please try again later, internal error or timeout                                                                                                                                                                                                                     |
  | 501         | Failed - Video generation task failed                                                                                                                                                                                                                                                  |
</ParamField>

<ParamField path="msg" type="string" required>
  Status message providing detailed status description. Different status codes correspond to different error messages:

  **400 Status Code Error Messages:**

  * Your prompt was flagged by Website as violating content policies
  * Only English prompts are supported at this time
  * Failed to fetch the image. Kindly verify any access limits set by you or your service provider
  * Public error: unsafe image upload

  **422 Status Code Error Messages:**

  * Your request was rejected by Flow(original error message). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation.

  **Fallback Mechanism Description:**
  When `enableFallback` is enabled and the following errors occur, the system will attempt to use the backup model:

  * public error minor upload
  * Your prompt was flagged by Website as violating content policies
  * public error prominent people upload
</ParamField>

<ParamField path="data.taskId" type="string" required>
  Task ID, consistent with the taskId returned when you submitted the task
</ParamField>

<ParamField path="data.info.resultUrls" type="array">
  Generated video URL array (returned only on success)
</ParamField>

<ParamField path="data.info.originUrls" type="array">
  Original video URL array (returned only on success), only has value when aspectRatio is not 16:9
</ParamField>

<ParamField path="data.info.resolution" type="string">
  Video resolution information (returned only on success), indicates the resolution of the generated video
</ParamField>

<ParamField path="data.fallbackFlag" type="boolean">
  Whether generated using fallback model. True means backup model was used, false means primary model was used
</ParamField>

## Fallback Functionality Description

<Info>
  The fallback functionality is an intelligent backup generation mechanism. When the primary model encounters specific errors, it automatically switches to a backup model to continue generation, improving task success rates.
</Info>

### Enabling Conditions

The fallback functionality requires the following conditions to be met simultaneously:

1. `enableFallback` parameter is set to `true` in the request
2. Aspect ratio is `16:9`
3. One of the following specific errors occurs:
   * public error minor upload
   * Your prompt was flagged by Website as violating content policies
   * public error prominent people upload

### Fallback Limitations

* **Resolution**: Fallback-generated videos are created in 1080p resolution by default and cannot be accessed via the Get 1080P Video endpoint
* **Image Requirements**: If using image-to-video generation, images must be in 16:9 ratio, otherwise automatic cropping will occur
* **Credit Calculation**: Successful fallback has different credit consumption, please see [https://kie.ai/billing](https://kie.ai/billing) for billing details

### Error Handling

* **Fallback Enabled**: Automatically switch to backup model when specific errors occur, task continues execution
* **Fallback Not Enabled**: Returns 422 status code when specific errors occur, suggesting to enable fallback functionality

<Warning>
  The fallback functionality only takes effect in specific error scenarios. For other types of errors (such as insufficient credits, network issues, etc.), the fallback functionality will not be activated.
</Warning>

## Callback Reception Examples

Here are example codes for receiving callbacks in popular programming languages:

<Tabs>
  <Tab title="Node.js">
    ```javascript
    const express = require('express');
    const fs = require('fs');
    const https = require('https');
    const app = express();

    app.use(express.json());

    app.post('/veo3-callback', (req, res) => {
      const { code, msg, data } = req.body;
      
      console.log('Received Veo3 video generation callback:', {
        taskId: data.taskId,
        status: code,
        message: msg
      });
      
      if (code === 200) {
        // Video generation successful
        const { taskId, info, fallbackFlag } = data;
        const { resultUrls, originUrls, resolution } = info;
        
        console.log('Video generation successful!');
        console.log(`Task ID: ${taskId}`);
        console.log(`Generated video URLs: ${resultUrls}`);
        console.log(`Video resolution: ${resolution}`);
        console.log(`Using fallback model: ${fallbackFlag ? 'Yes' : 'No'}`);
        if (originUrls) {
          console.log(`Original video URLs: ${originUrls}`);
        }
        
        // Download generated video files
        resultUrls.forEach((url, index) => {
          if (url) {
            downloadFile(url, `veo3_generated_${taskId}_${index}.mp4`)
              .then(() => console.log(`Video ${index + 1} downloaded successfully`))
              .catch(err => console.error(`Video ${index + 1} download failed:`, err));
          }
        });
        
        // Download original video files (if exists)
        if (originUrls) {
          originUrls.forEach((url, index) => {
            if (url) {
              downloadFile(url, `veo3_original_${taskId}_${index}.mp4`)
                .then(() => console.log(`Original video ${index + 1} downloaded successfully`))
                .catch(err => console.error(`Original video ${index + 1} download failed:`, err));
            }
          });
        }
        
      } else {
        // Video generation failed
        console.log('Veo3 video generation failed:', msg);
        
        // Handle specific error types
        if (code === 400) {
          console.log('Client error - Check prompts and content policies');
        } else if (code === 422) {
          console.log('Fallback failed - Consider enabling fallback functionality (enableFallback: true)');
        } else if (code === 500) {
          console.log('Server internal error - Please try again later');
        } else if (code === 501) {
          console.log('Task failed - Video generation failed');
        }
      }
      
      // Return 200 status code to confirm callback received
      res.status(200).json({ code: 200, msg: 'success' });
    });

    // Helper function: Download file
    function downloadFile(url, filename) {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        }).on('error', reject);
      });
    }

    app.listen(3000, () => {
      console.log('Callback server running on port 3000');
    });
    ```
  </Tab>

  <Tab title="Python">
    ```python
    from flask import Flask, request, jsonify
    import requests
    import json
    import os

    app = Flask(__name__)

    @app.route('/veo3-callback', methods=['POST'])
    def handle_callback():
        data = request.json
        
        code = data.get('code')
        msg = data.get('msg')
        callback_data = data.get('data', {})
        task_id = callback_data.get('taskId')
        
        print(f"Received Veo3 video generation callback:")
        print(f"Task ID: {task_id}")
        print(f"Status: {code}, Message: {msg}")
        
        if code == 200:
        # Video generation successful
        info = callback_data.get('info', {})
        result_urls = info.get('resultUrls')
        origin_urls = info.get('originUrls')
        resolution = info.get('resolution')
        fallback_flag = callback_data.get('fallbackFlag', False)
        
        print("Video generation successful!")
        print(f"Generated video URLs: {result_urls}")
        print(f"Video resolution: {resolution}")
        print(f"Using fallback model: {'Yes' if fallback_flag else 'No'}")
        if origin_urls:
            print(f"Original video URLs: {origin_urls}")
        
        # Download generated video files
        if result_urls:
            for i, url in enumerate(result_urls):
                if url:
                    try:
                        video_filename = f"veo3_generated_{task_id}_{i}.mp4"
                        download_file(url, video_filename)
                        print(f"Video {i + 1} downloaded successfully")
                    except Exception as e:
                        print(f"Video {i + 1} download failed: {e}")
        
        # Download original video files (if exists)
        if origin_urls:
            for i, url in enumerate(origin_urls):
                if url:
                    try:
                        original_filename = f"veo3_original_{task_id}_{i}.mp4"
                        download_file(url, original_filename)
                        print(f"Original video {i + 1} downloaded successfully")
                    except Exception as e:
                        print(f"Original video {i + 1} download failed: {e}")

    else:
        # Video generation failed
        print(f"Veo3 video generation failed: {msg}")
        
        # Handle specific error types
        if code == 400:
            print("Client error - Check prompts and content policies")
            if 'content policies' in msg:
                print("Content review failed - Please modify prompts")
            elif 'English prompts' in msg:
                print("Language error - Only English prompts are supported")
            elif 'unsafe image' in msg:
                print("Image safety check failed - Please change image")
        elif code == 422:
            print("Fallback failed - Consider enabling fallback functionality (enableFallback: true)")
        elif code == 500:
            print("Server internal error - Please try again later")
        elif code == 501:
            print("Task failed - Video generation failed")
        
        # Return 200 status code to confirm callback received
        return jsonify({'code': 200, 'msg': 'success'}), 200

    def download_file(url, filename):
        """Download file from URL and save to local"""
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        os.makedirs('downloads', exist_ok=True)
        filepath = os.path.join('downloads', filename)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=3000)
    ```
  </Tab>

  <Tab title="PHP">
    ```php
    <?php
    header('Content-Type: application/json');

    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $code = $data['code'] ?? null;
    $msg = $data['msg'] ?? '';
    $callbackData = $data['data'] ?? [];
    $taskId = $callbackData['taskId'] ?? '';

    error_log("Received Veo3 video generation callback:");
    error_log("Task ID: $taskId");
    error_log("Status: $code, Message: $msg");

    if ($code === 200) {
        // Video generation successful
        $info = $callbackData['info'] ?? [];
        $resultUrls = $info['resultUrls'] ?? '';
        $originUrls = $info['originUrls'] ?? '';
        $resolution = $info['resolution'] ?? '';
        $fallbackFlag = $callbackData['fallbackFlag'] ?? false;
        
        error_log("Video generation successful!");
        error_log("Generated video URLs: $resultUrls");
        error_log("Video resolution: $resolution");
        error_log("Using fallback model: " . ($fallbackFlag ? 'Yes' : 'No'));
        if (!empty($originUrls)) {
            error_log("Original video URLs: $originUrls");
        }
        
        // Download generated video files
        if (!empty($resultUrls) && is_array($resultUrls)) {
            foreach ($resultUrls as $index => $url) {
                if (!empty($url)) {
                    try {
                        $videoFilename = "veo3_generated_{$taskId}_{$index}.mp4";
                        downloadFile($url, $videoFilename);
                        error_log("Video " . ($index + 1) . " downloaded successfully");
                    } catch (Exception $e) {
                        error_log("Video " . ($index + 1) . " download failed: " . $e->getMessage());
                    }
                }
            }
        }
        
        // Download original video files (if exists)
        if (!empty($originUrls) && is_array($originUrls)) {
            foreach ($originUrls as $index => $url) {
                if (!empty($url)) {
                    try {
                        $originalFilename = "veo3_original_{$taskId}_{$index}.mp4";
                        downloadFile($url, $originalFilename);
                        error_log("Original video " . ($index + 1) . " downloaded successfully");
                    } catch (Exception $e) {
                        error_log("Original video " . ($index + 1) . " download failed: " . $e->getMessage());
                    }
                }
            }
        }
        
    } else {
        // Video generation failed
        error_log("Veo3 video generation failed: $msg");
        
        // Handle specific error types
        if ($code === 400) {
            error_log("Client error - Check prompts and content policies");
            if (strpos($msg, 'content policies') !== false) {
                error_log("Content review failed - Please modify prompts");
            } elseif (strpos($msg, 'English prompts') !== false) {
                error_log("Language error - Only English prompts are supported");
            } elseif (strpos($msg, 'unsafe image') !== false) {
                error_log("Image safety check failed - Please change image");
            }
        } elseif ($code === 422) {
            error_log("Fallback failed - Consider enabling fallback functionality (enableFallback: true)");
        } elseif ($code === 500) {
            error_log("Server internal error - Please try again later");
        } elseif ($code === 501) {
            error_log("Task failed - Video generation failed");
        }
    }

    // Return 200 status code to confirm callback received
    http_response_code(200);
    echo json_encode(['code' => 200, 'msg' => 'success']);

    function downloadFile($url, $filename) {
        $downloadDir = 'downloads';
        if (!is_dir($downloadDir)) {
            mkdir($downloadDir, 0755, true);
        }
        
        $filepath = $downloadDir . '/' . $filename;
        
        $fileContent = file_get_contents($url);
        if ($fileContent === false) {
            throw new Exception("Failed to download file from URL");
        }
        
        $result = file_put_contents($filepath, $fileContent);
        if ($result === false) {
            throw new Exception("Failed to save file locally");
        }
    }
    ?>
    ```
  </Tab>
</Tabs>

## Best Practices

<Tip>
  ### Callback URL Configuration Recommendations

  1. **Use HTTPS**: Ensure callback URL uses HTTPS protocol to guarantee data transmission security
  2. **Verify Source**: Verify the legitimacy of request sources in callback processing
  3. **Idempotent Processing**: The same taskId may receive multiple callbacks, ensure processing logic is idempotent
  4. **Quick Response**: Callback processing should return 200 status code as soon as possible to avoid timeout
  5. **Asynchronous Processing**: Complex business logic should be processed asynchronously to avoid blocking callback response
  6. **Timely Download**: Video URLs have certain validity period, please download and save promptly
  7. **Array Handling**: resultUrls and originUrls are direct array formats that can be iterated directly
  8. **English Prompts**: Ensure using English prompts to avoid language-related errors
</Tip>

<Warning>
  ### Important Reminders

  * Callback URL must be publicly accessible
  * Server must respond within 15 seconds, otherwise it will be considered timeout
  * After 3 consecutive retry failures, the system will stop sending callbacks
  * **Only English prompts are supported**, please ensure prompts use English
  * Please ensure the stability of callback processing logic to avoid callback failures due to exceptions
  * Properly handle content review errors to ensure input content complies with platform policies
  * resultUrls and originUrls return direct array formats that can be iterated directly
  * originUrls only has value when aspectRatio is not 16:9
  * Pay attention to image upload security checks to avoid uploading unsafe images
</Warning>

## Troubleshooting

If you don't receive callback notifications, please check the following:

<AccordionGroup>
  <Accordion title="Network Connection Issues">
    * Confirm callback URL is accessible from public network
    * Check firewall settings to ensure inbound requests are not blocked
    * Verify domain name resolution is correct
  </Accordion>

  <Accordion title="Server Response Issues">
    * Ensure server returns HTTP 200 status code within 15 seconds
    * Check error information in server logs
    * Verify interface path and HTTP method are correct
  </Accordion>

  <Accordion title="Content Format Issues">
    * Confirm received POST request body is JSON format
    * Check if Content-Type is application/json
    * Verify JSON parsing is correct
    * Correctly handle resultUrls and originUrls array formats
  </Accordion>

  <Accordion title="Video Processing Issues">
    * Confirm video URLs are accessible
    * Check video download permissions and network connection
    * Verify video save path and permissions
    * Pay attention to video URL validity period limitations
    * Backup videos to long-term storage system promptly
  </Accordion>

  <Accordion title="Content Review Issues">
    * Review content review error messages
    * Ensure prompts use English
    * Ensure input images don't contain inappropriate content
    * Check if prompts comply with platform content policies
    * Avoid using sensitive or violating descriptive words
    * Ensure image uploads are safe and in correct format
  </Accordion>

  <Accordion title="Generation Quality Issues">
    * Check generated video quality and resolution
    * Verify video duration meets expectations
    * Evaluate generated video quality and style
    * Ensure video content meets expectations
    * If originUrls exist, compare differences between original and generated videos
  </Accordion>
</AccordionGroup>

## Veo3 Specific Notes

<Note>
  ### Veo3 Video Generation Features

  Veo3 AI video generation functionality has the following characteristics:

  1. **High-Quality Generation**: Veo3 provides high-quality AI video generation capabilities
  2. **Multiple Aspect Ratio Support**: Supports various aspect ratios, provides original video when not 16:9
  3. **English Prompts**: Only supports English prompts, please ensure input is in English
  4. **Content Safety**: Strict content review mechanism to ensure generated content is safe and compliant
  5. **Flexible Output**: resultUrls may contain multiple video files
  6. **Original Preservation**: When aspect ratio is not 16:9, original size video will be preserved
</Note>

## Alternative Solutions

If you cannot use the callback mechanism, you can also use polling:

<Card title="Poll Query Results" icon="radar" href="/veo3-api/get-veo-3-video-details">
  Use the Get Veo3 Video Details interface to periodically query task status, recommend querying every 30 seconds.
</Card>
# Veo3 Video Generation Callbacks

> The system will call this callback to notify results when video generation is completed

When you submit a video generation task to the Veo3 API, you can set a callback address through the `callBackUrl` parameter. After the task is completed, the system will automatically push the results to your specified address.

## Callback Mechanism Overview

<Info>
  The callback mechanism avoids the need for you to poll the API for task status, as the system will actively push task completion results to your server.
</Info>

### Callback Timing

The system will send callback notifications in the following situations:

* Video generation task completed successfully
* Video generation task failed
* Error occurred during task processing

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout Setting**: 15 seconds

## Callback Request Format

After the task is completed, the system will send a POST request to your `callBackUrl` in the following format:

<CodeGroup>
  ```json Success Callback
  {
    "code": 200,
    "msg": "Veo3 video generated successfully.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "info": {
        "resultUrls": ["http://example.com/video1.mp4"],
        "originUrls": ["http://example.com/original_video1.mp4"],
        "resolution": "1080p"
      },
      "fallbackFlag": false
    }
  }
  ```

  ```json Failure Callback
  {
    "code": 400,
    "msg": "Your prompt was flagged by Website as violating content policies.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "fallbackFlag": false
    }
  }
  ```

  ```json Fallback Failed Callback
  {
    "code": 422,
    "msg": "Your request was rejected by Flow(Your prompt was flagged by Website as violating content policies). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation.",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "fallbackFlag": false
    }
  }
  ```

  ```json Fallback Success Callback
  {
    "code": 200,
    "msg": "Veo3 video generated successfully (using fallback model).",
    "data": {
      "taskId": "veo_task_abcdef123456",
      "info": {
        "resultUrls": ["http://example.com/video1.mp4"],
        "resolution": "1080p"
      },
      "fallbackFlag": true
    }
  }
  ```
</CodeGroup>

## Status Code Description

<ParamField path="code" type="integer" required>
  Callback status code indicating task processing result:

  | Status Code | Description                                                                                                                                                                                                                                                                            |
  | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 200         | Success - Video generation task successfully                                                                                                                                                                                                                                           |
  | 400         | Client error - Prompt violates content policies or other input errors                                                                                                                                                                                                                  |
  | 422         | Fallback failed - When fallback is not enabled and specific errors occur, returns error message format: Your request was rejected by Flow(original error message). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation. |
  | 500         | Internal error - Please try again later, internal error or timeout                                                                                                                                                                                                                     |
  | 501         | Failed - Video generation task failed                                                                                                                                                                                                                                                  |
</ParamField>

<ParamField path="msg" type="string" required>
  Status message providing detailed status description. Different status codes correspond to different error messages:

  **400 Status Code Error Messages:**

  * Your prompt was flagged by Website as violating content policies
  * Only English prompts are supported at this time
  * Failed to fetch the image. Kindly verify any access limits set by you or your service provider
  * Public error: unsafe image upload

  **422 Status Code Error Messages:**

  * Your request was rejected by Flow(original error message). You may consider using our other fallback channels, which are likely to succeed. Please refer to the documentation.

  **Fallback Mechanism Description:**
  When `enableFallback` is enabled and the following errors occur, the system will attempt to use the backup model:

  * public error minor upload
  * Your prompt was flagged by Website as violating content policies
  * public error prominent people upload
</ParamField>

<ParamField path="data.taskId" type="string" required>
  Task ID, consistent with the taskId returned when you submitted the task
</ParamField>

<ParamField path="data.info.resultUrls" type="array">
  Generated video URL array (returned only on success)
</ParamField>

<ParamField path="data.info.originUrls" type="array">
  Original video URL array (returned only on success), only has value when aspectRatio is not 16:9
</ParamField>

<ParamField path="data.info.resolution" type="string">
  Video resolution information (returned only on success), indicates the resolution of the generated video
</ParamField>

<ParamField path="data.fallbackFlag" type="boolean">
  Whether generated using fallback model. True means backup model was used, false means primary model was used
</ParamField>

## Fallback Functionality Description

<Info>
  The fallback functionality is an intelligent backup generation mechanism. When the primary model encounters specific errors, it automatically switches to a backup model to continue generation, improving task success rates.
</Info>

### Enabling Conditions

The fallback functionality requires the following conditions to be met simultaneously:

1. `enableFallback` parameter is set to `true` in the request
2. Aspect ratio is `16:9`
3. One of the following specific errors occurs:
   * public error minor upload
   * Your prompt was flagged by Website as violating content policies
   * public error prominent people upload

### Fallback Limitations

* **Resolution**: Fallback-generated videos are created in 1080p resolution by default and cannot be accessed via the Get 1080P Video endpoint
* **Image Requirements**: If using image-to-video generation, images must be in 16:9 ratio, otherwise automatic cropping will occur
* **Credit Calculation**: Successful fallback has different credit consumption, please see [https://kie.ai/billing](https://kie.ai/billing) for billing details

### Error Handling

* **Fallback Enabled**: Automatically switch to backup model when specific errors occur, task continues execution
* **Fallback Not Enabled**: Returns 422 status code when specific errors occur, suggesting to enable fallback functionality

<Warning>
  The fallback functionality only takes effect in specific error scenarios. For other types of errors (such as insufficient credits, network issues, etc.), the fallback functionality will not be activated.
</Warning>

## Callback Reception Examples

Here are example codes for receiving callbacks in popular programming languages:

<Tabs>
  <Tab title="Node.js">
    ```javascript
    const express = require('express');
    const fs = require('fs');
    const https = require('https');
    const app = express();

    app.use(express.json());

    app.post('/veo3-callback', (req, res) => {
      const { code, msg, data } = req.body;
      
      console.log('Received Veo3 video generation callback:', {
        taskId: data.taskId,
        status: code,
        message: msg
      });
      
      if (code === 200) {
        // Video generation successful
        const { taskId, info, fallbackFlag } = data;
        const { resultUrls, originUrls, resolution } = info;
        
        console.log('Video generation successful!');
        console.log(`Task ID: ${taskId}`);
        console.log(`Generated video URLs: ${resultUrls}`);
        console.log(`Video resolution: ${resolution}`);
        console.log(`Using fallback model: ${fallbackFlag ? 'Yes' : 'No'}`);
        if (originUrls) {
          console.log(`Original video URLs: ${originUrls}`);
        }
        
        // Download generated video files
        resultUrls.forEach((url, index) => {
          if (url) {
            downloadFile(url, `veo3_generated_${taskId}_${index}.mp4`)
              .then(() => console.log(`Video ${index + 1} downloaded successfully`))
              .catch(err => console.error(`Video ${index + 1} download failed:`, err));
          }
        });
        
        // Download original video files (if exists)
        if (originUrls) {
          originUrls.forEach((url, index) => {
            if (url) {
              downloadFile(url, `veo3_original_${taskId}_${index}.mp4`)
                .then(() => console.log(`Original video ${index + 1} downloaded successfully`))
                .catch(err => console.error(`Original video ${index + 1} download failed:`, err));
            }
          });
        }
        
      } else {
        // Video generation failed
        console.log('Veo3 video generation failed:', msg);
        
        // Handle specific error types
        if (code === 400) {
          console.log('Client error - Check prompts and content policies');
        } else if (code === 422) {
          console.log('Fallback failed - Consider enabling fallback functionality (enableFallback: true)');
        } else if (code === 500) {
          console.log('Server internal error - Please try again later');
        } else if (code === 501) {
          console.log('Task failed - Video generation failed');
        }
      }
      
      // Return 200 status code to confirm callback received
      res.status(200).json({ code: 200, msg: 'success' });
    });

    // Helper function: Download file
    function downloadFile(url, filename) {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          } else {
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        }).on('error', reject);
      });
    }

    app.listen(3000, () => {
      console.log('Callback server running on port 3000');
    });
    ```
  </Tab>

  <Tab title="Python">
    ```python
    from flask import Flask, request, jsonify
    import requests
    import json
    import os

    app = Flask(__name__)

    @app.route('/veo3-callback', methods=['POST'])
    def handle_callback():
        data = request.json
        
        code = data.get('code')
        msg = data.get('msg')
        callback_data = data.get('data', {})
        task_id = callback_data.get('taskId')
        
        print(f"Received Veo3 video generation callback:")
        print(f"Task ID: {task_id}")
        print(f"Status: {code}, Message: {msg}")
        
        if code == 200:
        # Video generation successful
        info = callback_data.get('info', {})
        result_urls = info.get('resultUrls')
        origin_urls = info.get('originUrls')
        resolution = info.get('resolution')
        fallback_flag = callback_data.get('fallbackFlag', False)
        
        print("Video generation successful!")
        print(f"Generated video URLs: {result_urls}")
        print(f"Video resolution: {resolution}")
        print(f"Using fallback model: {'Yes' if fallback_flag else 'No'}")
        if origin_urls:
            print(f"Original video URLs: {origin_urls}")
        
        # Download generated video files
        if result_urls:
            for i, url in enumerate(result_urls):
                if url:
                    try:
                        video_filename = f"veo3_generated_{task_id}_{i}.mp4"
                        download_file(url, video_filename)
                        print(f"Video {i + 1} downloaded successfully")
                    except Exception as e:
                        print(f"Video {i + 1} download failed: {e}")
        
        # Download original video files (if exists)
        if origin_urls:
            for i, url in enumerate(origin_urls):
                if url:
                    try:
                        original_filename = f"veo3_original_{task_id}_{i}.mp4"
                        download_file(url, original_filename)
                        print(f"Original video {i + 1} downloaded successfully")
                    except Exception as e:
                        print(f"Original video {i + 1} download failed: {e}")

    else:
        # Video generation failed
        print(f"Veo3 video generation failed: {msg}")
        
        # Handle specific error types
        if code == 400:
            print("Client error - Check prompts and content policies")
            if 'content policies' in msg:
                print("Content review failed - Please modify prompts")
            elif 'English prompts' in msg:
                print("Language error - Only English prompts are supported")
            elif 'unsafe image' in msg:
                print("Image safety check failed - Please change image")
        elif code == 422:
            print("Fallback failed - Consider enabling fallback functionality (enableFallback: true)")
        elif code == 500:
            print("Server internal error - Please try again later")
        elif code == 501:
            print("Task failed - Video generation failed")
        
        # Return 200 status code to confirm callback received
        return jsonify({'code': 200, 'msg': 'success'}), 200

    def download_file(url, filename):
        """Download file from URL and save to local"""
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        os.makedirs('downloads', exist_ok=True)
        filepath = os.path.join('downloads', filename)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=3000)
    ```
  </Tab>

  <Tab title="PHP">
    ```php
    <?php
    header('Content-Type: application/json');

    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $code = $data['code'] ?? null;
    $msg = $data['msg'] ?? '';
    $callbackData = $data['data'] ?? [];
    $taskId = $callbackData['taskId'] ?? '';

    error_log("Received Veo3 video generation callback:");
    error_log("Task ID: $taskId");
    error_log("Status: $code, Message: $msg");

    if ($code === 200) {
        // Video generation successful
        $info = $callbackData['info'] ?? [];
        $resultUrls = $info['resultUrls'] ?? '';
        $originUrls = $info['originUrls'] ?? '';
        $resolution = $info['resolution'] ?? '';
        $fallbackFlag = $callbackData['fallbackFlag'] ?? false;
        
        error_log("Video generation successful!");
        error_log("Generated video URLs: $resultUrls");
        error_log("Video resolution: $resolution");
        error_log("Using fallback model: " . ($fallbackFlag ? 'Yes' : 'No'));
        if (!empty($originUrls)) {
            error_log("Original video URLs: $originUrls");
        }
        
        // Download generated video files
        if (!empty($resultUrls) && is_array($resultUrls)) {
            foreach ($resultUrls as $index => $url) {
                if (!empty($url)) {
                    try {
                        $videoFilename = "veo3_generated_{$taskId}_{$index}.mp4";
                        downloadFile($url, $videoFilename);
                        error_log("Video " . ($index + 1) . " downloaded successfully");
                    } catch (Exception $e) {
                        error_log("Video " . ($index + 1) . " download failed: " . $e->getMessage());
                    }
                }
            }
        }
        
        // Download original video files (if exists)
        if (!empty($originUrls) && is_array($originUrls)) {
            foreach ($originUrls as $index => $url) {
                if (!empty($url)) {
                    try {
                        $originalFilename = "veo3_original_{$taskId}_{$index}.mp4";
                        downloadFile($url, $originalFilename);
                        error_log("Original video " . ($index + 1) . " downloaded successfully");
                    } catch (Exception $e) {
                        error_log("Original video " . ($index + 1) . " download failed: " . $e->getMessage());
                    }
                }
            }
        }
        
    } else {
        // Video generation failed
        error_log("Veo3 video generation failed: $msg");
        
        // Handle specific error types
        if ($code === 400) {
            error_log("Client error - Check prompts and content policies");
            if (strpos($msg, 'content policies') !== false) {
                error_log("Content review failed - Please modify prompts");
            } elseif (strpos($msg, 'English prompts') !== false) {
                error_log("Language error - Only English prompts are supported");
            } elseif (strpos($msg, 'unsafe image') !== false) {
                error_log("Image safety check failed - Please change image");
            }
        } elseif ($code === 422) {
            error_log("Fallback failed - Consider enabling fallback functionality (enableFallback: true)");
        } elseif ($code === 500) {
            error_log("Server internal error - Please try again later");
        } elseif ($code === 501) {
            error_log("Task failed - Video generation failed");
        }
    }

    // Return 200 status code to confirm callback received
    http_response_code(200);
    echo json_encode(['code' => 200, 'msg' => 'success']);

    function downloadFile($url, $filename) {
        $downloadDir = 'downloads';
        if (!is_dir($downloadDir)) {
            mkdir($downloadDir, 0755, true);
        }
        
        $filepath = $downloadDir . '/' . $filename;
        
        $fileContent = file_get_contents($url);
        if ($fileContent === false) {
            throw new Exception("Failed to download file from URL");
        }
        
        $result = file_put_contents($filepath, $fileContent);
        if ($result === false) {
            throw new Exception("Failed to save file locally");
        }
    }
    ?>
    ```
  </Tab>
</Tabs>

## Best Practices

<Tip>
  ### Callback URL Configuration Recommendations

  1. **Use HTTPS**: Ensure callback URL uses HTTPS protocol to guarantee data transmission security
  2. **Verify Source**: Verify the legitimacy of request sources in callback processing
  3. **Idempotent Processing**: The same taskId may receive multiple callbacks, ensure processing logic is idempotent
  4. **Quick Response**: Callback processing should return 200 status code as soon as possible to avoid timeout
  5. **Asynchronous Processing**: Complex business logic should be processed asynchronously to avoid blocking callback response
  6. **Timely Download**: Video URLs have certain validity period, please download and save promptly
  7. **Array Handling**: resultUrls and originUrls are direct array formats that can be iterated directly
  8. **English Prompts**: Ensure using English prompts to avoid language-related errors
</Tip>

<Warning>
  ### Important Reminders

  * Callback URL must be publicly accessible
  * Server must respond within 15 seconds, otherwise it will be considered timeout
  * After 3 consecutive retry failures, the system will stop sending callbacks
  * **Only English prompts are supported**, please ensure prompts use English
  * Please ensure the stability of callback processing logic to avoid callback failures due to exceptions
  * Properly handle content review errors to ensure input content complies with platform policies
  * resultUrls and originUrls return direct array formats that can be iterated directly
  * originUrls only has value when aspectRatio is not 16:9
  * Pay attention to image upload security checks to avoid uploading unsafe images
</Warning>

## Troubleshooting

If you don't receive callback notifications, please check the following:

<AccordionGroup>
  <Accordion title="Network Connection Issues">
    * Confirm callback URL is accessible from public network
    * Check firewall settings to ensure inbound requests are not blocked
    * Verify domain name resolution is correct
  </Accordion>

  <Accordion title="Server Response Issues">
    * Ensure server returns HTTP 200 status code within 15 seconds
    * Check error information in server logs
    * Verify interface path and HTTP method are correct
  </Accordion>

  <Accordion title="Content Format Issues">
    * Confirm received POST request body is JSON format
    * Check if Content-Type is application/json
    * Verify JSON parsing is correct
    * Correctly handle resultUrls and originUrls array formats
  </Accordion>

  <Accordion title="Video Processing Issues">
    * Confirm video URLs are accessible
    * Check video download permissions and network connection
    * Verify video save path and permissions
    * Pay attention to video URL validity period limitations
    * Backup videos to long-term storage system promptly
  </Accordion>

  <Accordion title="Content Review Issues">
    * Review content review error messages
    * Ensure prompts use English
    * Ensure input images don't contain inappropriate content
    * Check if prompts comply with platform content policies
    * Avoid using sensitive or violating descriptive words
    * Ensure image uploads are safe and in correct format
  </Accordion>

  <Accordion title="Generation Quality Issues">
    * Check generated video quality and resolution
    * Verify video duration meets expectations
    * Evaluate generated video quality and style
    * Ensure video content meets expectations
    * If originUrls exist, compare differences between original and generated videos
  </Accordion>
</AccordionGroup>

## Veo3 Specific Notes

<Note>
  ### Veo3 Video Generation Features

  Veo3 AI video generation functionality has the following characteristics:

  1. **High-Quality Generation**: Veo3 provides high-quality AI video generation capabilities
  2. **Multiple Aspect Ratio Support**: Supports various aspect ratios, provides original video when not 16:9
  3. **English Prompts**: Only supports English prompts, please ensure input is in English
  4. **Content Safety**: Strict content review mechanism to ensure generated content is safe and compliant
  5. **Flexible Output**: resultUrls may contain multiple video files
  6. **Original Preservation**: When aspect ratio is not 16:9, original size video will be preserved
</Note>

## Alternative Solutions

If you cannot use the callback mechanism, you can also use polling:

<Card title="Poll Query Results" icon="radar" href="/veo3-api/get-veo-3-video-details">
  Use the Get Veo3 Video Details interface to periodically query task status, recommend querying every 30 seconds.
</Card>
