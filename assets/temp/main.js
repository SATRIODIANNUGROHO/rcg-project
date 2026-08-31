const {
    app,
    BrowserWindow,
    session,
    ipcMain
} = require("electron");

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const path = require("path");

let serialPort = null;
let parser = null;
let mainWindow = null;

function createWindow(){


    // ==========================
    // SPLASH SCREEN
    // ==========================

    const splash = new BrowserWindow({

        width:600,
        height:400,

        frame:false,

        resizable:false,

        alwaysOnTop:true,

        autoHideMenuBar:true,

        icon:path.join(__dirname,"RCG SWS.ico")

    });

    splash.loadFile("splash.html");



    // ==========================
    // MAIN WINDOW
    // ==========================

    const win = new BrowserWindow({

    width:1400,

    height:900,

    minWidth:1200,

    minHeight:700,

    show:false,

    autoHideMenuBar:true,

    icon:path.join(__dirname,"RCG SWS.ico"),

    webPreferences:{

        preload:path.join(__dirname,"preload.js"),

        contextIsolation:true,

        nodeIntegration:false

    }

});

    mainWindow = win;

    win.loadFile("index.html");

    win.webContents.on("zoom-changed",(event)=>{

    event.preventDefault();

});

win.webContents.session.on(
    "select-serial-port",
    (event, portList, webContents, callback) => {

        event.preventDefault();

        console.log(portList);

        if(portList.length > 0){

            callback(portList[0].portId);

        }else{

            callback("");

        }

    }
);

    // ==========================
    // DISABLE REFRESH
    // ==========================

    win.webContents.on("before-input-event",(event,input)=>{

        if(

            input.key==="F5" ||

            (input.control && input.key.toLowerCase()==="r")

        ){

            event.preventDefault();

        }

    });



    // ==========================
    // DISABLE ZOOM
    // ==========================

    win.webContents.setZoomFactor(1);

    if(win.webContents.setVisualZoomLevelLimits){
    win.webContents.setVisualZoomLevelLimits(1,1);
}


// ==========================
// TAMPILKAN APP SAAT SUDAH SIAP
// ==========================

win.webContents.once("did-finish-load",()=>{

    setTimeout(()=>{

        splash.close();

        win.show();

    },1200);
 
    });

}

app.whenReady().then(() => {

    session.defaultSession.setPermissionRequestHandler(
        (webContents, permission, callback) => {

            if (
                permission === "serial" ||
                permission === "serial-port"
            ) {
                callback(true);
            } else {
                callback(false);
            }

        }
    );

    session.defaultSession.setDevicePermissionHandler((details) => {
    return true;
});

session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === "serial") {
        return true;
    }
    return false;
});




    createWindow();

});

app.on("window-all-closed",()=>{

    if(process.platform!=="darwin"){

        app.quit();

    }

});

// ==========================
// PRINT NOTA - DIRECT PRINT
// ==========================
ipcMain.handle("print:nota", async (event, options = {}) => {

    if (!mainWindow || mainWindow.isDestroyed()) {
        return {
            success: false,
            message: "Window aplikasi tidak tersedia."
        };
    }

    // Ukuran kertas dalam MICRON
    // 1 mm = 1000 micron
    const paperSizes = {
        A6: {
            width: 105000,
            height: 148000
        },

        A5: {
            width: 148000,
            height: 210000
        },

        A4: {
            width: 210000,
            height: 297000
        }
    };

    const paperSize =
        String(options.paperSize || "A6").toUpperCase();

    const pageSize =
        paperSizes[paperSize] || paperSizes.A6;

    const copies = Math.max(
        1,
        Math.min(
            99,
            Number(options.copies) || 1
        )
    );

    try {

        // Tunggu sampai preview dan CSS selesai dirender
        await new Promise(resolve => {
            setTimeout(resolve, 300);
        });

        await new Promise((resolve, reject) => {

            mainWindow.webContents.print({

                // JANGAN silent.
                // User tetap bisa memilih printer:
                // printer biasa / Wondershare / Microsoft Print PDF
                silent: false,

                // Background nota tetap dicetak
                printBackground: true,

                // Nota portrait
                landscape: false,

                // Jangan lakukan scaling tambahan
                scaleFactor: 100,

                // Jumlah copy
                copies: copies,

                // UKURAN KERTAS SESUAI PREVIEW
                pageSize: {
                    width: pageSize.width,
                    height: pageSize.height
                },

                // Margin printer = 0
                // Margin nota sudah diatur dari aplikasi
                margins: {
                    marginType: "none"
                }

            }, (success, failureReason) => {

                if (!success) {

                    reject(
                        new Error(
                            failureReason ||
                            "Pencetakan dibatalkan atau gagal."
                        )
                    );

                    return;
                }

                resolve();
            });
        });

        return {
            success: true,
            paperSize: paperSize,
            copies: copies
        };

    } catch (err) {

        console.error(
            "PRINT NOTA ERROR:",
            err
        );

        return {
            success: false,
            message:
                err?.message ||
                "Gagal mencetak nota."
        };
    }

});


