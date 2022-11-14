import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.json";

export const firebase = admin.auth(
    admin.initializeApp({
        credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount
        ),
    })
);
