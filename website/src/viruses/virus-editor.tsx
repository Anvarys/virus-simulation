import { Dialog, DialogContent} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { rgbToHex, saveVirusesToLocal, type Virus, type VirusCardParams, type VirusEditorParams } from "@/utlis";
import React, { type CSSProperties } from "react";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import InfoIcon from "@/components/icons/InfoIcon";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { virusPresets } from "./presets";


function generateVirusName() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += Math.floor(Math.random()*10);
  result += Math.floor(Math.random()*10);
  return result;
}

function generateColor() {
  return rgbToHex(Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256))
}


const VirusCard: React.FC<VirusCardParams> = ({virus, id, editFunc, deleteFunc}) => {
  return (
    <div className={`group bg-[var(--virus-color)]/20 w-[10dvw] h-[10dvw] rounded-[1dvh] border border-[var(--virus-color)]/50 flex flex-col items-center p-1 space-y-1 text-neutral-100`} style={{"--virus-color": virus.color} as CSSProperties}>
      <Label className="text-neutral-100 whitespace-normal mb-2">{virus.name}</Label>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Infection %: </Label><span className="text-xs text-violet-300">{virus.infectionChance*100}%</span></div>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Mortality %: </Label><span className="text-xs text-violet-300">{virus.mortalityChance*100}%</span></div>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Recovery d: </Label><span className="text-xs text-violet-300">{virus.recoveryDuration}</span></div>
      <div className="flex flex-row w-full justify-between"><Label className="text-xs">Immunity d: </Label><span className="text-xs text-violet-300">{virus.immunityDuration}</span></div>
      <div className="flex flex-row gap-2">
      <Label className="text-neutral-300 hidden group-hover:block space-y-1 mt-1 cursor-pointer hover:text-neutral-100 text-xs" onClick={() => {editFunc(id)}}><FontAwesomeIcon icon={faPen} size="xs"/> Edit</Label>
      <Label className="text-neutral-300 hidden group-hover:block space-y-1 mt-1 cursor-pointer hover:text-neutral-100 text-xs" onClick={() => {deleteFunc(id)}}><FontAwesomeIcon icon={faTrash} size="xs"/> Delete</Label>
      </div>
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
  const [currentlyEditingId, setCurrentlyEditingId] = React.useState(-1);
  const [currentlyEditingVirus, setCurrentlyEditingVirus] = React.useState<Virus | undefined>(undefined);
  const [updateKey, setUpdateKey] = React.useState(0);

  const editVirus = (id: number) => {
    setCurrentlyEditingId(id)
    setCurrentlyEditingVirus({
      ...virusesRef.current[id],
      infectionChance: Math.round(virusesRef.current[id].infectionChance * 10000) / 100,
      mortalityChance: Math.round(virusesRef.current[id].mortalityChance * 10000) / 100
    } satisfies Virus)
    setEditVirusOpen(true)
  }

  const deleteVirus = (id: number) => {
    virusesRef.current.splice(id, 1)
    setUpdateKey(updateKey+1)
    saveVirusesToLocal(virusesRef.current)
  }

  const saveVirus = () => {
    if (!currentlyEditingVirus) {return}

    virusesRef.current[currentlyEditingId] = {
      ...currentlyEditingVirus,
      infectionChance: currentlyEditingVirus.infectionChance / 100,
      mortalityChance: currentlyEditingVirus.mortalityChance / 100
    }

    setEditVirusOpen(false)
    setUpdateKey(updateKey+1)

    saveVirusesToLocal(virusesRef.current)
  }

  const addNew = () => {
    virusesRef.current.push({
      ...virusPresets.default,
      name: generateVirusName(),
      color: generateColor()
    } satisfies Virus)

    editVirus(virusesRef.current.length-1)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="min-w-[80%] max-w-[80%] min-h-[80%] max-h-[80%]
      bg-neutral-900 border-neutral-800 overflow-auto">
      <div className="flex flex-col">
    
      <Label className="text-xl text-neutral-100">Your viruses</Label>

      <div className="flex flex-grow mt-4 mb-4 gap-4 flex-wrap items-start content-start" key={updateKey}>
        { virusesRef.current.map((virus, id) =>
        <VirusCard virus={virus} id={id} editFunc={editVirus} deleteFunc={deleteVirus}/>)
        }
      </div>

      </div>
      <div onClick={addNew} className="w-12 h-12 bg-violet-500 bottom-5 sticky self-end rounded-full ring-ring/50 transition-[box-shadow] shadow-sm hover:ring-4 cursor-pointer flex justify-center items-center ml-auto">
        <FontAwesomeIcon icon={faPlus} color="white" size="xl"/>
      </div>
      </DialogContent>
      </Dialog>
      { currentlyEditingId != -1 && currentlyEditingVirus &&
      <Dialog open={editVirusOpen} onOpenChange={setEditVirusOpen}>
        <DialogContent className="bg-neutral-800 border-neutral-700 w-min p-6">
        <div className="flex flex-col w-full items-center text-neutral-100">

        <div className="flex flex-col w-full space-y-5">
          <Field>
            <FieldLabel>
              Virus Name
            </FieldLabel>
            <Input value={currentlyEditingVirus.name} onInput={(e) => {setCurrentlyEditingVirus({...currentlyEditingVirus, name: e.currentTarget.value} satisfies Virus)}}></Input>
          </Field>
          <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label className="min-w-[9rem]">
                  Infection chance
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Chance that a human will<br/>infect his neighbors each<br/>unit of time</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300 min-w-[3rem] text-right">{currentlyEditingVirus.infectionChance}%</span>
              </div>
              <Slider
                value={[currentlyEditingVirus.infectionChance]}
                onValueChange={([value]) => {setCurrentlyEditingVirus({...currentlyEditingVirus, infectionChance: value})}}
                min={0.2}
                max={100}
                step={0.2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <div className='flex flex-row items-left'>
                  <Label className="pr-2 min-w-[7.4rem]">Mortality chance</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Chance that a human will<br/>die each unit of time<br/>when he is infected</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-violet-300 text-right min-w-[3rem]">{currentlyEditingVirus.mortalityChance}%</span>
              </div>
              <Slider
                value={[currentlyEditingVirus.mortalityChance]}
                onValueChange={([value]) => {setCurrentlyEditingVirus({...currentlyEditingVirus, mortalityChance: value})}}
                min={0}
                max={10}
                step={0.02}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label>
                  Recovery duration
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Amount of units of time<br/>after which human will<br/>become healthy after<br/>getting infected</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{currentlyEditingVirus.recoveryDuration}</span>
              </div>
              <Slider
                value={[currentlyEditingVirus.recoveryDuration]}
                onValueChange={([value]) => {setCurrentlyEditingVirus({...currentlyEditingVirus, recoveryDuration: value})}}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className='flex items-center justify-between'>
                <Label>
                  Immunity duration
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon color="white" width='1rem' height='1rem'/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-center'>Amount of units of time<br/>that human will be immune for<br/>after healing from an infection</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm text-violet-300">{currentlyEditingVirus.immunityDuration}</span>
              </div>
              <Slider
                value={[currentlyEditingVirus.immunityDuration]}
                onValueChange={([value]) => {setCurrentlyEditingVirus({...currentlyEditingVirus, immunityDuration: value})}}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
        </div>
        <div className="space-x-2">
          <Button className="mt-8" variant="secondary" onClick={() => {setEditVirusOpen(false)}}>Cancel</Button>
          <Button className="mt-8" onClick={saveVirus}>Save</Button>
        </div>
        </div>
        </DialogContent>
      </Dialog>
      }
    </>
  )
};

export default VirusEditor