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
import { useQueryClient } from "@tanstack/react-query"

import AddExercise from "@/components/Exercises/AddExercise"
import ExercisesList from "@/components/Exercises/exercise-list"
import CustomDrawer from "@/components/Common/CustomDrawer"
import type { UserPublic } from "@/client"



const exercises = [{
  id: "1",
  title: "Push Up",
  description: "A basic exercise for upper body strength",
  category: "strength",
  muscle_group: "chest",
  equipment: "none",
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
  equipment: "none",
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
  equipment: "none",
  duration: 10,
  difficulty: "intermediate",
  image_url: "https://example.com/plank.jpg",
  video_url: "https://example.com/plank-video.mp4",
  owner_id: "user-1"
}]

export const Route = createFileRoute("/_layout/exercises")({
  component: Exercises,
})

function Exercises() {
  

  

  const handlePlay = (exercise: any) => {
    // Handle play functionality if needed
    console.log("Playing exercise:", exercise);
  };

  return (
    <Container maxW="full" p={1} >
      <Heading size="lg" pt={12}>
        Your exercises
      </Heading>

      <ExercisesList 
        onPlay={handlePlay} 
        routeFullPath={Route.fullPath}
        exercises={exercises}
        showAddExercise={true}
      />
    </Container >
  )
}
