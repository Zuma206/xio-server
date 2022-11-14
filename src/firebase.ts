import { NextFunction, Request, Response } from "express";
import {
    initializeApp,
    credential,
    ServiceAccount,
    auth,
} from "firebase-admin";
import serviceAccount from "./serviceAccount.json";

export const firebase = auth(
    initializeApp({
        credential: credential.cert(serviceAccount as ServiceAccount),
    })
);
