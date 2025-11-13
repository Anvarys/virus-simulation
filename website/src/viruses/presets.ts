import type { Virus } from "@/simulations/utlis";

export const virusPresets = {
    "Fatal": {
        infectionChance: 0.05,
        immunityDuration: 5,
        mortalityChance: 0.1,
        recoveryDuration: 7,
        name: "P01F",
        color: "#ff0000"
    } satisfies Virus
}