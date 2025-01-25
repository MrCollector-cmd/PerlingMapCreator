import { PerlinNoise } from "./noiceControls/Noice.js";

// Inicializa el generador de ruido Perlin
const perlinNoise = new PerlinNoise();
const canvas = document.getElementById('perlingMap');
const ctx = canvas.getContext('2d');

let scale = 200;
let frequency = 2;
let amplitude = 4;
let steps = 12;
let pixelSize = 5; // Tamaño inicial del píxel

let waterDepth = 2;   // Profundidad del agua
let landDepth = 5;    // Profundidad de la tierra
let grassDepth = 8;   // Profundidad del césped

const updateCanvasSize = () => {
    canvas.width = window.innerWidth * 0.75; // Ajustar tamaño del canvas
    canvas.height = window.innerHeight;
};

// Interpolación de color optimizada para mejorar el rendimiento
const interpolateColor = (color1, color2, factor) => {
    return {
        r: color1.r + (color2.r - color1.r) * factor,
        g: color1.g + (color2.g - color1.g) * factor,
        b: color1.b + (color2.b - color1.b) * factor
    };
};

const generatePerlinValue = (x, y) => {
    let value = 0;
    let freq = frequency;
    let amp = amplitude;

    // Generación del ruido Perlin
    for (let i = 0; i < steps; i++) {
        value += perlinNoise.perlin(x * freq / scale, y * freq / scale) * amp;
        freq *= 2;
        amp /= 2;
    }

    return Math.max(-1, Math.min(1, value * 1.2)); // Ajuste de rango
};

