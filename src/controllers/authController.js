import db from "../database.js";
import { stripHtml } from "string-strip-html";
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';

async function postSignUp(req, res){
    const user = req.body;
    const passwordHash = bcrypt.hashSync(user.password, 10);

    user.email = stripHtml(user.email).result.trim();
    user.name = stripHtml(user.name).result.trim();
    user.password = stripHtml(user.password).result.trim();

    const userCollection = db.collection("users");

    try {
        
        const existingUser = await userCollection.findOne({ email: user.email });
        if(existingUser) {
            res.status(409).send("Dados de usuário já existentes, caso não lembre a senha entre em contato!");
            return;
        };
        await userCollection.insertOne({ ...user, password: passwordHash });
        res.sendStatus(201);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    };
};

async function postLogin(req, res){
    const {email, password} = req.body;

    try{
        const user = await db.collection('users').findOne({ email });

        if(!user){
            res.sendStatus(401);
            return;
        }

        const isAuthorized = bcrypt.compareSync(password, user.password)
        if(isAuthorized){
            const token = uuid();
            const userData = { token, user: { userId: user._id, name: user.name, image: user.image } };
            await db.collection("sessions").insertOne({
                userData
            })
            console.log(userData)
            return res.send(userData);
        }
        res.sendStatus(401);
    }
    catch(error){
        console.log(error);
        res.sendStatus(401);
    }
};

export {
    postSignUp,
    postLogin
};