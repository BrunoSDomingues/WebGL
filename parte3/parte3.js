// Script para renderizar a visão topográfica com a linha do estado de SP

// Importando arrays

import { pos_array, color_array, pto_ind_array, ctr_ind_array} from '../src/arrays.js';

var squareRotation = 0.0;

main();

// Início do Sistema WebGL
function main() {
    const canvas = document.querySelector('#glcanvas');
    // Initializa o context GL
    const gl = canvas.getContext('webgl');

    // Caso o navegador não suporte WebGL
    if (!gl) {
        alert(' Não foi possível iniciar o WebGL. Seu navegador não deve suportá-lo.');
        return;
    }

    // Defina a cor de limpeza para preto sem transparência
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Limpe o buffer de cores com a cor especificada
    gl.clear(gl.COLOR_BUFFER_BIT);


    // Vertex shader
    const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

    const fsSource = `
            varying lowp vec4 vColor;
            
            void main() {
                gl_FragColor = vColor;
            }
        `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };


    // Rotina para contruir todos os buffers
    const buffers = initBuffers(gl);

    var then = 0;

    // Desenha a cena continuamente
    function render(now) {
        now *= 0.001;  // converte o tempo para segundos
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

}

// Initializa os shaders
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Cria os shaders
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Se a criação dos shaders falhar, alerte o usuário
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Erro ao inicializar o shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}


// cria um shader para o código fonte fornecido.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Enviar o código fonte para o objeto do shader
    gl.shaderSource(shader, source);

    // Compila o shader
    gl.compileShader(shader);

    // Verifica se a compilação funcionou
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Um erro ocorreu ao compilar o shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffers(gl) {

    // Cria um buffer para as posições dos vértices do quadrado.
    const positionBuffer = gl.createBuffer();

    // Selecione o positionBuffer para aplicar as operações de buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Posições dos vértices do cubo.
    const positions = pos_array;

    // Passe a lista de posições para o WebGL
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    // Definindo uma cor para cada face do cubo
    const faceColors = color_array;

    // Convertendo o vetor de cores para uma matriz para todos os 24 vértices
    // var colors = [];

    // for (var j = 0; j < faceColors.length; ++j) {
    //     const c = faceColors[j];

    //     // Repita cada cor 4 vezes para os 4 vértices das faces do cubo
    //     colors = colors.concat(c, c, c, c);
    // }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faceColors), gl.STATIC_DRAW);

    // Contruindo vetor de elementos que especifica os indices dos vértices
    // para cada face do cubo
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Este vetor define cada face como dois triângulos, usando os
    // indices no vetor de vértices para especificar cada triângulo
    const indices = pto_ind_array;

    // Enviando os elementos para o vetor GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    // Cria um buffer para as posições dos vértices da linha de contorno.
    const linePositionBuffer = gl.createBuffer();

    // Selecione o linePositionBuffer para aplicar as operações de buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);

    // Posições dos vértices da linha com as devidas alturas.
    const linePositions = ctr_ind_array;

    // Passe a lista de posições para o WebGL
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(linePositions),
        gl.STATIC_DRAW);

    // Definindo uma cor para a linha
    const lineColors = new Array(79 * 4).fill(1.0);

    const lineColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColors), gl.STATIC_DRAW);

    // Contruindo vetor de elementos que especifica os indices dos vértices
    // para cada face do cubo
    const lineIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
    
    // Cria um array com os indices de cada sublinha
    const lineIndices = Array.from({length: 79}, (_, idx) => `${idx}`);

    // Enviando os elementos para o vetor GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(lineIndices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,

        linePosition: linePositionBuffer,
        lineColor: lineColorBuffer,
        lineIndices: lineIndexBuffer,
    };
}

function drawScene(gl, programInfo, buffers, deltaTime) {

    // Atualiza o valor da rotação
    squareRotation -= deltaTime;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // define cor para pintar de preto sem transparência
    gl.clearDepth(1.0);                 // Limpa o buffer de profundidade
    gl.enable(gl.DEPTH_TEST);           // Liga o teste de profundidade (Z-Buffer)

    // Pinta todo o canvas com a cor padrão (preto)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Cria uma matriz de perspectiva com um campo de visão de 45 graus,
    // com a proporção de largura/altura correspondente ao tamanho de
    // exibição da tela, com objetos visiveis entre 0.1 e 100 unidades
    // de distância da câmera.
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 300.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Define a posição do desenho para a identidade, que é
    // o centro da cena.
    const modelViewMatrix = mat4.create();

    // Move a posição do desenho para onde queremos
    // desenhar o quadrado.
    mat4.translate(modelViewMatrix,    // matriz de destino
        modelViewMatrix,    // matriz para transladar
        [0, 0, -100]);       // translação

    mat4.rotate(modelViewMatrix,  // matriz de destino
        modelViewMatrix,  // matriz para rotacionar
        -3.14 / 4,             // quantidade de radianos a se rotacionar * 0.7
        [1, 0, 0]);       // eixo para ser girar em volta

    mat4.rotate(modelViewMatrix,  // matriz de destino
        modelViewMatrix,  // matriz para rotacionar
        squareRotation * 0.5,             // quantidade de radianos a se rotacionar * 0.7
        [0, 0, 1]);       // eixo para ser girar em volta

    // Diga ao WebGL como retirar as posições do
    // atributo vertexPosition do buffer
    {
        const numComponents = 3;  // passa 3 valores por vez
        const type = gl.FLOAT;    // os dados no buffer são floats de 32bit
        const normalize = false;  // não normalize
        const stride = 0;         // quantos bytes de espaço de um conjunto de valores para o próximo
                                  // 0 = use o tipo e número de componentes acima
        const offset = 0;         // quantos bytes pular dentro do buffer para começar
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Diga ao WebGL como retirar as cores do buffer de cores
    // para colocar no atributo vertexColor.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Diga ao WebGL quais indices usar para conectar os vértices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Diga ao WebGL para usar nosso programa ao desenhar
    gl.useProgram(programInfo.program);

    // Defina os uniforms dos shaders
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = 6110 * 3;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }


    // Diga ao WebGL como retirar as posições do
    // atributo vertexPosition do buffer
    {
        const numComponents = 3;  // passa 3 valores por vez
        const type = gl.FLOAT;    // os dados no buffer são floats de 32bit
        const normalize = false;  // não normalize
        const stride = 0;         // quantos bytes de espaço de um conjunto de valores para o próximo
                                  // 0 = use o tipo e número de componentes acima
        const offset = 0;         // quantos bytes pular dentro do buffer para começar
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.linePosition);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Diga ao WebGL como retirar as cores do buffer de cores
    // para colocar no atributo vertexColor.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.lineColor);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Diga ao WebGL quais indices usar para conectar os vértices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.lineIndices);

    // Diga ao WebGL para usar nosso programa ao desenhar
    gl.useProgram(programInfo.program);

    // Defina os uniforms dos shaders
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = 79;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.LINE_STRIP, vertexCount, type, offset);
    }

}
