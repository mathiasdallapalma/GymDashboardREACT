import { Button, FormLabel, Input, Textarea } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ExercisePublic, type ExerciseUpdate, ExercisesService } from "@/client"
import { DialogActionTrigger, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import useCustomToast from "@/hooks/useCustomToast"

interface EditExerciseProps {
  exercise: ExercisePublic
  children: React.ReactNode
}

const EditExercise = ({ exercise, children }: EditExerciseProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ExerciseUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: exercise,
  })

  const mutation = useMutation({
    mutationFn: (data: ExerciseUpdate) =>
      ExercisesService.updateExercise({ id: exercise.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Exercise updated successfully.", "success")
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
    onError: () => {
      showToast("Something went wrong.", "Please try again.", "error")
    },
  })

  const onSubmit: SubmitHandler<ExerciseUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
  }

  return (
    <>
      <DialogRoot>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="edit-exercise-form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Field
                invalid={!!errors.title}
                errorText={errors.title?.message}
                mb={4}
              >
                <FormLabel htmlFor="title">Title</FormLabel>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Title is required",
                  })}
                />
              </Field>
              <Field
                invalid={!!errors.description}
                errorText={errors.description?.message}
                mb={4}
              >
                <FormLabel htmlFor="description">Description</FormLabel>
                <Textarea
                  id="description"
                  {...register("description")}
                />
              </Field>
            </form>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              form="edit-exercise-form"
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default EditExercise