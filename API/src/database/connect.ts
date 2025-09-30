import mysql from "mysql2";
import { db } from "../config/index.ts";

let client: mysql.Pool;

try{
    client = await mysql.createPool({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.pass,
    database: db.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
    console.log("Conexion a la base de datos exitosa: " + db.name);
}catch(error){
    console.log("Error en la conexion a la base de datos: \n" + error);
    Deno.exit(1);
}

export default client;
