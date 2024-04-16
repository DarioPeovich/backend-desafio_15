import { Router } from "express";
import { ProductsController } from "../controlador/products.controller.js";
import { checkRole } from "../middleware/auth.js";
import { generateProduct } from "../utils.js";
import { uploader } from "../utils.js";

const router = Router();


router.get("/", ProductsController.getProducts);   


router.get("/:pid", ProductsController.getProductId);

router.post("/testing",  ProductsController.createProduct);     //Para testing, sin chekRole
router.post("/", uploader.single('thumbnails'),checkRole(["ADMIN", "PREMIUM"]), ProductsController.createProduct);

//checkRole(["ADMIN", "PREMIUM"]), middleware retirado para pruebas 01/04/24
router.put("/:pid", checkRole(["ADMIN", "PREMIUM"]), ProductsController.modifProduct);

//Para ingresar un array de Productos desde el body
router.post("/insert", checkRole(["ADMIN"]), ProductsController.createManyProducts);

router.delete("/:pid", checkRole(["ADMIN", "PREMIUM"]), ProductsController.deleteProduct);

router.get("/mock/mockingproducts/", (req,res)=>{
    //console.log("Entre a mockingProducts")
    const cant = parseInt(req.query.cant) || 100;
    let products = [];
    for (let i = 0; i < cant; i++) {
        const product = generateProduct();
        products.push(product);
    }
    res.json({status:"success", payload: products})

})



export { router as productRouter };
