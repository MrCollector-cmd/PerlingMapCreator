import { settingsMap } from "./settingsMap.js"
const generatorJSON = {
    width:null,
    height:null,
    mapData:[],
    nameMap:null,
    dimensions:null,
    getDimensions:function(){
        generatorJSON.dimensions = {
            width: Math.floor(generatorJSON.width / settingsMap.pixelSize),
            height: Math.floor(generatorJSON.height / settingsMap.pixelSize)
        }
    },
    startingTransformData:function(objPerling){
        generatorJSON.mapData = settingsMap.drawPerlinMap(generatorJSON.width,generatorJSON.height,objPerling,{id:"extract"})
        console.log(generatorJSON.dimensions,generatorJSON.nameMap)
        // Convertir a JSON y descargar
        if (generatorJSON.dimensions == null || generatorJSON.mapData == null || generatorJSON.nameMap == null) {
            console.warn('Faltan datos para la creacion del archivo JSON')
            return
        }
        const jsonMap ={
            name:settingsMap.nameMap,
            dimensions: generatorJSON.dimensions,
            mapData: generatorJSON.mapData
        }
        const json = JSON.stringify(jsonMap, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${generatorJSON.nameMap}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

}
export { generatorJSON }