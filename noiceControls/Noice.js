class PerlinNoise {
    constructor() {
        // No se precomputan gradientes, por lo que esto funciona para cualquier número de coordenadas de la cuadrícula
        this.w = 8 * 32; // Suponiendo que estamos trabajando con enteros sin signo de 32 bits
        this.s = this.w / 2; 
    }

    randomGradient(ix, iy) {
        let a = ix, b = iy;
        a *= 3284157443;
    
        b ^= (a << this.s) | (a >>> (this.w - this.s));
        b *= 1911520717;
    
        a ^= (b << this.s) | (b >>> (this.w - this.s));
        a *= 2048419325;
        const random = a * (Math.PI * 2 / (~0 >>> 1)); // en el rango [0, 2*Pi]
        
        // Crea un vector a partir del ángulo
        return { x: Math.sin(random), y: Math.cos(random) };
    }

    dotGridGradient(ix, iy, x, y) {
        // Obtiene el gradiente de las coordenadas enteras
        const gradient = this.randomGradient(ix, iy);
    
        // Calcula el vector de distancia
        const dx = x - ix;
        const dy = y - iy;
    
        // Calcula el producto punto
        return (dx * gradient.x + dy * gradient.y);
    }

    interpolate(a0, a1, w) {
        // Realiza una interpolación suave usando una función polinómica
        return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
    }

    perlin(x, y) {
        // Determina las coordenadas de las esquinas de la celda de la cuadrícula
        const x0 = Math.floor(x); 
        const y0 = Math.floor(y);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
    
        // Calcula los pesos de interpolación
        const sx = x - x0;
        const sy = y - y0;
        
        // Calcula e interpola las dos esquinas superiores
        let n0 = this.dotGridGradient(x0, y0, x, y);
        let n1 = this.dotGridGradient(x1, y0, x, y);
        let ix0 = this.interpolate(n0, n1, sx);
    
        // Calcula e interpola las dos esquinas inferiores
        n0 = this.dotGridGradient(x0, y1, x, y);
        n1 = this.dotGridGradient(x1, y1, x, y);
        let ix1 = this.interpolate(n0, n1, sx);
    
        // Paso final: interpola entre los dos valores previamente calculados, ahora en el eje y
        return this.interpolate(ix0, ix1, sy);
    }
}

export { PerlinNoise };
