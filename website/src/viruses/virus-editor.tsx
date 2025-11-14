import { Dialog, DialogContent} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { VirusCardParams, VirusEditorParams } from "@/utlis";
import React, { type CSSProperties } from "react";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const VirusCard: React.FC<VirusCardParams> = ({virus, id, onClick}) => {
  return (
    <div className={`group bg-[var(--virus-color)]/20 w-[10dvw] h-[10dvw] rounded-[1dvh] border border-[var(--virus-color)]/50 flex flex-col items-center p-1 space-y-1 text-neutral-100`} style={{"--virus-color": virus.color} as CSSProperties}>
      <Label className="text-neutral-100 whitespace-normal mb-2">{virus.name}</Label>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Infection %: </Label><span className="text-xs text-violet-300">{virus.infectionChance*100}%</span></div>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Mortality %: </Label><span className="text-xs text-violet-300">{virus.mortalityChance*100}%</span></div>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Recovery d: </Label><span className="text-xs text-violet-300">{virus.recoveryDuration}</span></div>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Immunity d: </Label><span className="text-xs text-violet-300">{virus.immunityDuration}</span></div>
      <Label className="text-neutral-300 hidden group-hover:block space-y-1 mt-1 hover:cursor-pointer hover:text-neutral-100" onClick={() => {onClick(id)}}><FontAwesomeIcon icon={faPen} size="xs"/> Edit</Label>
    </div>
  )
}


const VirusEditor: React.FC<VirusEditorParams> = ({
  virusesRef,
  isOpen,
  setIsOpen
}) => {
  virusesRef

  const [editVirusOpen, setEditVirusOpen] = React.useState(false);
  const [currentlyEditing, setCurrentlyEditing] = React.useState(-1);

  const editVirus = (id: number) => {
    setCurrentlyEditing(id)
    setEditVirusOpen(true)
  }
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-[80%] max-w-[80%] min-h-[80%] max-h-[80%]
      bg-neutral-900 border-neutral-800">
      <div className="flex flex-col">
    
      <Label className="text-xl text-neutral-100">Your viruses</Label>

      <div className="flex flex-grow mt-4 mb-4">
        { virusesRef.current.map((virus, id) =>
        <VirusCard virus={virus} id={id} onClick={editVirus}/>)
        }
      </div>

      </div>
      </DialogContent>
      </Dialog>
      { currentlyEditing != -1 &&
      <Dialog open={editVirusOpen} onOpenChange={setEditVirusOpen}>
        <DialogContent className="bg-neutral-800 border-neutral-700 w-min p-10">
        <div className="flex flex-col w-full items-center">
      
        <Label className="text-xl text-neutral-100 mb-4 whitespace-nowrap">Editing a virus</Label>

        <div className="flex flex-col w-full">

        </div>

        </div>
        </DialogContent>
      </Dialog>
      }
    </>
  )
};

export default VirusEditor