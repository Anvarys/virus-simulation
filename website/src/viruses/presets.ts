import type { Virus } from "@/utlis";

export const virusPresets = {
    "fatal": {
        infectionChance: 0.05,
        immunityDuration: 5,
        mortalityChance: 0.1,
        recoveryDuration: 7,
        name: "Fatal",
        color: "#ff0000"
    } satisfies Virus,
    "default": {
        infectionChance: 0.2,
        mortalityChance: 0.002,
        recoveryDuration: 10,
        immunityDuration: 4,
        name: "Default",
        color: "#00b000"
    }
}