const drawPerlinMap = () => {
    const width = canvas.width;
    const height = canvas.height;

    // Borrar el canvas
    ctx.clearRect(0, 0, width, height);

    for (let x = 0; x < width; x += pixelSize) {
        for (let y = 0; y < height; y += pixelSize) {
            let value = generatePerlinValue(x, y);
            const normalized = (value + 1) * 0.5;

            let color;
            if (normalized < 0.33) {
                // Zona de agua
                const waterBaseColor = { r: 0, g: 0, b: 255 }; // Azul
                const waterFactor = waterDepth * normalized;
                color = interpolateColor(waterBaseColor, { r: 0, g: 0, b: 128 }, waterFactor);
            } else if (normalized < 0.66) {
                // Zona de tierra
                const landBaseColor = { r: 139, g: 69, b: 19 }; // Marrón
                const landFactor = landDepth * (normalized - 0.33) / 0.33;
                color = interpolateColor(landBaseColor, { r: 255, g: 215, b: 0 }, landFactor);
            } else {
                // Zona de césped
                const grassBaseColor = { r: 34, g: 139, b: 34 }; // Verde
                const grassFactor = grassDepth * (normalized - 0.66) / 0.34;
                color = interpolateColor(grassBaseColor, { r: 0, g: 128, b: 0 }, grassFactor);
            }

            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
};

// Listeners para controles, se actualiza en tiempo real
document.getElementById('rangeScale').addEventListener('input', (e) => {
    scale = parseInt(e.target.value, 10);
    drawPerlinMap();
});

document.getElementById('rangeFrequency').addEventListener('input', (e) => {
    frequency = parseFloat(e.target.value);
    drawPerlinMap();
});

document.getElementById('rangeAmplitude').addEventListener('input', (e) => {
    amplitude = parseFloat(e.target.value);
    drawPerlinMap();
});

document.getElementById('rangeSteps').addEventListener('input', (e) => {
    steps = parseInt(e.target.value, 10);
    drawPerlinMap();
});

document.getElementById('rangePixelSize').addEventListener('input', (e) => {
    pixelSize = parseInt(e.target.value, 10);
    drawPerlinMap();
});

// Nuevos listeners de profundidad
document.getElementById('rangeWaterDepth').addEventListener('input', (e) => {
    waterDepth = parseFloat(e.target.value);
    drawPerlinMap();
});

document.getElementById('rangeLandDepth').addEventListener('input', (e) => {
    landDepth = parseFloat(e.target.value);
    drawPerlinMap();
});

document.getElementById('rangeGrassDepth').addEventListener('input', (e) => {
    grassDepth = parseFloat(e.target.value);
    drawPerlinMap();
});

document.getElementById('generateJson').addEventListener('click', () => {
    const mapName = document.getElementById('mapName').value.trim();
    if (!mapName) {
        alert('Por favor, introduce un nombre para el mapa.');
        return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const mapData = [];

    // Calcular las dimensiones
    const dimensions = {
        x: Math.floor(width / pixelSize),
        y: Math.floor(height / pixelSize)
    };

    // Crear el objeto JSON con las dimensiones y los datos
    const jsonMap = {
        name: mapName,
        dimensions: dimensions,
        data: []
    };

    // Generación de los datos del mapa
    for (let x = 0; x < width; x += pixelSize) {
        for (let y = 0; y < height; y += pixelSize) {
            let value = generatePerlinValue(x, y);
            const normalized = (value + 1) * 0.5;

            let color, z;
            if (normalized < 0.33) {
                const waterBaseColor = { r: 0, g: 0, b: 255 };
                const waterFactor = waterDepth * normalized;
                color = interpolateColor(waterBaseColor, { r: 0, g: 0, b: 128 }, waterFactor);
                z = waterFactor; // Altura
            } else if (normalized < 0.66) {
                const landBaseColor = { r: 139, g: 69, b: 19 };
                const landFactor = landDepth * (normalized - 0.33) / 0.33;
                color = interpolateColor(landBaseColor, { r: 255, g: 215, b: 0 }, landFactor);
                z = landFactor;
            } else {
                const grassBaseColor = { r: 34, g: 139, b: 34 };
                const grassFactor = grassDepth * (normalized - 0.66) / 0.34;
                color = interpolateColor(grassBaseColor, { r: 0, g: 128, b: 0 }, grassFactor);
                z = grassFactor;
            }

            jsonMap.data.push({
                x: x / pixelSize,
                y: y / pixelSize,
                z: z.toFixed(2),
                rgb: `rgb(${color.r}, ${color.g}, ${color.b})`
            });
        }
    }

    // Convertir a JSON y descargar
    const json = JSON.stringify(jsonMap, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${mapName}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
});

document.getElementById('generateImage').addEventListener('click', () => {
    const mapName = document.getElementById('mapName').value.trim();
    if (!mapName) {
        alert('Por favor, introduce un nombre para el mapa.');
        return;
    }

    const imageSize = parseInt(document.getElementById('imageSize').value, 10);
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = imageSize;
    tempCanvas.height = imageSize;

    for (let x = 0; x < imageSize; x += pixelSize) {
        for (let y = 0; y < imageSize; y += pixelSize) {
            let value = generatePerlinValue(x, y);
            const normalized = (value + 1) * 0.5;
            let color;
            if (normalized < 0.33) {
                const waterBaseColor = { r: 0, g: 0, b: 255 };
                const waterFactor = waterDepth * normalized;
                color = interpolateColor(waterBaseColor, { r: 0, g: 0, b: 128 }, waterFactor);
            } else if (normalized < 0.66) {
                const landBaseColor = { r: 139, g: 69, b: 19 };
                const landFactor = landDepth * (normalized - 0.33) / 0.33;
                color = interpolateColor(landBaseColor, { r: 255, g: 215, b: 0 }, landFactor);
            } else {
                const grassBaseColor = { r: 34, g: 139, b: 34 };
                const grassFactor = grassDepth * (normalized - 0.66) / 0.34;
                color = interpolateColor(grassBaseColor, { r: 0, g: 128, b: 0 }, grassFactor);
            }

            tempCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            tempCtx.fillRect(x, y, pixelSize, pixelSize);
        }
    }

    const imageUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${mapName}.png`;
    link.click();
});

updateCanvasSize();
drawPerlinMap();
