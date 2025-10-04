import prisma from "../config/db.config.js";

export const createUser = async(req,res)=>{
    console.log(req.body);
    const {email,password} = req.body;
    try {
        const findUser = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(findUser){
            return res.status(400).json({ error: "User already exists" });
        }
        const user = await prisma.user.create({
            data:{
                
                email,
                password
            }
        })
        res.status(201).json(user);
        
    } catch (error) {
        res.status(500).json({ error: "User creation failed" });
    }
}