ipcMain.handle("serial:connect", async (event, portPath) => {

    try {


        // ==========================
        // TUTUP PORT LAMA
        // ==========================

        if (serialPort) {

            try {

                if (serialPort.isOpen) {

                    await new Promise((resolve) => {

                        serialPort.close(() => {


                            resolve();

                        });

                    });

                }

            } catch (err) {



            }

            serialPort = null;

        }


        // ==========================
        // BUFFER
        // ==========================

        


        // ==========================
        // BUAT SERIAL PORT
        // ==========================

        serialPort = new SerialPort({

            path: portPath,

            baudRate: 4800,

            dataBits: 8,

            parity: "none",

            stopBits: 1,

            autoOpen: false

        });


        // ==========================
        // EVENT OPEN
        // ==========================

        serialPort.on("open", () => {

            mainWindow.webContents.send(
                "serial-status",
                true
            );

        });


// ==========================
// EVENT DATA SERIAL
// ==========================

let serialBuffer = "";

serialPort.on("data", (chunk) => {

    // Tambahkan data ke buffer
    serialBuffer += chunk.toString("ascii");

    // ==========================
    // CARI FRAME STX ... ETX
    // STX = 0x02
    // ETX = 0x03
    // ==========================

    while (true) {

        const start = serialBuffer.indexOf("\x02");
        const end = serialBuffer.indexOf("\x03");

        // Belum ada frame lengkap
        if (start === -1 || end === -1 || end < start) {
            break;
        }

        // Ambil satu frame
        const frame = serialBuffer.substring(
            start,
            end + 1
        );

        // Hapus frame yang sudah diproses
        serialBuffer =
            serialBuffer.substring(end + 1);


        // Proses berat
        prosesBerat(frame);

    }

});


// ==========================
// FUNGSI PROSES BERAT
// ==========================

function prosesBerat(text) {



    // ==========================
    // BERSIHKAN STX / ETX
    // ==========================

    const clean = text
        .replace(/\x02/g, "")
        .replace(/\x03/g, "")
        .trim();

// ==========================
// KHUSUS FORMAT 90 KG
// ==========================

if (/^[+-]000090012$/.test(clean)) {

    const berat = 90;



    if (
        mainWindow &&
        !mainWindow.isDestroyed()
    ) {

        mainWindow.webContents.send(
            "weight",
            berat
        );

    }

    return;
}


// ==========================
// PARSE FORMAT TIMBANGAN
// ==========================
//
// Contoh data:
// +00141001F
//
// +        = tanda positif
// 00141001 = nilai berat
// F        = status/flag
//
// Nilai berat menggunakan
// 2 digit desimal implisit.
//
// 00141001 → 1410.01 Kg
// ==========================

const match = clean.match(
    /^([+-]?)(\d{8})[A-Za-z]$/
);

if (!match) {


    return;

}

const sign = match[1];
const rawWeight = match[2];



// Konversi:
// 00141001 → 1410.01
let berat = parseInt(rawWeight, 10) / 100;

if (sign === "-") {
    berat = -berat;
}




    // ==========================
    // KIRIM KE INDEX.HTML
    // ==========================

    if (
        mainWindow &&
        !mainWindow.isDestroyed()
    ) {

// Samakan resolusi dengan weighing terminal
berat = Math.round(berat);

    mainWindow.webContents.send(
        "weight",
        berat
    );

}

}

        // ==========================
        // EVENT ERROR
        // ==========================

        serialPort.on("error", (err) => {

            console.error(
                "================================="
            );

            console.error(
                "SERIAL ERROR"
            );

            console.error(
                err
            );

            console.error(
                "MESSAGE:",
                err.message
            );

            console.error(
                "================================="
            );


            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    "serial-error",
                    err.message
                );

            }

        });


        // ==========================
        // EVENT CLOSE
        // ==========================

        serialPort.on("close", () => {

            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    "serial-status",
                    false
                );

            }

        });

    
        // ==========================
        // BUKA PORT
        // ==========================

        await new Promise((resolve, reject) => {

            serialPort.open((err) => {

                if (err) {

                    reject(err);

                } else {

                    resolve();

                }

            });

        });
    

        // ==========================
        // BERHASIL
        // ==========================

        return {

            success: true,

            port: portPath,

            baudRate: 4800

        };

    
    } catch (err) {


        if (
            mainWindow &&
            !mainWindow.isDestroyed()
        ) {

            mainWindow.webContents.send(
                "serial-status",
                false
            );

            mainWindow.webContents.send(
                "serial-error",
                err.message
            );

        }


        return {

            success: false,

            message: err.message

        };

    }

});

ipcMain.handle("serial:disconnect", async () => {

    try{

        if(serialPort && serialPort.isOpen){

            await new Promise(resolve => serialPort.close(resolve));

        }

        serialPort = null;
        parser = null;

        mainWindow.webContents.send(
            "serial-status",
            false
        );

        return{

            success:true

        };

    }catch(err){

        return{

            success:false,
            message:err.message

        };

    }

});

ipcMain.handle("serial:list", async () => {

    const ports = await SerialPort.list();

    return ports.filter(port => {

        const text = JSON.stringify(port).toLowerCase();

        // Sembunyikan COM Bluetooth
        if(text.includes("bluetooth")) return false;
        if(text.includes("bthenum")) return false;

        return true;

    });

});
