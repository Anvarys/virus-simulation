import { Dialog, DialogContent} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { VirusCardParams, VirusEditorParams } from "@/utlis";
import React, { type CSSProperties } from "react";

const VirusCard: React.FC<VirusCardParams> = ({virus}) => {
  return (
    <div className={`bg-[var(--virus-color)]/20 w-[10dvw] h-[10dvw] rounded-[1dvh] border border-[var(--virus-color)]/50 flex flex-col items-center p-1 text-neutral-100`} style={{"--virus-color": virus.color} as CSSProperties}>
      <Label className="text-neutral-100 whitespace-normal mb-2">{virus.name}</Label>
      <p>InC: {virus.infectionChance*100}%</p>
      <p>MrC: {virus.mortalityChance*100}%</p>
      <p>RcD: {virus.recoveryDuration}</p>
      <p>ImD: {virus.immunityDuration}</p>
    </div>
  )
}


const VirusEditor: React.FC<VirusEditorParams> = ({
  virusesRef,
  isOpen,
  setIsOpen
}) => {
  virusesRef
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent className="min-w-[80%] max-w-[80%] min-h-[80%] max-h-[80%]
    bg-neutral-900 border-neutral-800">
    <div className="flex flex-col">
  
    <Label className="text-xl text-neutral-100">Your viruses</Label>

    <div className="flex flex-grow mt-4 mb-4">
      { virusesRef.current.map((virus) =>
      <VirusCard virus={virus}/>)
      }
    </div>

    </div>
    </DialogContent>
    </Dialog>
  )
};

export default VirusEditor