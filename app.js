import {IfcAPI} from "web-ifc/web-ifc-api";
import ShortUniqueId from 'short-unique-id';
import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import {tmpdir} from 'node:os';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

viewer.grid.setGrid();
viewer.axes.setAxes();

const ifcFileLocation = "01.ifc"; // dont forget to modify for your ifc filename
let modelID = 0;
const ifcapi = new IfcAPI();

function getIfcFile(url) {
    return new Promise((resolve, reject) => {
        var oReq = new XMLHttpRequest();
        oReq.responseType = "arraybuffer";
        oReq.addEventListener("load", () => {
            resolve(new Uint8Array(oReq.response));
        });
        oReq.open("GET", url);
        oReq.send();
    });
}

ifcapi.Init().then(()=>{
    getIfcFile(ifcFileLocation).then((ifcData) => {
        modelID = ifcapi.OpenModel(ifcData);
        let isModelOpened = ifcapi.IsModelOpen(modelID);
        console.log({isModelOpened});
    
        const uid = new ShortUniqueId({length: 22});
        console.log(uid());
        console.log(tmpdir());
        
        loadIfc(ifcFileLocation);
        ifcapi.CloseModel(modelID);
    });
});

async function loadIfc(url) {
    await viewer.IFC.setWasmPath("./");
    const model = await viewer.IFC.loadIfcUrl(url);
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
}
