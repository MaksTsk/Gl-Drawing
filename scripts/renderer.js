"use strict";

var gl, 
    canvas;

$(document).ready(function (){
    init();
    console.log('after init');
});

function init () {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    render();
};



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT ); 
}
