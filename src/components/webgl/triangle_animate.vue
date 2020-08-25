<template>
  <canvas id="webgl" width="400" height="400"></canvas>
</template>

<script>
/* eslint-disable */
import Matrix4 from "../../assets/cuon-matrix";
export default {
  data() {
    return {
      currentAngle: 0,
      lastTime: Date.now(),
      gl: null,
      n: 0,
      modelMatrix: null,
    };
  },
  mounted() {
    //顶点着色器，gl_Position必须被赋值，否则着色器无法正常工作，PointSize不必须，默认为1
    var VSHADER_SOURCE =
      "attribute vec4 a_Position;\n" +
      "uniform mat4 u_ModelMatrix;\n" +
      "void main() {\n" +
      "  gl_Position = u_ModelMatrix * a_Position;\n" +
      "}\n";

    // 片元着色器，唯一内置变量gl_FragColor，控制像素在屏幕上的最终颜色
    var FSHADER_SOURCE =
      "void main() {\n" +
      "  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
      "}\n";
    let canvas = document.getElementById("webgl");
    this.gl = canvas.getContext("experimental-webgl");
    this.initShaders(this.gl, VSHADER_SOURCE, FSHADER_SOURCE);
    this.n = this.initVertexBuffers(this.gl);
    this.gl.clearColor(0, 0, 0, 1);
    this.modelMatrix = new Matrix4();
    this.tick();
  },
  methods: {
    tick() {
      let u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, "u_ModelMatrix");
      this.currentAngle = this.animate(this.currentAngle);
      this.draw(
        this.gl,
        this.n,
        this.currentAngle,
        this.modelMatrix,
        u_ModelMatrix
      );
      requestAnimationFrame(this.tick);
    },
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
      modelMatrix.setRotate(currentAngle, 0, 0, 1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, n);
    },
    animate(angle) {
      let now = Date.now();
      let elapsed = now - this.lastTime;
      let ANGLE_STEP = 15;
      this.lastTime = now;
      let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
      return (newAngle %= 360);
    },
    initVertexBuffers(gl) {
      //三角形
      let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
      //正方形
      //创建顶点缓冲区
      let vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
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
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      //向缓冲区写入数据
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      let a_Position = gl.getAttribLocation(gl.program, "a_Position");
      //将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      //连接a_Position变量与分配给它的缓冲区对象,开启attribute变量
      gl.enableVertexAttribArray(a_Position);
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
