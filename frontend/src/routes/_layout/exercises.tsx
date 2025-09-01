import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  } from "@chakra-ui/react"
import React from "react"


import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient, useMutation, useQuery, useQueries } from "@tanstack/react-query"
import { z } from "zod"

import ExercisesList from "@/components/Exercises/exercise-list"

import PendingExercises from "@/components/Pending/PendingExercises"

import useCustomToast from "@/hooks/useCustomToast"
import { type ExerciseCreate, ExercisesService, type ExercisePublic } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import { handleError } from "@/utils"
import GoBack from "@/components/ui/goback"
import SortComponent from "@/components/ui/sort-component"
import { set } from "react-hook-form"
import useAuth from "@/hooks/useAuth";

const exercisesSearchSchema = z.object({
  // Remove page parameter since we're loading all exercises
})

function getExercisesQueryOptions() {
  return {
    queryFn: () =>
      ExercisesService.readExercisesApiV1(), // Load up to 1000 exercises
    queryKey: ["exercises", "all"],
  }
}

export const Route = createFileRoute("/_layout/exercises")({
  component: Exercises,
  validateSearch: (search) => exercisesSearchSchema.parse(search),
})

function Exercises() {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  // State for sorting
  const [sortBy, setSortBy] = React.useState<string>("title")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const { user: currentUser } = useAuth();


  // Fetch exercises for user role
  let exercises: ExercisePublic[] = [];
  let isLoading = false;

  if (currentUser?.role === "user") {
    const ex_ids = currentUser.exercises?.map((ex: any) => ex.id) || [];
    const exerciseQueries = useQueries({
      queries: ex_ids.map((id: string) => ({
        queryKey: ["exercise", id],
        queryFn: () => ExercisesService.readExerciseApiV1({ id }),
        enabled: !!id,
      })),
    });
    isLoading = exerciseQueries.some(q => q.isLoading);
    exercises = exerciseQueries.map((q, idx) => q.data ? q.data : { id: ex_ids[idx] });
  } else {
    const query = useQuery({
      ...getExercisesQueryOptions(),
      placeholderData: (prevData) => prevData,
    });
    isLoading = query.isLoading;
    exercises = query.data?.data ?? [];
  }

  // State for errors
  const [error, setError] = React.useState<string | null>(null);

  // Sort exercises based on selected criteria
  const sortedExercises = React.useMemo(() => {
    if (!exercises.length) return exercises;

    return [...exercises].sort((a, b) => {
      let aValue: any = (a as any)[sortBy];
      let bValue: any = (b as any)[sortBy];

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [exercises, sortBy, sortOrder])

  // Sorting options for exercises
  const exerciseSortOptions = [
    { value: "title", label: "Title" },
    { value: "category", label: "Category" },
    { value: "muscle_group", label: "Muscle Group" },
    { value: "difficulty", label: "Difficulty" },
    { value: "duration", label: "Duration" },
  ]

  // Create exercise mutation with optimistic updates
  const createMutation = useMutation({
    mutationFn: (data: ExerciseCreate) =>
      ExercisesService.createExerciseApiV1({ requestBody: data }),
    onMutate: async (newExercise) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["exercises", "all"] })
      
      // Snapshot the previous value
      const previousExercises = queryClient.getQueryData(["exercises", "all"])
      
      // Create temporary exercise with optimistic ID
      const optimisticExercise = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: newExercise.title,
        description: newExercise.description,
        category: newExercise.category || "strength",
        muscle_group: newExercise.muscle_group || "full body",
        reps: newExercise.reps,
        sets: newExercise.sets,
        duration: newExercise.duration || 0,
        difficulty: newExercise.difficulty || "easy",
        image_url: newExercise.image_url || "",
        
        owner_id: "current-user", // Will be set by backend
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(["exercises", "all"], (old: any) => {
        if (!old) return { data: [optimisticExercise], count: 1 }
        return {
          ...old,
          data: [optimisticExercise, ...old.data],
          count: old.count + 1
        }
      })
      
      // Return a context object with the snapshotted value
      return { previousExercises }
    },
    onSuccess: (newExercise) => {     
      // Replace the optimistic exercise with the real one from server
      queryClient.setQueryData(["exercises", "all"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((exercise: any) => 
            exercise.id.startsWith('temp-') ? newExercise : exercise
          )
        }
      })
    },
    onError: (err: ApiError, _variables, context) => {
      handleError(err)
      setError("Failed to create exercise. Please try again.")
      
      // Roll back to the previous state
      if (context?.previousExercises) {
        queryClient.setQueryData(["exercises", "all"], context.previousExercises)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have correct data
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })  
  
  // Update exercise mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: ExerciseCreate }) =>
      ExercisesService.updateExerciseApiV1({ id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Exercise updated successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
      setError("Failed to update exercise. Please try again.")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  // Delete exercise mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: (exerciseId: string) =>
      ExercisesService.deleteExerciseApiV1({ id: exerciseId }),
    onMutate: async (exerciseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["exercises", "all"] })
      
      // Snapshot the previous value
      const previousExercises = queryClient.getQueryData(["exercises", "all"])
      
      // Optimistically remove the exercise from cache
      queryClient.setQueryData(["exercises", "all"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((exercise: any) => exercise.id !== exerciseId),
          count: old.count - 1
        }
      })
      
      return { previousExercises }
    },
    onSuccess: () => {
      showSuccessToast("Exercise deleted successfully.")
    },
    onError: (err: ApiError, _variables, context) => {
      handleError(err)
      setError("Failed to delete exercise. Please try again.")
      
      // Roll back to the previous state
      if (context?.previousExercises) {
        queryClient.setQueryData(["exercises", "all"], context.previousExercises)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  const handleAddExercise = (exerciseData: ExercisePublic) => {
    setError(null)
    // Map Exercise to ExerciseCreate with all fields
    const createData: ExerciseCreate = {
      title: exerciseData.title,
      description: exerciseData.description || "",
      category: exerciseData.category,
      muscle_group: exerciseData.muscle_group,
      reps: exerciseData.reps,
      sets: exerciseData.sets,
      duration: exerciseData.duration,
      difficulty: exerciseData.difficulty,
      image_url: exerciseData.image_url,
      video_url: exerciseData.video_url || "",
    }
    createMutation.mutate(createData)
  }

  const handleUpdateExercise = (exerciseData: ExercisePublic) => {
    setError(null)
    if (!exerciseData.id) return;

    // Map Exercise to ExerciseCreate
    const updateData: ExerciseCreate = {
      title: exerciseData.title,
      description: exerciseData.description || "",
      // Add other fields as needed for your API
    }
    updateMutation.mutate({ id: exerciseData.id, data: updateData })
  }

  const handlePlay = (exercise: ExercisePublic) => {
    console.log("Playing exercise:", exercise);
    // Handle play functionality if needed
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setError(null)
    deleteMutation.mutate(exerciseId)
  }

  return (
    <Container maxW="full" p={1} >
      <GoBack />

      {/* Header with Heading and Sort Controls */}
      <HStack justify="space-between" align="center" pt={12} pb={4} >
        <Heading size="lg" w="full">
          Your exercises
        </Heading>

        {/* Sort Controls */}
        <SortComponent
          w="160px"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          sortOptions={exerciseSortOptions}
        />
      </HStack>

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error}
        </Text>
      )}

      {isLoading ? (
        <PendingExercises />
      ) : (
        <ExercisesList
          onPlay={handlePlay}
          routeFullPath={Route.fullPath}
          exercises={sortedExercises as any}
          showAddExercise={true}
          onAddExercise={handleAddExercise}
          onUpdateExercise={handleUpdateExercise}
          onDeleteExercise={handleDeleteExercise}
          performance={currentUser?.role === "user" ? currentUser.exercises : undefined}
        />
      )}
    </Container >
  )
}

export default Exercises
