/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Modified by: Amir Mohammad Esmaieeli Sikaroudi & Jesse Oved
  Email: amesmaieeli@email.arizona.edu, jesseoved@arizona.edu
*/

// constants
const ROTATE_SPEED = 3; // increase to speed up rotation

//access DOM elements we'll use
var input = document.getElementById("load_image");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var slider = document.getElementById("rotate_speed");
var sliderOutput = document.getElementById("rotate_value");
slider.oninput = function() {
    sliderOutput.innerHTML = this.value;
  } 
// The width and height of the image
var width = 0;
var height = 0;

// The image data
var ppm_img_data;

//Function to process upload
var upload = async function () {
    if (input.files.length > 0) {
        var file = input.files[0];
        console.log("You chose", file.name);
        if (file.type) console.log("It has type", file.type);
        var fReader = new FileReader();
        fReader.readAsBinaryString(file);

        fReader.onload = function(e) {
            //if successful, file data has the contents of the uploaded file
            var file_data = fReader.result;
            parsePPM(file_data);
        }
    }
}

var t = 0.0;
var rotateImage = function (){
    if (ppm_img_data == null) {
        window.requestAnimationFrame(rotateImage);
        return;
    }

    // increment by current rotation speed. 
    // remember to convert to float first because js will just let you increment a number using a string???
    // what does that even do? does it do concatenation and turn t into a string? 
    // but if it does then WHY am I still able to use it in arithmetic????
    // I do not like js :(
    t += parseFloat(slider.value);
    
    var size = maxCanvasSize();
    var newImageData = ctx.createImageData(size, size);

    var r = Deg2Rad(t);
    var rotMat = GetRotationMatrixRad(r);

    var scaleFactor = 1 + (Math.SQRT2 - 1) * Math.abs(Math.sin(2 * r));
    var scaleMat = GetScalingMatrix(scaleFactor, scaleFactor);

    var translateMat = GetTranslationMatrix( size / 2, size / 2);
    var undoTranslateMat = GetTranslationMatrix( - size / 2, - size / 2);

    var matrix = MultiplyMatrixMatrix(translateMat, rotMat);
    matrix = MultiplyMatrixMatrix(matrix, scaleMat);
    matrix = MultiplyMatrixMatrix(matrix, undoTranslateMat);

    for (var i = 0; i < size * size * 4; i += 4) {
        // Get the pixel location in x and y with (0,0) being the top left of the image
        var pixel = [Math.floor(i / 4) % width, 
                     Math.floor(i / 4) / width, 1];

        // Get the location of the sample pixel
        var samplePixel = MultiplyMatrixVector(matrix, pixel);

        // Floor pixel to integer
        samplePixel[0] = Math.floor(samplePixel[0]);
        samplePixel[1] = Math.floor(samplePixel[1]);
        
        // if pixel inside image bounds, we can sample
        if (inRange(samplePixel[0], 0, width) && inRange(samplePixel[1], 0, height)) {
            setPixelColor(newImageData, samplePixel, i);
        } else {
            // otherwise we set it to white/transparent
            setPixelCustomColor(newImageData, i, 255, 255, 255, 0);
        }
    }
    // var center = Math.floor((size * size * 4) / 2) - size * 2;
    // for (var i = center-16; i < center + 16; i += 4) {
    //     setPixelCustomColor(newImageData, i, 255, 0, 0, 255);
    // }
    
    // write to canvas
    ctx.putImageData(newImageData, canvas.width/2 - width/2, canvas.height/2 - height/2);

    // Show matrix
    showMatrix(matrix);
    window.requestAnimationFrame(rotateImage);
}

function maxCanvasSize(){
    return Math.max(width, height);
}

