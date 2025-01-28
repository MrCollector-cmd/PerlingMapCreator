const settingsMap = {
    scale: 200,
    frequency: 2,
    amplitude: 4,
    steps: 12,
    pixelSize: 5,
    waterDepth: 2,
    landDepth: 5,
    grassDepth: 8,
    generatePerlinValue: function (x, y, perlinNoise) {
        let value = 0;
        let freq = settingsMap.frequency;
        let amp = settingsMap.amplitude;

        // Generación del ruido Perlin con mayor eficiencia
        for (let i = 0; i < settingsMap.steps; i++) {
            value += perlinNoise.perlin(x * freq / settingsMap.scale, y * freq / settingsMap.scale) * amp;
            freq *= 2;
            amp /= 2;
        }

        return Math.max(-1, Math.min(1, value * 1.2)); // Ajuste de rango
    },

    interpolateColor: function (color1, color2, factor) {
        return {
            r: color1.r + (color2.r - color1.r) * factor,
            g: color1.g + (color2.g - color1.g) * factor,
            b: color1.b + (color2.b - color1.b) * factor
        }
    },

    drawPerlinMap: function (width, height, obgPerling, mode = { id: 'draw' }) {
        const data = [];
    
        // Crear un OffscreenCanvas para el renderizado
        const offscreenCanvas = new OffscreenCanvas(width, height);
        const ctx = offscreenCanvas.getContext('2d');
    
        const blockWidth = Math.ceil(width / 3); // Dividir el canvas en 3 bloques (mejor rendimiento)
        
        // Renderizar por bloques de manera eficiente
        for (let block = 0; block < 3; block++) {
            const startX = block * blockWidth;
            const endX = (block + 1) * blockWidth;
    
            // Dibuja solo las partes visibles de cada bloque
            for (let x = startX; x < endX; x += settingsMap.pixelSize) {
                for (let y = 0; y < height; y += settingsMap.pixelSize) {
                    let value = settingsMap.generatePerlinValue(x, y, obgPerling);
                    const normalized = (value + 1) * 0.5;
    
                    let color, z;
                    if (normalized < 0.33) {
                        // Zona de agua con mayor profundidad
                        const waterBaseColor = { r: 0, g: 0, b: 255 }; // Azul
                        const waterFactor = settingsMap.waterDepth * normalized * 2; // Doble profundidad para mayor intensidad
                        color = settingsMap.interpolateColor(waterBaseColor, { r: 0, g: 0, b: 128 }, waterFactor);
                        z = waterFactor;
                    } else if (normalized < 0.66) {
                        // Zona de tierra
                        const landBaseColor = { r: 139, g: 69, b: 19 }; // Marrón
                        const landFactor = settingsMap.landDepth * (normalized - 0.33) / 0.33;
                        color = settingsMap.interpolateColor(landBaseColor, { r: 255, g: 215, b: 0 }, landFactor);
                        z = landFactor;
                    } else {
                        // Zona de césped
                        const grassBaseColor = { r: 34, g: 139, b: 34 }; // Verde
                        const grassFactor = settingsMap.grassDepth * (normalized - 0.66) / 0.34;
                        color = settingsMap.interpolateColor(grassBaseColor, { r: 0, g: 128, b: 0 }, grassFactor);
                        z = grassFactor;
                    }
    
                    // Solo realizar el dibujo si estamos en el modo correcto
                    if (mode.id === "draw" || mode.ctx !== undefined) {
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillRect(x, y, settingsMap.pixelSize, settingsMap.pixelSize);
                    } else if (mode.id === "extract") {
                        data.push({
                            x: x / settingsMap.pixelSize,
                            y: y / settingsMap.pixelSize,
                            z: z.toFixed(2),
                            rgb: `rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`
                        });
                    }
                }
            }
        }
    
        // Transferir la imagen del OffscreenCanvas al canvas visible si estamos en modo "draw"
        if (mode.id === "draw") {
            mode.ctx.drawImage(offscreenCanvas, 0, 0);
        }
    
        return data;
    }
}

export { settingsMap };
