import type { Virus } from "@/utlis";

export const virusPresets = {
    "fatal": {
        infectionChance: 0.05,
        immunityDuration: 5,
        mortalityChance: 0.1,
        recoveryDuration: 7,
        name: "Fatal",
        color: "#ff0000"
    } satisfies Virus
}