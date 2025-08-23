import {
  VStack,
  Flex,
  Heading,
  HStack,
  Input,
  Button,
  Textarea,
  Field,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
  FileUpload,
  Float,
  useFileUploadContext
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { LuX } from "react-icons/lu"
import { HiUpload } from "react-icons/hi"
import { type ExercisePublic, type ExerciseCategory, type MuscleGroup, type Difficulty } from "@/client"

interface AddUpdateExerciseDrawerProps {
  mode: 'add' | 'update';
  exercise?: ExercisePublic; // Required when mode is 'update'
  onSubmit: (data: ExercisePublic) => void;
  onCancel: () => void;
}

const FileUploadList = () => {
  const fileUpload = useFileUploadContext()
  const files = fileUpload.acceptedFiles
  if (files.length === 0) return null
  return (
    <FileUpload.ItemGroup>
      {files.map((file) => (
        <FileUpload.Item
          w="auto"
          boxSize="20"
          p="2"
          file={file}
          key={file.name}
        >
          <FileUpload.ItemPreviewImage />
          <Float placement="top-end">
            <FileUpload.ItemDeleteTrigger boxSize="4" layerStyle="fill.solid">
              <LuX />
            </FileUpload.ItemDeleteTrigger>
          </Float>
        </FileUpload.Item>
      ))}
    </FileUpload.ItemGroup>
  )
}

function AddUpdateExerciseDrawer({ mode, exercise, onSubmit, onCancel }: AddUpdateExerciseDrawerProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ExercisePublic>({
    defaultValues: exercise || {}
  })

  // Reset form when mode changes to 'add' or when exercise changes
  useEffect(() => {
    if (mode === 'add') {
      reset({});
    } else if (mode === 'update' && exercise) {
      reset(exercise);
    }
  }, [mode, exercise, reset])

  // Extract values from generated union types
  const categories = ["strength", "cardio", "flexibility", "balance", "other"] as const
  const muscleGroups = ["chest", "back", "legs", "arms", "shoulders", "core", "full_body", "other"] as const
  const difficulties = ["beginner", "intermediate", "advanced"] as const

  const onSubmitNewExercise = (data: ExercisePublic) => {
    onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Flex direction="column" gap={4} p={4} py={1} overflow="auto" h="90%">
      <Heading size="lg" color="lime">
        {mode === 'add' ? 'Add New Exercise' : 'Update Exercise'}
      </Heading>
      
      <form onSubmit={handleSubmit(onSubmitNewExercise)}>
        <VStack gap={4}>
          <Field.Root invalid={!!errors.title}>
            <Field.Label color="white">Exercise Title</Field.Label>
            <Input
              {...register("title", { required: "Title is required" })}
              placeholder="Enter exercise name"
              bg="gray.800"
              color="white"
              borderRadius={15}
              border="solid 2px"
              borderColor="gray.600"
            />
            <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
          </Field.Root>

           <Field.Root>
            <Field.Label color="white">Upload Exercise Image </Field.Label>
            <FileUpload.Root maxFiles={1} accept={["image/*"]}>
              <FileUpload.HiddenInput />
              <FileUpload.Trigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  bg="gray.800"
                  color="white"
                  borderRadius={15}
                  border="solid 2px"
                  borderColor="gray.600"
                  _hover={{ bg: "gray.700" }}
                >
                  <HiUpload /> Upload Image
                </Button>
              </FileUpload.Trigger>
              <FileUploadList />
            </FileUpload.Root>
          </Field.Root>

          <Field.Root invalid={!!errors.description}>
            <Field.Label color="white">Description</Field.Label>
            <Textarea
              {...register("description", { required: "Description is required" })}
              placeholder="Describe the exercise..."
              bg="gray.800"
              color="white"
              borderRadius={15}
              border="solid 2px"
              borderColor="gray.600"
              minHeight="100px"
            />
            <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
          </Field.Root>

          <HStack w="100%" gap={3}>
            <Field.Root invalid={!!errors.sets} flex="1">
              <Field.Label color="white">Sets</Field.Label>
              <Input
                type="number"
                {...register("sets", { min: { value: 1, message: "Sets must be at least 1" } })}
                placeholder="3"
                bg="gray.800"
                color="white"
                borderRadius={15}
                border="solid 2px"
                borderColor="gray.600"
              />
              <Field.ErrorText>{errors.sets?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.reps} flex="1">
              <Field.Label color="white">Reps</Field.Label>
              <Input
                type="number"
                {...register("reps", { min: { value: 1, message: "Reps must be at least 1" } })}
                placeholder="10"
                bg="gray.800"
                color="white"
                borderRadius={15}
                border="solid 2px"
                borderColor="gray.600"
              />
              <Field.ErrorText>{errors.reps?.message}</Field.ErrorText>
            </Field.Root>
          </HStack>
          <Field.Root invalid={!!errors.duration} flex="1" w="50%">
              <Field.Label color="white">Duration (min)</Field.Label>
              <Input
                type="number"
                {...register("duration", { 
                  required: "Duration is required",
                  min: { value: 1, message: "Duration must be at least 1 minute" }
                })}
                placeholder="10"
                bg="gray.800"
                color="white"
                borderRadius={15}
                border="solid 2px"
                borderColor="gray.600"
              />
              <Field.ErrorText>{errors.duration?.message}</Field.ErrorText>
            </Field.Root>

          <Field.Root invalid={!!errors.difficulty} flex="1">
              <Field.Label color="white">Difficulty</Field.Label>
              <Controller
                name="difficulty"
                control={control}
                rules={{ required: "Difficulty is required" }}
                render={({ field }) => (
                  <SelectRoot
                    collection={createListCollection({ items: difficulties })}
                    value={field.value ? [field.value] : []}
                    onValueChange={(e) => field.onChange(e.value[0])}
                  >
                    <SelectTrigger
                      bg="gray.800"
                      color="white"
                      borderRadius={15}
                      border="solid 2px"
                      borderColor="gray.600"
                    >
                      <SelectValueText placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} item={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                )}
              />
              <Field.ErrorText>{errors.difficulty?.message}</Field.ErrorText>
            </Field.Root>

          <Field.Root invalid={!!errors.category}>
            <Field.Label color="white">Category</Field.Label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <SelectRoot
                  collection={createListCollection({ items: categories })}
                  value={field.value ? [field.value] : []}
                  onValueChange={(e) => field.onChange(e.value[0])}
                >
                  <SelectTrigger
                    bg="gray.800"
                    color="white"
                    borderRadius={15}
                    border="solid 2px"
                    borderColor="gray.600"
                  >
                    <SelectValueText placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} item={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
            <Field.ErrorText>{errors.category?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.muscle_group}>
            <Field.Label color="white">Muscle Group</Field.Label>
            <Controller
              name="muscle_group"
              control={control}
              rules={{ required: "Muscle group is required" }}
              render={({ field }) => (
                <SelectRoot
                  collection={createListCollection({ items: muscleGroups })}
                  value={field.value ? [field.value] : []}
                  onValueChange={(e) => field.onChange(e.value[0])}
                >
                  <SelectTrigger
                    bg="gray.800"
                    color="white"
                    borderRadius={15}
                    border="solid 2px"
                    borderColor="gray.600"
                  >
                    <SelectValueText placeholder="Select muscle group" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} item={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
            <Field.ErrorText>{errors.muscle_group?.message}</Field.ErrorText>
          </Field.Root>
         

          <Field.Root invalid={!!errors.video_url}>
            <Field.Label color="white">Video URL</Field.Label>
            <Input
              {...register("video_url")}
              placeholder="Enter video URL"
              bg="gray.800"
              color="white"
              borderRadius={15}
              border="solid 2px"
              borderColor="gray.600"
            />
            <Field.ErrorText>{errors.video_url?.message}</Field.ErrorText>
          </Field.Root>
              
          
          <HStack w="100%" gap={3} pt={4}>
            <Button
              type="button"
              variant="outline"
              flex="1"
              borderRadius="full"
              color="green"
              borderColor="green"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
              flex="1"
              loading={isSubmitting}
              color="lime"
              bg="gray.600"
              borderRadius="full"
            >
              {mode === 'add' ? 'Create Exercise' : 'Update Exercise'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Flex>
  );
}

export default AddUpdateExerciseDrawer;