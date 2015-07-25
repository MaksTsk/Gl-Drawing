"use strict";

var gl, 
    canvas,
    vIndex = 0,
    vBuffer;

$(document).ready(function (){
    init();
    console.log('after init');
});

function init () {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*10000, gl.STATIC_DRAW);

    program.a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(program.a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_position);

    $(canvas).on('click', onCanvasClick);

    render();
};

function onCanvasClick (event) {
    var clickPosition = getGlVertexPosition(event, canvas);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * vIndex, flatten(clickPosition));
    vIndex++;
    render();
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

    if(vIndex != 0) {
        gl.drawArrays(gl.LINE_STRIP, 0, vIndex);
    }
}
