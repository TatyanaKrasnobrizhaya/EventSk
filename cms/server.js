import express from 'express';
import sessions from "express-session";
import nunjucks from 'nunjucks';
import FileStore from 'session-file-store';
import dotenv  from "dotenv";
import { flash } from "express-flash-message";
import cookieParser from 'cookie-parser';
import {initNunjucksEnv} from './service/TemplateEngine.js'

// import jednotlivych kontrolerov
import {IndexController} from "./controllers/IndexController.js";
import {UserController} from "./controllers/UserController.js";
import {PostController} from "./controllers/PostController.js";
import MemoryStore from "express-session/session/memory.js";


// doplnit ENV parametre zo suboru .env, kotore budem pouzivat ako konfiguracne paramere
dotenv.config();

// Inicializacia aplikacie
const app = express();

const eventsRouter = express.Router();

// schopnost parsovat JSON
app.use(express.json());

// schopnost parsovat formularove data
app.use(express.urlencoded({extended: true}));

// staticke subory (klientsky javascript, obrazky, favicon, ...) budu v adresari public
app.use(express.static('public'));

// konfiguracia session
app.use(sessions({
    name: "moje.session.id",
    secret: "tajne-heslo",
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // platnost cookie 1 den
        httpOnly: true,
        SameSite: 'None',
    },
    resave: false,
    //store:  new (FileStore(sessions))({ // ukladanie session dat do suboru (nefunguje dobre vo Windows)
    //     path: 'sessions'
    //}),
    store: new MemoryStore({  // ukladanie session dat do pamate (nevhodne pre produkcnu prevadzku)
        checkPeriod: 3600000
    }),
}));

// Pouzivanie flash sprav
app.use(flash());

// inicializovat template engine
let nunjucksEnv = initNunjucksEnv(app);

// podpora pre pracu s cookies
app.use(cookieParser());

// Definovanie controllerov vratane ich prefixov (/user/..., /post/...)
app.use("/", IndexController);
app.use("/user", UserController);
app.use("/post", PostController);


// spustenie servera
let server = app.listen(3000, () => console.log(`Server počúva na adrese http://localhost:${server.address().port}`));