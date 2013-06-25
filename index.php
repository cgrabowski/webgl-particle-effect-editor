<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>WebGL Particle Effect</title>
    <link rel='stylesheet' href='css/reset.css'>
    <link rel='stylesheet' href='css/rickshaw/detail.css'>
    <link rel='stylesheet' href='css/rickshaw/graph.css'>
    <link rel='stylesheet' href='css/rickshaw/render-controls.css'>
    <link rel='stylesheet' href='css/typography.css'>
    <link rel='stylesheet' href='css/main.css'>
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
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.15/jquery-ui.min.js"></script>
    <script src="http://localhost/WebGLParticleEffect/js/gl-matrix.js"></script>
    <script src="http://localhost/WebGLParticleEffect/js/webgl-utils.js"></script>
    <script src='http://localhost/WebGLParticleEffect/js/particle-effect.js'></script>
    <script src='http://localhost/WebGLParticleEffect/js/engine.js'></script>
    <script src='js/rickshaw/vendor/d3.min.js'></script>
    <script src='js/rickshaw/vendor/d3.layout.min.js'></script>
    <script src='js/rickshaw/rickshaw.js'></script>
    <script src='js/rickshaw/render-controls.js'></script>
    <script src='js/gui.js'></script>
  </head>
  <body onload="engine();">
    <header>WebGL PEE</header>
    <div id='container'>
      <canvas id="webgl-canvas" width='500' height='500'></canvas>
    </div>
  </body>
</html>
