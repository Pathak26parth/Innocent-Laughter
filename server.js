const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const connectMongo = require("./src/config/db");
const seedGlimpses = require("./src/config/seedGlimpses");
const bookingsRouter = require("./src/routes/bookings");
const transactionsRouter = require("./src/routes/transactions");
const reviewsRouter = require("./src/routes/reviews");
const glimpsesRouter = require("./src/routes/glimpses");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

const adminAuth = (req, res, next) => {
    const authorizationHeader = req.headers.authorization || "";

    if (authorizationHeader.startsWith("Basic ")) {
        const credentials = Buffer.from(authorizationHeader.slice(6), "base64").toString("utf8");
        const separatorIndex = credentials.indexOf(":");

        if (separatorIndex !== -1) {
            const providedUsername = credentials.slice(0, separatorIndex);
            const providedPassword = credentials.slice(separatorIndex + 1);

            if (providedUsername === adminUsername && providedPassword === adminPassword) {
                next();
                return;
            }
        }
    }

    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area", charset="UTF-8"');
    res.status(401).send("Authentication required.");
};

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
    res.status(200).json({ ok: true, message: "Backend is running." });
});

app.use("/api/bookings", bookingsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/glimpses", glimpsesRouter);

app.get("/admin", adminAuth, (req, res) => {
    res.sendFile(path.resolve(__dirname, "admin.html"));
});

app.get("/admin.html", adminAuth, (req, res) => {
    res.sendFile(path.resolve(__dirname, "admin.html"));
});

app.get("/admin.js", adminAuth, (req, res) => {
    res.sendFile(path.resolve(__dirname, "admin.js"));
});

app.use(express.static(path.resolve(__dirname)));

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        next();
        return;
    }

    res.sendFile(path.resolve(__dirname, "index.html"));
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({ message: "Internal server error." });
});

connectMongo()
    .then(() => {
        return seedGlimpses();
    })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });

