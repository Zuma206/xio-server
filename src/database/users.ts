import deta from "./deta";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import md5 from "md5";

const users = deta.Base("users");

export type XIOUser = {
  username: string;
  gravatar: string;
  key: string;
  dev: boolean;
};

export const getUserById = async (uid: string): Promise<null | XIOUser> => {
  const user = await users.get(uid);
  if (user) {
    return user as XIOUser;
  }
  return null;
};

export const isValidUsername = async (username: string) => {
  const usersWithUsername = await users.fetch({ username });
  return usersWithUsername.count === 0;
};

export const getGravatar = (token: DecodedIdToken) => {
  const hash = md5(token.email);
  return `https://www.gravatar.com/avatar/${hash}`;
};

export const createUser = async (
  username: string,
  token: DecodedIdToken
): Promise<boolean> => {
  if (await users.get(token.uid)) return false;

  await users.put(
    {
      username,
      gravatar: getGravatar(token),
      dev: false,
    },
    token.uid
  );

  return true;
};
