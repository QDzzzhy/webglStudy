<template>
  <canvas id="webgl" width="400" height="400"></canvas>
</template>

<script>
/* eslint-disable */
import Matrix4 from "../../assets/cuon-matrix";
export default {
  data() {
    return {
      eyeX: 0.2,
      eyeY: 0.25,
      eyeZ: 0.25,
    };
  },
  mounted() {
    //顶点着色器，gl_Position必须被赋值，否则着色器无法正常工作，PointSize不必须，默认为1
    var VSHADER_SOURCE =
      "attribute vec4 a_Position;\n" +
      "attribute vec4 a_Color;\n" +
    //   "uniform mat4 u_ViewMatrix;\n" + //视点矩阵
    //   "uniform mat4 u_ProjMatrix;\n" + //正射投影矩阵
    //   "uniform mat4 u_ModelMatrix;\n" + 
      "uniform mat4 u_MvpMatrix;\n" + 
      "varying vec4 v_Color;\n" +
      "void main() {\n" +
      "  gl_Position = u_MvpMatrix * a_Position;\n" +
      "  v_Color = a_Color;\n" +
      "}\n";

    // Fragment shader program
    var FSHADER_SOURCE =
      "#ifdef GL_ES\n" +
      "precision mediump float;\n" +
      "#endif\n" +
      "varying vec4 v_Color;\n" +
      "void main() {\n" +
      "  gl_FragColor = v_Color;\n" +
      "}\n";
    let canvas = document.getElementById("webgl");
    let gl = canvas.getContext("experimental-webgl");
    this.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    let n = this.initVertexBuffers(gl);

    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");

    let mvpMatrix = new Matrix4();

    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    
    gl.clearColor(0, 0, 0, 1);
    //开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);
    //同时清除颜色缓存和深度缓存
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  },
  methods: {
    initVertexBuffers(gl) {
      // Create a cube
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      var vertices = new Float32Array([
          // Vertex coordinates and color
          1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
          -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
          -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
          1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
          1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
          1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
          -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
          -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
      ]);

      //创建顶点索引
      var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        0, 3, 4,   0, 4, 5,    // right
        0, 5, 6,   0, 6, 1,    // up
        1, 6, 7,   1, 7, 2,    // left
        7, 4, 3,   7, 3, 2,    // down
        4, 7, 6,   4, 6, 5     // back
      ]);
      //创建顶点缓冲区
      let vertexSizeBuffer = gl.createBuffer();
      let indexBuffer = gl.createBuffer();
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
      var FSIZE = vertices.BYTES_PER_ELEMENT;
      // Assign the buffer object to a_Position and enable the assignment
      var a_Position = gl.getAttribLocation(gl.program, "a_Position");
      if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return -1;
      }
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
      gl.enableVertexAttribArray(a_Position);

      // Assign the buffer object to a_Color and enable the assignment
      var a_Color = gl.getAttribLocation(gl.program, "a_Color");
      if (a_Color < 0) {
        console.log("Failed to get the storage location of a_Color");
        return -1;
      }
      gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
      gl.enableVertexAttribArray(a_Color);

      // Unbind the buffer object
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      return indices.length;
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
