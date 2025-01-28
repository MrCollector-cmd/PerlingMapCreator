import { PerlinNoise } from "./noiceControls/Noice.js";
import { generatorJSON } from "./tools/generatorJSON.js";
import { settingsMap } from "./tools/settingsMap.js";

const perlinNoise = new PerlinNoise();
const canvas = document.getElementById('perlingMap');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.75;
canvas.height = window.innerHeight;

// Ajusta el tamaño del canvas
const updateCanvasSize = () => {
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight;
};

// Validación y ajuste dinámico de valores
const validateAndAdjustSettings = () => {
    const defaults = {
        scale: 200,
        frequency: 2,
        amplitude: 4,
        steps: 12,
        pixelSize: 5,
        waterDepth: 2,
        landDepth: 5,
        grassDepth: 8,
    };

    // Lista de claves que se espera que sean valores numéricos
    const numericKeys = ['scale', 'frequency', 'amplitude', 'steps', 'pixelSize', 'waterDepth', 'landDepth', 'grassDepth'];

    Object.entries(settingsMap).forEach(([key, value]) => {
        if (numericKeys.includes(key)) {
            if (typeof value !== 'number' || value < 0 || isNaN(value)) {
                console.warn(`Invalid value for ${key}. Resetting to default.`);
                settingsMap[key] = defaults[key];
            }
        }
    });

    // Recalibración para evitar valores conflictivos
    if (settingsMap.waterDepth >= settingsMap.landDepth) {
        console.warn(`Water depth (${settingsMap.waterDepth}) cannot exceed or match land depth (${settingsMap.landDepth}). Adjusting.`);
        settingsMap.waterDepth = Math.max(0, settingsMap.landDepth - 1);
    }
    if (settingsMap.landDepth >= settingsMap.grassDepth) {
        console.warn(`Land depth (${settingsMap.landDepth}) cannot exceed or match grass depth (${settingsMap.grassDepth}). Adjusting.`);
        settingsMap.landDepth = Math.max(0, settingsMap.grassDepth - 1);
    }
};

// Mapeo de controles a las propiedades de settingsMap
const controlsMapping = {
    rangeScale: "scale",
    rangeFrequency: "frequency",
    rangeAmplitude: "amplitude",
    rangeSteps: "steps",
    rangePixelSize: "pixelSize",
    rangeWaterDepth: "waterDepth",
    rangeLandDepth: "landDepth",
    rangeGrassDepth: "grassDepth",
};

// Configura eventos para los controles
const setupControls = () => {
    Object.entries(controlsMapping).forEach(([controlId, property]) => {
        const control = document.getElementById(controlId);
        if (control) {
            control.addEventListener("input", (e) => {
                const value = parseFloat(e.target.value);
                settingsMap[property] = value;
                validateAndAdjustSettings();
                drawPerlinMap();
            });
        }
    });

    // Botón para generar JSON
    const generateButton = document.getElementById("generateJson");
    if (generateButton) {
        generateButton.addEventListener("click", () => {
            const mapName = document.getElementById("mapName").value.trim();
            if (!mapName) {
                alert("Por favor, introduce un nombre para el mapa.");
                return;
            }
            generatorJSON.height = canvas.height;
            generatorJSON.width = canvas.width;
            generatorJSON.nameMap = mapName;
            generatorJSON.getDimensions();
            generatorJSON.startingTransformData(perlinNoise);
        });
    }
};

// Dibuja el mapa de Perlin usando settingsMap
const drawPerlinMap = () => {
    validateAndAdjustSettings();
    console.log(typeof settingsMap.drawPerlinMap == "function")
    settingsMap.drawPerlinMap(canvas.width, canvas.height, perlinNoise, { id: "draw", ctx:ctx });
};

// Inicialización
updateCanvasSize();
setupControls();
drawPerlinMap();

// document.getElementById('generateImage').addEventListener('click', () => {
//     const mapName = document.getElementById('mapName').value.trim();
//     if (!mapName) {
//         alert('Por favor, introduce un nombre para el mapa.');
//         return;
//     }

//     const imageSize = parseInt(document.getElementById('imageSize').value, 10);
//     const tempCanvas = document.createElement('canvas');
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCanvas.width = imageSize;
//     tempCanvas.height = imageSize;

//     for (let x = 0; x < imageSize; x += pixelSize) {
//         for (let y = 0; y < imageSize; y += pixelSize) {
//             let value = generatePerlinValue(x, y);
//             const normalized = (value + 1) * 0.5;
//             let color;
//             if (normalized < 0.33) {
//                 const waterBaseColor = { r: 0, g: 0, b: 255 };
//                 const waterFactor = waterDepth * normalized;
//                 color = interpolateColor(waterBaseColor, { r: 0, g: 0, b: 128 }, waterFactor);
//             } else if (normalized < 0.66) {
//                 const landBaseColor = { r: 139, g: 69, b: 19 };
//                 const landFactor = landDepth * (normalized - 0.33) / 0.33;
//                 color = interpolateColor(landBaseColor, { r: 255, g: 215, b: 0 }, landFactor);
//             } else {
//                 const grassBaseColor = { r: 34, g: 139, b: 34 };
//                 const grassFactor = grassDepth * (normalized - 0.66) / 0.34;
//                 color = interpolateColor(grassBaseColor, { r: 0, g: 128, b: 0 }, grassFactor);
//             }

//             tempCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
//             tempCtx.fillRect(x, y, pixelSize, pixelSize);
//         }
//     }

//     const imageUrl = tempCanvas.toDataURL('image/png');
//     const link = document.createElement('a');
//     link.href = imageUrl;
//     link.download = `${mapName}.png`;
//     link.click();
// });
