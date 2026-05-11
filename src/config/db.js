const mongoose = require("mongoose");

const connectMongo = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is missing. Add it in .env.");
    }

    try {
        // Log connection attempt (without password)
        const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
        console.log("🔗 Connecting to MongoDB:", maskedUri);

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log("✅ Connected to MongoDB successfully.");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        console.error("   Error Code:", error.code);
        
        // Provide helpful troubleshooting tips
        if (error.message.includes("ECONNREFUSED") || error.message.includes("querySrv") || error.message.includes("ENOTFOUND")) {
            console.error("\n🔧 Troubleshooting Steps:");
            console.error("   1. ✅ Check if MongoDB Atlas cluster is RUNNING (not paused)");
            console.error("   2. ✅ Verify your IP is whitelisted in Network Access (0.0.0.0/0 for testing)");
            console.error("   3. ✅ Check your internet connection stability");
            console.error("   4. 🔄 Try using a direct connection string instead of SRV");
            console.error("   5. ⏳ Wait 2-3 minutes for whitelist changes to propagate");
        }
        
        throw error;
    }
};

module.exports = connectMongo;

