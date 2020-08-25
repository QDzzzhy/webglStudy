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
      "uniform mat4 u_xformMatrix;\n" +
      "void main() {\n" +
      "  gl_Position = u_xformMatrix * a_Position;\n" +
      "}\n";

    // 片元着色器，唯一内置变量gl_FragColor，控制像素在屏幕上的最终颜色
    var FSHADER_SOURCE =
      "void main() {\n" +
      "  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
      "}\n";
    let canvas = document.getElementById("webgl");
    let gl = canvas.getContext("experimental-webgl");
    this.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    let n = this.initVertexBuffers(gl);
    //旋转
    // let ANGLE = 90;
    // let radian = (Math.PI * ANGLE) / 180.0; // 转换为弧度
    // let cosB = Math.cos(radian);
    // let sinB = Math.sin(radian);
    // let xformMatrix = new Float32Array([
    //   cosB, sinB, 0.0, 0.0,
    //   -sinB, cosB, 0.0, 0.0,
    //   0.0, 0.0, 1.0, 0.0,
    //   0.0, 0.0, 0.0, 1.0,
    // ]);
    //平移
    // let xformMatrix = new Float32Array([
    //   1.0, 0.0, 0.0, 0.0,
    //   0.0, 1.0, 0.0, 0.0,
    //   0.0, 0.0, 1.0, 0.0,
    //   0.3, 0.2, 0.0, 1.0,
    // ]);
    //缩放
    let xformMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.5, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0
      ,
      0.0, 0.0, 0.0, 1.0,
    ]);

    let u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    if (!u_xformMatrix) {
      console.log("Failed to get the storage location of u_CosB");
      return;
    }
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * @description: 执行顶点着色器，执行count次
     * @param {mode} 指定绘制的方式，接收常量符号,如下面的gl.POINTS
     * @param {first} 指定从哪个顶点开始绘制(整型)
     * @param {count} 指定绘制多少个顶点(整型)
     * @return {null}
     */
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  },
  methods: {
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
