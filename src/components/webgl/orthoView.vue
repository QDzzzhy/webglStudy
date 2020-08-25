<template>
  <div>
    <canvas id="webgl" width="400" height="400"></canvas>
    <p id="nearFar" v-html="text"></p>
  </div>
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
      near: 0.0,
      far: 0.5,
      text: "newrwarjowaji",
    };
  },
  mounted() {
    //顶点着色器，gl_Position必须被赋值，否则着色器无法正常工作，PointSize不必须，默认为1
    var VSHADER_SOURCE =
      "attribute vec4 a_Position;\n" +
      "attribute vec4 a_Color;\n" +
      "uniform mat4 u_ViewMatrix;\n" + //视点矩阵
      "varying vec4 v_Color;\n" +
      "void main() {\n" +
      "  gl_Position = u_ViewMatrix * a_Position;\n" +
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
    // let p = document.getElementById("nearFar");
    let gl = canvas.getContext("experimental-webgl");
    this.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    let n = this.initVertexBuffers(gl);
    gl.clearColor(0, 0, 0, 1);
    //设置视点
    var u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");

    let viewMatrix = new Matrix4();
    document.onkeydown = (e) => {
      this.keyDown(e, gl, n, u_ViewMatrix, viewMatrix);
    };
    // viewMatrix.setLookAt(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    //合并设置
    this.draw(gl, n, u_ViewMatrix, viewMatrix);
  },
  methods: {
    keyDown(e, gl, n, u_ViewMatrix, viewMatrix) {
      switch (e.keyCode) {
        case 39:
          this.near += 0.01;
          break;
        case 38:
          this.far += 0.01;
          break;
        case 37:
          this.near -= 0.01;
          break;
        case 40:
          this.far -= 0.01;
          break;
        default:
          return;
      }
      this.draw(gl, n, u_ViewMatrix, viewMatrix);
    },
    draw(gl, n, u_ViewMatrix, viewMatrix) {
      viewMatrix.setOrtho(-1, 1, -1, 1, this.near, this.far);
      gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.text = `near: ${Math.round(this.near * 100) / 100} far: ${
        Math.round(this.far * 100) / 100
      }`;
      gl.drawArrays(gl.TRIANGLES, 0, n);
    },
    initVertexBuffers(gl) {
      let vertices = new Float32Array([
        0.0,
        0.6,
        -0.4,
        0.4,
        1.0,
        0.4, // The back green one
        -0.5,
        -0.4,
        -0.4,
        0.4,
        1.0,
        0.4,
        0.5,
        -0.4,
        -0.4,
        1.0,
        0.4,
        0.4,

        0.5,
        0.4,
        -0.2,
        1.0,
        0.4,
        0.4, // The middle yellow one
        -0.5,
        0.4,
        -0.2,
        1.0,
        1.0,
        0.4,
        0.0,
        -0.6,
        -0.2,
        1.0,
        1.0,
        0.4,

        0.0,
        0.5,
        0.0,
        0.4,
        0.4,
        1.0, // The front blue one
        -0.5,
        -0.5,
        0.0,
        0.4,
        0.4,
        1.0,
        0.5,
        -0.5,
        0.0,
        1.0,
        0.4,
        0.4,
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
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return 9;
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
