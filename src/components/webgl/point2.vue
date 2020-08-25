<template>
  <canvas id="webgl" width="400" height="400"></canvas>
</template>

<script>
/* eslint-disable */
export default {
  mounted() {
    //顶点着色器，gl_Position必须被赋值，否则着色器无法正常工作，PointSize不必须，默认为1
    var VSHADER_SOURCE =
      "attribute vec4 a_Position;\n" + // attribute variable
      "void main() {\n" +
      "  gl_Position = a_Position;\n" +
      "  gl_PointSize = 10.0;\n" +
      "}\n";

    // 片元着色器，唯一内置变量gl_FragColor，控制像素在屏幕上的最终颜色
    var FSHADER_SOURCE =
      "precision mediump float;\n" +
      "uniform vec4 u_FragColor;\n" + // uniform変数
      "void main() {\n" +
      "  gl_FragColor = u_FragColor;\n" +
      "}\n";
    let canvas = document.getElementById("webgl");
    let gl = canvas.getContext("experimental-webgl");
    this.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    /**
     * @description: 获取attribute变量地址,只能在初始化shader后再使用，因为shader才创建了程序对象
     * @param {program} 程序对象,包含顶点着色器和片元着色器
     * @param {name} 要获取其存储地址的attribute变量名称
     * @return {number} 大于等于0(存储地址),-1表示变量不存在或命名具有gl_或webgl_前缀
     */

    //
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
      console.log("Failed to get the storage location of a_Position");
      return;
    }
    //这个如果变量不存在返回null,和获取attribute返回值不一样
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    //这里attribute的类型是vec4类型，但是只传入了3个值，最后一个默认为1.0
    gl.vertexAttrib3f(a_Position, 0.0, 0.5, 0.0);
    canvas.addEventListener("mousedown", (e) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.vertexAttrib3f(
        a_Position,
        (e.offsetX - 200) / 200,
        -(e.offsetY - 200) / 200,
        0.0
      );
      let r = Math.random().toFixed(2);
      let g = Math.random().toFixed(2);
      let b = Math.random().toFixed(2);
      gl.uniform4f(u_FragColor, r, g, b, 1);
      gl.drawArrays(gl.POINTS, 0, 1);
    });
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * @description: 执行顶点着色器，执行count次
     * @param {mode} 指定绘制的方式，接收常量符号,如下面的gl.POINTS
     * @param {first} 指定从哪个顶点开始绘制(整型)
     * @param {count} 指定绘制多少个顶点(整型)
     * @return {null}
     */
    gl.drawArrays(gl.POINTS, 0, 1);
    //获取视口，指定在哪里绘制，四个参数是左上角和右下角坐标
    // gl.viewport(0,0,canvas.width,canvas.height);
    // //创建顶点缓冲区
    // let vertexBuffer = gl.createBuffer();
    // //缓冲区绑定到gl数组
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // let vertex = [ .5, .5, 0.0,
    //     -.5,.5, 0.0,
    //     .5, -.5, 0.0,
    //     -.5, -.5, 0.0]
    // //绑定位置数据到gl数组
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
    // //vertSize和nVerts分别定义了一个顶点中元素的个数和顶点的个数
    // let square = {bufffer: vertexBuffer, vertSize: 3, nVerts: 4, primtype: gl.TRIANGLE_TRIP};
  },
  methods: {
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
