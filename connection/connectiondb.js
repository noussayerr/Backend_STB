import mongoose from "mongoose";

export const connectdb = async () => {
    try{
        console.log(process.env.mongourl)
        const connect=await mongoose.connect (process.env.mongourl)
        console.log(`mongodb connected : ${connect.connection.host}`)
    }catch(error){
        console.log("error connection",error.message)
        process.exit(1)
    }
};