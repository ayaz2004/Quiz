import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;

dotenv.config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

pool.on("connect", () => {
    console.log("Connection pool established with Database")
})


export default pool;

// import {Client} from 'pg';


// export function initDB(){
//     const conn = new Client({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: String(process.env.DB_PASSWORD),
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,

// })

// conn.connect().then(()=>console.log("dbconnection setup complete")).catch(e=>console.log(e));
// }