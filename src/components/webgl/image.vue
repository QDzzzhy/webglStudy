<template>
  <canvas id="webgl" width="400" height="400"></canvas>
</template>

<script>
/* eslint-disable */
export default {
  data() {
    return {
      g_texUnit0: false,
      g_texUnit1: false,
    };
  },
  mounted() {
    //顶点着色器，gl_Position必须被赋值，否则着色器无法正常工作，PointSize不必须，默认为1
    var VSHADER_SOURCE =
      "attribute vec4 a_Position;\n" +
      "attribute vec2 a_TexCoord;\n" +
      "varying vec2 v_TexCoord;\n" +
      "void main() {\n" +
      "  gl_Position = a_Position;\n" +
      "  v_TexCoord = a_TexCoord;\n" +
      "}\n";

    // Fragment shader program
    var FSHADER_SOURCE =
      "#ifdef GL_ES\n" +
      "precision mediump float;\n" +
      "#endif\n" +
      "uniform sampler2D u_Sampler0;\n" +
      "uniform sampler2D u_Sampler1;\n" +
      "varying vec2 v_TexCoord;\n" +
      "void main() {\n" +
      "  vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n" +
      "  vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n" +
      "  gl_FragColor = color0 * color1;\n" +
      "}\n";
    let canvas = document.getElementById("webgl");
    let gl = canvas.getContext("experimental-webgl");
    this.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    let n = this.initVertexBuffers(gl);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.initTextures(gl, n);
  },
  methods: {
    initVertexBuffers(gl) {
      let vertices = new Float32Array([
        -0.5,
        0.5,
        0.0,
        1.0,
        -0.5,
        -0.5,
        0.0,
        0.0,
        0.5,
        0.5,
        1.0,
        1.0,
        0.5,
        -0.5,
        1.0,
        0.0,
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
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
      gl.enableVertexAttribArray(a_Position);
      let a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
      //将缓冲区对象分配给a_Position变量
      gl.vertexAttribPointer(
        a_TexCoord,
        2,
        gl.FLOAT,
        false,
        FSIZE * 4,
        FSIZE * 2
      );
      //连接a_Position变量与分配给它的缓冲区对象,开启attribute变量
      gl.enableVertexAttribArray(a_TexCoord);
      return 4;
    },

    initTextures(gl, n) {
      //创建纹理对象
      var texture0 = gl.createTexture();
      var texture1 = gl.createTexture();

      // Get the storage location of u_Sampler
      var u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
      var u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
      var image1 = new Image(); // Create the image object
      var image2 = new Image(); // Create the image object
      // Register the event handler to be called on loading an image
      image1.onload = () => {
        this.loadTexture(gl, n, texture0, u_Sampler0, image1, 0);
      };
      image1.src = "/sky_cloud.jpg";
      image2.onload = () => {
        this.loadTexture(gl, n, texture1, u_Sampler1, image2, 1);
      };
      image2.src = "/circle.gif";
      // image.src = '/sprites/sprite@2x.png';
      return true;
    },

    loadTexture(gl, n, texture, u_Sampler, image, textunit) {
      //对纹理图像将那些y轴翻转。因为图片是y轴向下的，而纹理坐标是y轴向上，因此需要反转
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      if (textunit == 0) {
        // 开启0号纹理单元。纹理单元至少8个，每个管理一个图像
        gl.activeTexture(gl.TEXTURE0);
        this.g_texUnit0 = true;
      } else {
        gl.activeTexture(gl.TEXTURE1);
        this.g_texUnit1 = true;
      }
      // 绑定纹理对象。类似于缓冲区，包含二维和立方体纹理
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // 配置纹理参数
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // 配置纹理图像
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

      // 将0号纹理传递给片元着色器中的取样器变量
      gl.uniform1i(u_Sampler, textunit);

      gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

      if (this.g_texUnit0 && this.g_texUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
      }
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
