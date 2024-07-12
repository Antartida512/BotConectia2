require('dotenv').config();

const { createBot, createProvider, createFlow, addKeyword, EVENTS, addAnswer } = require('@bot-whatsapp/bot');
const openaiApiKey = process.env.OPENAI_API_KEY;
const mongoDbUri = process.env.MONGO_DB_URI;

console.log('OpenAI API Key:', openaiApiKey);
console.log('MongoDB URI:', mongoDbUri);

const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MongoAdapter = require("@bot-whatsapp/database/mongo");
const path = require("path");
const fs = require("fs");

const menuPath = path.join(__dirname, 'mensajes', 'menu.txt');
const menu = fs.readFileSync(menuPath, "utf8");
const infoPatch = path.join(__dirname, 'mensajes', 'info.txt');
const info = fs.readFileSync(infoPatch, "utf8");
const financiamientoPath = path.join(__dirname, 'mensajes', 'financiamiento.txt');
const financiamiento = fs.readFileSync(financiamientoPath, "utf8");
const amenetiesPath = path.join(__dirname, 'mensajes', 'ameneties.txt');
const ameneties = fs.readFileSync(amenetiesPath, "utf8");
const uaePath = path.join(__dirname, 'mensajes', 'uae.txt');
const uae = fs.readFileSync(uaePath, "utf8");

// MENU

const menuFlow = addKeyword("Menu").addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "5", "6", "7", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no válida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowInfo);
            case "2":
                return gotoFlow(flowPreciosyfinanciamiento);
            case "3":
                return gotoFlow(flowAmeneties);
            case "4":
                return gotoFlow(flowBrochure);
            case "5":
                return gotoFlow(flowTipologias);
            case "6":
                return gotoFlow(flowUae);
            case "7":
                return gotoFlow(flowReservar);
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo '*Menu*'"
                );
        }
    }
);

const flowInfo = addKeyword(EVENTS.ACTION)
    .addAnswer('Seleccionaste "Información General". A continuación te brindo los detalles:')
    .addAnswer(info)
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowPreciosyfinanciamiento = addKeyword(EVENTS.ACTION)
    .addAnswer('Seleccionaste  *Precios y Financiamientos*. A continuación te brindo más detalles:')
    .addAnswer(financiamiento)
    .addAnswer("Te envío los valores de los departamentos disponibles", {
        media: "https://i.ibb.co/Czr5s0h/Whats-App-Image-2024-06-25-at-11-47-10.jpg"
    })
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowAmeneties = addKeyword(EVENTS.ACTION)
    .addAnswer('Seleccionaste *Amenities*. A continuación te brindo mas detalles')
    .addAnswer(ameneties)
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowBrochure = addKeyword(EVENTS.ACTION)
    .addAnswer('Seleccionaste *Brochure* A continuación te brindo mas detalles', {
        media: "https://conectiaba.com.ar/wp-content/uploads/2024/04/Brochure-conectia-WEB_compressed.pdf"
    })
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowTipologias = addKeyword(EVENTS.ACTION)
    .addAnswer('Seleccionaste *Tipologías* A continuacion te brindo mas detalles')
    .addAnswer('Te envío las tipologías de los departamentos disponibles')
    .addAnswer("Monoambiente 53m2 Totales", {
        media: "https://i.ibb.co/7G9BXJ0/Tipologia-1-ambiente-53m2.jpg"
    })
    .addAnswer('2 Ambientes 53m2 Totales', {
        media: "https://i.ibb.co/QHJSNZq/Tipolog-as-2-ambientes-53m2.jpg"
    })
    .addAnswer('2 Ambientes 62m2 Totales', {
        media: "https://i.ibb.co/7SLmBHD/Tipolog-a-2-ambientes-62m2.jpg"
    })
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowUae = addKeyword(EVENTS.ACTION)
    .addAnswer("Seleccionaste Accesibilidad y Entorno*. A continuación te brindo mas detalles")
    .addAnswer(uae)
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowReservar = addKeyword(EVENTS.ACTION)
    .addAnswer('Muchas gracias en breve un asesor se comunicara con usted')
    .addAnswer("Escriba *MENU* para volver a ver las opciones");

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer('🙌*Hola mi nombre es Juana, soy la asistente virtual de Conectia estoy aca para brindarte la mejor atención*')
    .addAnswer('Por favor ¿nos podrías compartir tu correo electrónico?', {
        delay: 3000,
    })
    .addAnswer('Escribí *Menu* para avanzar', {
        delay: 3000,
    });

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: "BaseTest"
    });

    const adapterFlow = createFlow([
        flowWelcome,
        menuFlow,
        flowReservar,
        flowBrochure,
        flowInfo,
        flowPreciosyfinanciamiento,
        flowUae,
        flowAmeneties,
        flowTipologias
    ]);

    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
}

main();
