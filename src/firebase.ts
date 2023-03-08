import { Request, Response } from "express";
import admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import serviceAccount from "./serviceAccount.json";

export const firebase = admin.auth(
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
);

export type APIResponse = {
  error: {
    message: string;
    response: string;
  } | null;
  result: null | any;
};

export const authorize = (
  callback: (
    req: Request,
    userData: DecodedIdToken,
    result: (result: any, extraData?: any) => any,
    error: (error: Error | null, response: string) => APIResponse
  ) => Promise<APIResponse>,
  onResult?: (result: any) => void
) => {
  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    const token =
      typeof req.headers["x-token"] == "string" ? req.headers["x-token"] : "";
    firebase
      .verifyIdToken(token)
      .then(async (userData) => {
        let extraDataState;
        const response = await callback(
          req,
          userData,
          (result: any, extraData: any): APIResponse => {
            extraDataState = extraData;
            return {
              error: null,
              result,
            };
          },
          (error: Error | null, response: string): APIResponse => {
            return {
              error: {
                response,
                message: error?.message ?? "",
              },
              result: null,
            };
          }
        );
        res.status(200).send({ ...response, thing: "RTEJGHITRHN" });
        if (onResult && response.result !== null) {
          onResult(extraDataState);
        }
      })
      .catch((err) => {
        const response: APIResponse = {
          error: {
            response: "There was an error with an API call",
            message: err.message,
          },
          result: null,
        };
        if (!res.writableEnded) {
          res.status(400).send(response);
        } else {
          console.error(err);
        }
      });
  };
};
