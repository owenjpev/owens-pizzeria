require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const { Pool } = require("pg");
const PgStore = require("connect-pg-simple")(session);

const fs = require("fs");
const path = require("path");
const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
    origin(origin, cb) {
        if (!origin || ALLOW_ORIGINS.includes(origin)) {
            return cb(null, true);
        }
        return cb(new Error("Not allowed by CORS!"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.options("*", cors({
    origin(origin, cb) {
        if (!origin || ALLOW_ORIGINS.includes(origin)) {
            return cb(null, true);
        }
        return cb(new Error("Not allowed by CORS!"));
    },
    credentials: true
}));


app.set("trust proxy", 1);

app.use(session({
    store: new PgStore({ pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000*60*60*24*30
    }
}));


app.use(cookieParser());
app.use(express.json());

const routesPath = path.join(__dirname, "routes");

function loadRoutes(app, folderPath, baseRoute = "/api") {
    const items = fs.readdirSync(folderPath);

    items.forEach(item => {
        const fullPath = path.join(folderPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const routePrefix = baseRoute + "/" + item;
            loadRoutes(app, fullPath, routePrefix);
            return;
        }

        if (item.endsWith(".js")) {
            const routeName = item === "index.js"
                ? ""
                : "/" + item.replace(".js", "");

            const route = require(fullPath);

            app.use(baseRoute + routeName, route);
        }
    });
}

loadRoutes(app, routesPath);

const port = process.env.PORT || 5000;

async function start() {
    if (process.env.NODE_ENV === "production") {
        const next = require("next");

        const clientDir = path.join(__dirname, "..", "client");
        const nextApp = next({ dev: false, dir: clientDir });
        const handle = nextApp.getRequestHandler();

        await nextApp.prepare();

        app.all("*", (req, res) => handle(req, res));
    }
    
    app.listen(port, () => console.log(`Server running on port ${port}!`));
}

start();