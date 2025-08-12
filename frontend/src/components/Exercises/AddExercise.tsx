import { Button,  Input, Textarea, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ExerciseCreate, ExercisesService } from "@/client"
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import useCustomToast from "@/hooks/useCustomToast"

interface AddExerciseProps {
  children?: React.ReactNode
}

const AddExercise = ({ children }: AddExerciseProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ExerciseCreate) =>
      ExercisesService.createExercise({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Exercise created successfully.", "success")
      reset()
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
    onError: () => {
      showToast("Something went wrong.", "Please try again.", "error")
    },
  })

  const onSubmit: SubmitHandler<ExerciseCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Text>Add Exercise see Add Item as reference</Text>
    </>
  )
}

export default AddExercise