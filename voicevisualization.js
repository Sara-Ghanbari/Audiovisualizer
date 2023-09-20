// Define global variables
let isRecording = false;
let audioCtx;
let source;
let drawVisual;
const canvas = document.getElementById("canvas1");
const button = document.getElementById("button");
const button_img = document.getElementById("buttonImg");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var canvasCtx = canvas.getContext("2d");

// Start recording and visualizing the audio stream
function startRecording(stream) {
  isRecording = true;
  button_img.src = "stop.png";
  // Create an audio context and an analyser
  audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  // Connect the stream source to the analyser
  source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);
  analyser.fftSize = 1024;
  // Set the FFT size and get the frequency data
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);
  // Clear the canvas
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  // Check the visualization type (bar or line)
  const barShow = document.getElementById("barShow").checked;
  if (barShow) {
    drawBar();
  } else {
    drawLine();
  }

  // A common function for drawing the visualization
  function drawPreSet(drawType) {
    // Request an animation frame and get the frequency data
    drawVisual = requestAnimationFrame(drawType);
    analyser.getByteTimeDomainData(dataArray);
    // Fill the canvas with white color
    canvasCtx.fillStyle = "rgb(255, 255, 255)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // A function for drawing the line visualization
  function drawLine() {
    // Call the common function with this function as argument
    drawPreSet(drawLine);
    // Set the line width and color
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    // Start a new path
    canvasCtx.beginPath();
    // Calculate the slice width for each data point
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    // Loop through the data points and draw a line segment for each one
    for (let i = 0; i < bufferLength; i++) {
      // Normalize the data point value and scale it to the canvas height
      const v = dataArray[i] / 128.0;
      const y = v * (canvas.height / 2);
      // Move to the first point or draw a line to the next point
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      // Increment the x position by the slice width
      x += sliceWidth;
    }
    // Draw a line to the end of the canvas and stroke the path
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  // A function for drawing the bar visualization
  function drawBar() {
    // Call the common function with this function as argument
    drawPreSet(drawBar);
    // Calculate the bar width for each data point
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    // Loop through the data points and draw a bar for each one
    for (let i = 0; i < bufferLength; i++) {
      // Scale the data point value to get the bar height
      barHeight = dataArray[i] ** 1.32;
      // Set the bar color to black
      canvasCtx.fillStyle = `rgb(0, 0, 0)`;
      // Draw a rectangle with the calculated position and size
      canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
      // Increment the x position by the bar width plus one pixel gap
      x += barWidth + 1;
    }
  }
}

// Stop recording and reset the canvas and audio context
function stopRecording() {
  canvasCtx.reset();
  cancelAnimationFrame(drawVisual);
  isRecording = false;
  button_img.src = "play.png";
  audioCtx.close();
}

// Add an event listener to the button to toggle recording on or off
button.addEventListener("click", async function () {
  if (!isRecording) {
    // Disabling radio buttons
    document.getElementById("barShow").disabled = true;
    document.getElementById("lineShow").disabled = true;
    // Get user media permission and start recording with audio stream
    let stream = await navigator.mediaDevices.getUserMedia({
      vide: false,
      audio: true,
    });
    startRecording(stream);
  } else {
    // Enabling radio buttons
    document.getElementById("barShow").disabled = false;
    document.getElementById("lineShow").disabled = false;
    // Stop recording and release the stream
    stopRecording();
  }
});
