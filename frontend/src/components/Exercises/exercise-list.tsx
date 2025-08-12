import {
  EmptyState,
  Grid,
  VStack,
  Flex,
  Heading,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react"
import React from "react"
import { useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"

import PendingExercises from "@/components/Pending/PendingExercises"
import ExerciseCard from "@/components/Exercises/exercise-card"
import CustomDrawer from "@/components/Common/CustomDrawer"
import useAuth from "@/hooks/useAuth"

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  muscle_group: string;
  equipment: string;
  reps?: number;
  sets?: number;
  weight?: number;
  duration: number;
  difficulty: string;
  image_url: string;
  video_url: string;
  owner_id: string;
}

interface ExercisesListProps {
  onPlay?: (exercise: Exercise) => void;
  routeFullPath: string;
  exercises: Exercise[];
  showAddExercise: boolean;
}

function ExercisesList({ onPlay, exercises, showAddExercise=false }: ExercisesListProps) {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerContent, setDrawerContent] = React.useState<React.ReactNode>(null);
  const { user: currentUser } = useAuth()

  currentUser.role="trainer"

  const handlePlay = (exercise: any) => {
    setDrawerContent(
      <Flex direction="column" gap={4} p={4}>
        <Heading>{exercise.title}</Heading>
        <HStack gap={3} w="80%" justifyContent="right">
          {exercise.duration && (
            <Text w="1/3" fontSize="sm" color="purple.400">{exercise.duration} Mins</Text>
          )}
          {exercise.reps && (
            <Text w="1/3" fontSize="sm" color="lime">{exercise.sets} x {exercise.reps} </Text>
          )}
          {exercise.weight && (
            <Text w="1/3" fontSize="sm" color="orange.400">{exercise.weight}KG</Text>
          )}
        </HStack>
        <Flex bg="purple.500" p={6} justify="center" >
          <Image borderRadius="4xl" bg="yellow" src={exercise.image_url} alt={exercise.title} aspectRatio="6/8" w="95%" />
        </Flex>
        <Text>
          {exercise.description}
        </Text>
      </Flex>
    );
    setDrawerOpen(true);
    
    // Also call the parent onPlay if provided
    if (onPlay) {
      onPlay(exercise);
    }
  };

  /*
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getExercisesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })
  */

  //const exercises = data?.data.slice(0, PER_PAGE) ?? []
  //const count = data?.count ?? 0

  //mockup data
  const isLoading = false; // Simulating loading state

  if (isLoading) {
    return <PendingExercises />
  }

  if (exercises.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any exercises yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new exercise to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <CustomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} element={drawerContent} />
      <Grid templateColumns="repeat(2, 1fr)" gap="3">
        {showAddExercise && currentUser.role === "trainer" && (
          <ExerciseCard 
            key="add-exercise" 
            exercise={{ id: "add-exercise", title: "Add Exercise", description: "Add a new exercise", image_url: "", video_url: "" }} 
            size="40vw"
            onPlay={handlePlay} 
          />
        )}
        {exercises?.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            size="40vw"
            onPlay={handlePlay} 
            
          />
        ))}
      </Grid>
    </>
  )
}

export default ExercisesList