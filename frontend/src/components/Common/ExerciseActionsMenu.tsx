import { DeleteIcon, EditIcon } from "@chakra-ui/icons"
import {
  IconButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@chakra-ui/react"
import { BsThreeDots } from "react-icons/bs"
import { FiEdit, FiTrash2 } from "react-icons/fi"

import type { ExercisePublic } from "@/client"


interface ExerciseActionsMenuProps {
  exercise: ExercisePublic
}

export const ExerciseActionsMenu = ({ exercise }: ExerciseActionsMenuProps) => {
  return (
    <>
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<BsThreeDots />}
            aria-label={`Open menu for exercise ${exercise.title}`}
          />
        </MenuTrigger>
        <MenuContent>
          
          <Text>Menu Content</Text>
        </MenuContent>
      </MenuRoot>
    </>
  )
}