<template>
  <canvas id="webgl" width="400" height="400"></canvas>
</template>

<script>
/* eslint-disable */
export default {
  mounted() {
    //顶点着色器，gl_Position必须被赋值，否则着色器无法正常工作，PointSize不必须，默认为1
    var VSHADER_SOURCE =
      "attribute vec4 a_Position;\n" +
      "attribute vec4 a_Color;\n" +
      "varying vec4 v_Color;\n" +
      "void main() {\n" +
      "  gl_Position = a_Position;\n" +
      "  gl_PointSize = 10.0;\n" +
      "  v_Color = a_Color;\n" + // Pass the data to the fragment shader
      "}\n";

    // Fragment shader program
    var FSHADER_SOURCE =
      "#ifdef GL_ES\n" +
      "precision mediump float;\n" + // Precision qualifier (See Chapter 6)
      "#endif\n" +
      "varying vec4 v_Color;\n" + // Receive the data from the vertex shader
      "void main() {\n" +
      "  gl_FragColor = v_Color;\n" +
      "}\n";
    let canvas = document.getElementById("webgl");
    let gl = canvas.getContext("experimental-webgl");
    this.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    let n = this.initVertexBuffers(gl);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * @description: 执行顶点着色器，执行count次
     * @param {mode} 指定绘制的方式，接收常量符号,如下面的gl.POINTS
     * @param {first} 指定从哪个顶点开始绘制(整型)
     * @param {count} 指定绘制多少个顶点(整型)
     * @return {null}
     */
    gl.drawArrays(gl.TRIANGLES, 0, n);
  },
  methods: {
    initVertexBuffers(gl) {
      let vertices = new Float32Array([
        0.0,
        0.5,
        1.0,
        0.0,
        0.0,
        -0.5,
        -0.5,
        0.0,
        1.0,
        0.0,
        0.5,
        -0.5,
        0.0,
        0.0,
        1.0,
      ]);
      //创建顶点缓冲区
      let vertexSizeBuffer = gl.createBuffer();
      if (!vertexSizeBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
      /**
       * @description: 缓冲区绑定到gl数组
       * @param {target} gl.ARRAY_BUFFER 表示缓冲器对象中包含了顶点的数据
       * @param {target} gl.ELEMENT_ARRAY_BUFFER 表示缓冲区对象中包含了顶点的索引值
       * @param {target} buffer 指定由gl.createBuffer()返回的待绑定的缓冲区对象
       * @return {type}
       */
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
      //向缓冲区写入数据
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      let FSIZE = vertices.BYTES_PER_ELEMENT;
      let a_Position = gl.getAttribLocation(gl.program, "a_Position");
      //将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
      gl.enableVertexAttribArray(a_Position);
      let a_Color = gl.getAttribLocation(gl.program, "a_Color");
      //将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
      //连接a_Position变量与分配给它的缓冲区对象,开启attribute变量
      gl.enableVertexAttribArray(a_Color);
      return 3;
    },
    initShaders(gl, vshader, fshader) {
      var program = this.createProgram(gl, vshader, fshader);
      if (!program) {
        console.log("Failed to create program");
        return false;
      }

      gl.useProgram(program);
      gl.program = program;

      return true;
    },

    createProgram(gl, vshader, fshader) {
      // Create shader object
      var vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vshader);
      var fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fshader);
      if (!vertexShader || !fragmentShader) {
        return null;
      }

      // Create a program object
      var program = gl.createProgram();
      if (!program) {
        return null;
      }

      // Attach the shader objects
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);

      // Link the program object
      gl.linkProgram(program);

      // Check the result of linking
      var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log("Failed to link program: " + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
      }
      return program;
    },

    loadShader(gl, type, source) {
      // Create shader object
      var shader = gl.createShader(type);
      if (shader == null) {
        console.log("unable to create shader");
        return null;
      }

      // Set the shader program
      gl.shaderSource(shader, source);

      // Compile the shader
      gl.compileShader(shader);

      // Check the result of compilation
      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log("Failed to compile shader: " + error);
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    },
  },
};
</script>

<style></style>
