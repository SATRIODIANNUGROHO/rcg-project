const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI",{

    // Ambil daftar COM Port
    listPorts:()=>ipcRenderer.invoke("serial:list"),

    // Connect ke COM
    connect:(port)=>
        ipcRenderer.invoke("serial:connect",port),

    // Disconnect
    disconnect:()=>
        ipcRenderer.invoke("serial:disconnect"),


    // Print nota dengan ukuran kertas yang dikontrol aplikasi
    printNota:(options)=>
    ipcRenderer.invoke("print:nota", options),

    // Event berat realtime
    onWeight:(callback)=>{

        ipcRenderer.on("weight",(event,data)=>{

            callback(data);

        });

    },

    // Event status serial
    onSerialStatus:(callback)=>{

        ipcRenderer.on("serial-status",(event,status)=>{

            callback(status);

        });

    }

});