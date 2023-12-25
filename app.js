const video = document.getElementById('webcam-video')

// Load models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo) // Only stream video once all models are loaded

// Video streaming function
function startVideo() {
    navigator.mediaDevices.getUserMedia(
        { video: true, audio: false }
    ).then(stream => {video.srcObject = stream}).catch(e => console.error(e))
}

video.addEventListener('playing', () => {
    // Create canvas detection mask
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas) // Apply mask

    // Get video size
    const display_size = { width: video.width, height: video.height }
    // Make sure mask and video size are equal
    faceapi.matchDimensions(canvas, display_size)

    // Draw loop
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            video, new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions()

        // Make sure detections and video size are equal
        const resized_detections = faceapi.resizeResults(detections, display_size)
        // Clear canvas
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        // Draw detections
        faceapi.draw.drawDetections(canvas, resized_detections)
        faceapi.draw.drawFaceExpressions(canvas, resized_detections)
    })
})