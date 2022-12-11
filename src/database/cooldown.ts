import deta from "./deta";
import { Deta } from "deta";

const cooldowns = deta.Base("cooldowns");

const MESSAGES_PER_SECOND = 10;

export const checkCooldown = async (userID: string) => {
    const cooldown = await cooldowns.get(userID);
    if (!cooldown) {
        await cooldowns.put({ count: 1 }, userID, { expireIn: 60 });
        return true;
    }
    if (cooldown.count >= MESSAGES_PER_SECOND) {
        return false;
    } else {
        await cooldowns.update({ count: cooldowns.util.increment(1) }, userID);
        return true;
    }
};