// Show transformation matrix on HTML
function showMatrix(matrix){
    for(let i=0;i<matrix.length;i++){
        for(let j=0;j<matrix[i].length;j++){
            matrix[i][j]=Math.floor((matrix[i][j]*100))/100;
        }
    }
    document.getElementById("row1").innerHTML = "row 1:[ " + matrix[0].toString().replaceAll(",",",\t") + " ]";
    document.getElementById("row2").innerHTML = "row 2:[ " + matrix[1].toString().replaceAll(",",",\t") + " ]";
    document.getElementById("row3").innerHTML = "row 3:[ " + matrix[2].toString().replaceAll(",",",\t") + " ]";
}

// Sets the color of a pixel in the new image data
function setPixelColor(newImageData, samplePixel, i){
    var offset = ((samplePixel[1] - 1) * width + samplePixel[0] - 1) * 4;

    // Set the new pixel color
    newImageData.data[i    ] = ppm_img_data.data[offset    ];
    newImageData.data[i + 1] = ppm_img_data.data[offset + 1];
    newImageData.data[i + 2] = ppm_img_data.data[offset + 2];
    newImageData.data[i + 3] = 255;
}

// Sets the color of a pixel in the new image data to white, and transparent
function setPixelCustomColor(newImageData, i, r, g, b, a) {
    newImageData.data[i] = r;
    newImageData.data[i+1] = g;
    newImageData.data[i+2] = b;
    newImageData.data[i+3] = a;
}

// Load PPM Image to Canvas
// Untouched from the original code
function parsePPM(file_data){
    /*
   * Extract header
   */
    var format = "";
    var max_v = 0;
    var lines = file_data.split(/#[^\n]*\s*|\s+/); // split text by whitespace or text following '#' ending with whitespace
    var counter = 0;
    // get attributes
    for(var i = 0; i < lines.length; i ++){
        if(lines[i].length == 0) {continue;} //in case, it gets nothing, just skip it
        if(counter == 0){
            format = lines[i];
        }else if(counter == 1){
            width = lines[i];
        }else if(counter == 2){
            height = lines[i];
        }else if(counter == 3){
            max_v = Number(lines[i]);
        }else if(counter > 3){
            break;
        }
        counter ++;
    }
    console.log("Format: " + format);
    console.log("Width: " + width);
    console.log("Height: " + height);
    console.log("Max Value: " + max_v);
    /*
     * Extract Pixel Data
     */
    var bytes = new Uint8Array(3 * width * height);  // i-th R pixel is at 3 * i; i-th G is at 3 * i + 1; etc.
    // i-th pixel is on Row i / width and on Column i % width
    // Raw data must be last 3 X W X H bytes of the image file
    var raw_data = file_data.substring(file_data.length - width * height * 3);
    for(var i = 0; i < width * height * 3; i ++){
        // convert raw data byte-by-byte
        bytes[i] = raw_data.charCodeAt(i);
    }
    // update width and height of canvas
    document.getElementById("canvas").setAttribute("width", window.innerWidth);
    document.getElementById("canvas").setAttribute("height", window.innerHeight);
    // create ImageData object
    var image_data = ctx.createImageData(width, height);
    // fill ImageData
    for(var i = 0; i < image_data.data.length; i+= 4){
        let pixel_pos = parseInt(i / 4);
        image_data.data[i + 0] = bytes[pixel_pos * 3 + 0]; // Red ~ i + 0
        image_data.data[i + 1] = bytes[pixel_pos * 3 + 1]; // Green ~ i + 1
        image_data.data[i + 2] = bytes[pixel_pos * 3 + 2]; // Blue ~ i + 2
        image_data.data[i + 3] = 255; // A channel is deafult to 255
    }
    ctx.putImageData(image_data, canvas.width/2 - width/2, canvas.height/2 - height/2);
    //ppm_img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);   // This gives more than just the image I want??? I think it grabs white space from top left?
    ppm_img_data = image_data;

    //makeCanvasSquare();

}

//Connect event listeners
input.addEventListener("change", upload);

// start animation
window.requestAnimationFrame(rotateImage);
//rotateImage();