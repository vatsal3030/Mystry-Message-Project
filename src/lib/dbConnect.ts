import mongoose, { mongo } from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

//isConnected hood number like this
// 0 → disconnected
// 1 → connected
// 2 → connecting
// 3 → disconnecting

const connection: ConnectionObject = {}

// here void does not mean liek in cpp it doesnt return anything it means it returns a anything with promise
async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI || '', {});
        connection.isConnected = db.connections[0].readyState; // this help to update connection varibale for checking already connected or not ?
        console.log(db.connections);
        console.log("Connected to database");
    }
    catch (e) {
        console.log("Error while connecting to database", e);
        throw e;    
    }

}

export default dbConnect;
