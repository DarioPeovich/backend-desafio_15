import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import { Faker, en } from "@faker-js/faker";
import jwt from "jsonwebtoken";
import { config } from "./config/config.js";
import multer from "multer";
import { join } from "path"; // Importa la función join del módulo path
import { error } from "console";
/*** */
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validatePassword = (password, user) => bcrypt.compareSync(password, user.password);

/*** */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;


//Faker: Libreria para generar datos para pruebas
export const customFaker = new Faker({ locale: [en] });
const { commerce, image, database, string, internet, person, phone,datatype, lorem } = customFaker;
export const generateProduct = () =>{
    return {
        id: database.mongodbObjectId(),
        title: commerce.productName(),
        price: parseFloat(commerce.price()),
        departament: commerce.department(),
        stock: parseInt(string.numeric(2)),
        image: image.url(),
        code: string.alphanumeric(10),
        description: commerce.productDescription()
    }
}

//--JWT comienzo
const PRIVATE_KEY ="CoderKeyFeliz";

export const generateToken = (user) => {
    const token = jwt.sign({user}, PRIVATE_KEY,{expiresIn:'1d'})
    return token;
}
// export const authToken = (req,res,next) => {

//     const authHeader = req.headers.authorization;
//     //console.log("authHeader (En utils)", authHeader);
//     const token = authHeader.split(' ')[1];
//     if(token === "null"){
//         return res.status(401).send({status:"error",error: "No autorizado" })
//     }
//     jwt.verify(token,PRIVATE_KEY,(error,credentials)=>{
//         if(error){
//             return res.status(401).send({status:"error",error: "No autorizado" })
//         }
//         req.user = credentials.user;
//         next();
//     })
// }

export const authToken = (req, res, next) => {
    // Se busca el token en el Headers o si viene como query.
    let authHeader = req.headers.authorization;
    let token;

    if (!authHeader) {
        token = req.query.token;
    } else {
        token = authHeader.split(' ')[1];
    }

    //console.log("En Utils.js, token:", token);

    if (!token || token === "null") {
        return res.status(401).send({ status: "error", error: "No autorizado" });
    }

    jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
        if (error) {
            return res.status(401).send({ status: "error", error: "No autorizado" });
        }
        req.user = credentials.user;
        next();
    });
};

//--JWT FIN

//Generacion de token con JWT para mail
export const generateEmailToken = (email,expireTime)=>{
    //const token = jwt.sign({email},config.gmail.emailToken,{expiresIn:810}); //expireTime
    const token = jwt.sign({email},config.gmail.emailToken,{expiresIn:expireTime}); //
    //console.log("En generateEmailToken. Token duracion link:", token)
    return token;
};

export const verifyEmailToken = (token)=>{
    //console.log("En verifyEmailToken. Token duracion link:", token)
    try {
        const info = jwt.verify(token,config.gmail.emailToken);
        return info.email;
    } catch (error) {
        console.log("error catch", error.message);
        return null;
    }
};
//Fin de token para mail

//======= MULTER: CARRA DE ARCHIVOS EN EL SERVIDOR
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destination = "";
        const ruta = req.originalUrl
        //console.log("req.req.originalUrl", ruta)
        // Verificar la ruta del endpoint y asignar la carpeta de destino correspondiente
        if (ruta.startsWith('/api/products')) {
            destination = join(__dirname, '/public/images/products');
        } else if (ruta.startsWith('/api/sessions/register')) {
            destination = join(__dirname, '/public/images/profile');
        } else if (ruta.startsWith('/api/users')) {
            if (ruta.includes('/documents')) {
                destination = join(__dirname, '/public/images/documents');
            }
        } 

        if (destination === "") {
            destination = join(__dirname, '/public/images');
        }

        cb(null, destination);
    },
    filename: function (req, file, cb) {
        //console.log("entre")
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploader = multer({ storage });

// const storage = multer.diskStorage({
//     destination:function(req,file,cb) {
//      cb(null,`${__dirname}/public/images`); 
//     },
//     filename:function(req,file,cb) {
//         console.log(file);
//         cb(null,`${Date.now()}-${file.originalname}`)
//     }
// })
// export const uploader = multer({storage});
