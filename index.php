<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>WebGL Particle Effect</title>
        <script id="shader-vs" type="x-shader/x-vertex">
            attribute vec3 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
            }
        </script>
        <script id="shader-fs" type="x-shader/x-fragment">
            precision mediump float;
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            void main(void) {
            vec4 tmp = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor = tmp;
            }
        </script>
        <link rel='stylesheet' href='css/reset.css'>
        <link rel='stylesheet' href='css/custom-scrollbar.css'>
        <link rel='stylesheet' href='css/jquery-ui/jquery-ui-1.10.3.css'>
        <link rel='stylesheet' href='css/rickshaw/detail.css'>
        <link rel='stylesheet' href='css/rickshaw/graph.css'>
        <link rel='stylesheet' href='css/rickshaw/render-controls.css'>
        <link rel='stylesheet' href='css/typography.css'>
        <link rel='stylesheet' href='css/gui.css'>
        <script src="js/jquery-1.9.1.js"></script>    
        <script src="js/jquery-ui/jquery-ui-1.10.3.js"></script>
        <script src='js/FileSaver.min.js'></script>
        <script src="http://localhost/WebGLParticleEffect/js/three.js"></script>
        <script src="http://localhost/WebGLParticleEffect/js/gl-matrix.js"></script>
        <script src="http://localhost/WebGLParticleEffect/js/webgl-utils.js"></script>
        <script src="http://localhost/WebGLParticleEffect/js/trackball-controls.js"></script>
        <script src='http://localhost/WebGLParticleEffect/js/particle-effect.js'></script>
        <script src='http://localhost/WebGLParticleEffect/js/engine.js'></script>
        <script src='js/custom-scrollbar.js'></script>
        <script src='js/rickshaw/vendor/d3.min.js'></script>
        <script src='js/rickshaw/vendor/d3.layout.min.js'></script>
        <script src='js/rickshaw/rickshaw.js'></script>
        <script src='js/rickshaw/render-controls.js'></script>
        <script src='js/options-menu.js'></script>
        <script src='js/setting.js'></script>
        <script src='js/setting-graph.js'></script>
        <script src="js/toolbar.js"></script>
        <script src='js/gui.js'></script>
    </head>
    <body>
    </body>
</html>
