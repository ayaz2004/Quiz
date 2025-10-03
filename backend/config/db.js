import {Client} from 'pg';


export function initDB(){
    const conn = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

})

conn.connect().then(()=>console.log("dbconnection setup complete")).catch(e=>console.log(e));
}