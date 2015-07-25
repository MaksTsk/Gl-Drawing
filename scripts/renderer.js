"use strict";

var gl, 
    canvas,
    vIndex = 0,
    vBuffer,
    cBuffer,
    drawingMode, 
    curvesEnds = [],
    currentColor,
    colorPicker;

$(document).ready(function (){
    init();
    console.log('after init');
});

function init () {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*10000, gl.STATIC_DRAW);

    program.a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(program.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_position);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * 10000, gl.STATIC_DRAW);

    program.a_color = gl.getAttribLocation(program, 'a_color');
    gl.vertexAttribPointer(program.a_color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_color);

    $(canvas).on('mousedown', onCanvasMouseDown)
             .on('mousemove', onCanvasMouseMove);
    $(document).on('mouseup', onDocumentMouseUp);

    colorPicker = $('#color-picker').change(onColorChange);
    currentColor = getGlColor(colorPicker.val());

    render();
};

function onColorChange () {
    currentColor = getGlColor(colorPicker.val());
}

function onCanvasMouseDown () {
    drawingMode = true;

    addCurrentPotinToBuffer(event);
}

function onCanvasMouseMove (event) {
    if(!drawingMode) return;

    addCurrentPotinToBuffer(event);
}

function addCurrentPotinToBuffer (event) {
    var clickPosition = getGlVertexPosition(event, canvas);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * vIndex, flatten(clickPosition));

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * vIndex, flatten(currentColor));

    vIndex++;
    render();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getGlColor (hexColor) {
    var rgbColor = hexToRgb(hexColor);

    return vec4(rgbColor.r / 255.0, rgbColor.g / 255.0, rgbColor.b / 255.0, 1.0);
}

function onDocumentMouseUp () {
    drawingMode = false;

    curvesEnds.push(vIndex);
}

/**
* Get's click location in image coordinate system
* @param   {Object} event - click event info
* @returns {Object}       - {x, y} click location in image coordinate system
*/
function getImageClickPosition(event) {
    var x = event.pageX - $(event.target).offset().left;
    var y = event.pageY - $(event.target).offset().top;
    
    return {x: x, y: y};
}

/**
* Get's click location in WebGl vertex coordinate system
* @param   {Object}   event        - click event info
* @param   {Canvas}   parentCanvas - image parent canvas
* @returns {Object}                - {x, y} click location in WebGL vertex coordinate system
*/
function getGlVertexPosition (event, parentCanvas) {
    var mousePosition = getImageClickPosition(event);

    var x = (mousePosition.x-parentCanvas.clientWidth/2)/(parentCanvas.clientWidth/2);
    var y = -(mousePosition.y-parentCanvas.clientHeight/2)/(parentCanvas.clientHeight/2);

    return vec2(x,y);
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT ); 

    if(vIndex <= 1) return;

    var drawedElementsCount = 0;

    for (var i = 0; i < curvesEnds.length; i++) {
        var drawingCount = curvesEnds[i] - drawedElementsCount;
        gl.drawArrays(gl.LINE_STRIP, drawedElementsCount, drawingCount);

        drawedElementsCount += drawingCount;
    };

    gl.drawArrays(gl.LINE_STRIP, drawedElementsCount, vIndex - drawedElementsCount);

}
