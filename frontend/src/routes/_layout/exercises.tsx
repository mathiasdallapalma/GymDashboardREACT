import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react"
import React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"

import AddExercise from "@/components/Exercises/AddExercise"
import ExercisesList from "@/components/Exercises/exercise-list"
import CustomDrawer from "@/components/Common/CustomDrawer"
import type { UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"

const exercisesSearchSchema = z.object({
  page: z.number().catch(1),
})

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  muscle_group: string;
  reps?: number;
  sets?: number;
  weight?: number;
  duration: number;
  difficulty: string;
  image_url: string;
  video_url: string;
  owner_id: string;
}



export const Route = createFileRoute("/_layout/exercises")({
  component: Exercises,
  validateSearch: (search) => exercisesSearchSchema.parse(search),
})

function Exercises() {
  const { page } = Route.useSearch()
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  
  // State for exercises list
  const [exercises, setExercises] = React.useState<Exercise[]>([
    {
      id: "1",
      title: "Push Up",
      description: "A basic exercise for upper body strength",
      category: "strength",
      muscle_group: "chest",
      reps: 10,
      sets: 3,
      weight: 70,
      duration: 5,
      difficulty: "beginner",
      image_url: "https://example.com/push-up.jpg",
      video_url: "https://example.com/push-up-video.mp4",
      owner_id: "user-1"
    },
    {
      id: "2",
      title: "Squat",
      description: "A basic exercise for lower body strength",
      category: "strength",
      muscle_group: "legs",
      duration: 8,
      difficulty: "beginner",
      image_url: "https://example.com/squat.jpg",
      video_url: "https://example.com/squat-video.mp4",
      owner_id: "user-1"
    },
    {
      id: "3",
      title: "Plank",
      description: "A core stability exercise",
      category: "core",
      muscle_group: "core",
      duration: 10,
      difficulty: "intermediate",
      image_url: "https://example.com/plank.jpg",
      video_url: "https://example.com/plank-video.mp4",
      owner_id: "user-1"
    }
  ]);

  // State for loading and errors
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Create exercise mutation - similar to login mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseData: Omit<Exercise, 'id' | 'owner_id'>) => {
      console.log("Creating exercise with data:", exerciseData)
      
      // TODO: Replace with actual API call
      // const response = await ExercisesService.createExercise(exerciseData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newExercise: Exercise = {
        ...exerciseData,
        id: `exercise-${Date.now()}`,
        owner_id: currentUser?.id || "unknown"
      };
      
      console.log("Exercise created:", newExercise)
      return newExercise;
    },
    onSuccess: (newExercise) => {
      console.log("Exercise creation successful:", newExercise)
      
      // Add to local state
      setExercises(prev => [...prev, newExercise]);
      
      // Invalidate and refetch exercises query if using react-query
      // queryClient.invalidateQueries({ queryKey: ['exercises'] })
      
      setError(null);
    },
    onError: (error) => {
      console.error("Exercise creation error:", error)
      setError("Failed to create exercise. Please try again.");
    },
  })

  // Fetch exercises query - similar to how login handles data
  // TODO: Uncomment when API is ready
  /*
  const { data: exercisesData, isLoading: isQueryLoading, error: queryError } = useQuery({
    queryKey: ['exercises', page],
    queryFn: () => ExercisesService.getExercises({ page }),
    placeholderData: (prevData) => prevData,
  })
  */

  const resetError = () => {
    setError(null);
  }

  const handleAddExercise = async (exerciseData: Exercise) => {
    if (createExerciseMutation.isPending) return;

    resetError();

    console.log("Adding exercise:", exerciseData);

    try {
      // Extract the data needed for creation (remove id and owner_id)
      const { id, owner_id, ...createData } = exerciseData;
      await createExerciseMutation.mutateAsync(createData);
    } catch (error) {
      console.error("Error adding exercise:", error);
      // Error is handled by mutation onError
    }
  };

  const handlePlay = (exercise: Exercise) => {
    console.log("Playing exercise:", exercise);
    // Handle play functionality if needed
  };

  return (
    <Container maxW="full" p={1} >
      <Heading size="lg" pt={12}>
        Your exercises
      </Heading>

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error}
        </Text>
      )}

      <ExercisesList 
        onPlay={handlePlay} 
        routeFullPath={Route.fullPath}
        exercises={exercises}
        showAddExercise={true}
        onAddExercise={handleAddExercise}
      />
    </Container >
  )
}
