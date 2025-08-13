import {
  EmptyState,
  Grid,
  VStack,
  Flex,
  Heading,
  HStack,
  Text,
  Image,
  Box,
  Icon,
  IconButton
} from "@chakra-ui/react"
import React from "react"
import { FiSearch } from "react-icons/fi"

import PendingExercises from "@/components/Pending/PendingExercises"
import ExerciseCard from "@/components/Exercises/exercise-card"
import CustomDrawer from "@/components/Common/CustomDrawer"
import AddExerciseDrawer from "@/components/Exercises/add-exercise-drawer"
import useAuth from "@/hooks/useAuth"

import { IoAddCircleSharp } from "react-icons/io5";

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

interface ExercisesListProps {
  onPlay?: (exercise: Exercise) => void;
  routeFullPath: string;
  exercises: Exercise[];
  showAddExercise: boolean;
  onAddExercise?: (exercise: Exercise) => void;
}

function ExercisesList({ onPlay, exercises, showAddExercise = false, onAddExercise }: ExercisesListProps) {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerContent, setDrawerContent] = React.useState<React.ReactNode>(null);
  const { user: currentUser } = useAuth()

  // TODO: Remove this simulation
  if (currentUser) {
    (currentUser as any).role = "trainer";
  }

  const newExercise = () => {
    setDrawerContent(
      <AddExerciseDrawer
        onSubmit={onSubmitNewExercise}
        onCancel={() => setDrawerOpen(false)}
      />
    );
    setDrawerOpen(true);
  };

  const onSubmitNewExercise = (data: any) => {
    console.log("New exercise data:", data);
    
    // Create a complete exercise object with required fields
    const newExercise: Exercise = {
      id: `temp-${Date.now()}`, // Temporary ID until backend creates real one
      title: data.title,
      description: data.description || "",
      category: data.category,
      muscle_group: data.muscle_group,
      reps: data.reps,
      sets: data.sets,
      weight: data.weight,
      duration: data.duration,
      difficulty: data.difficulty,
      image_url: data.image_url || "",
      video_url: data.video_url || "",
      owner_id: currentUser?.id || "unknown", // Use current user ID
    };

    // Call the parent's onAddExercise function if provided
    if (onAddExercise) {
      onAddExercise(newExercise);
    }
    
    // TODO: Implement API call to create exercise
    // const createdExercise = await createExercise(newExercise);
    
    setDrawerOpen(false);
  };

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
        {showAddExercise && currentUser && (currentUser as any).role === "trainer" && (
          <Box
            bg="gray.900"
            borderRadius="2xl"
           
            overflow="hidden"
            boxShadow="2xl"
            position="relative"
            color="white"
            aspectRatio="1/1"
            w="40vw"
            mb={2}
            border="solid" 
          >
            <IconButton
              aria-label="Play Exercise"
              w="100px"
              h="100px"
              position="absolute"
              top="50%"
              right="50%"
              transform="translate(50%, -50%)"
              bg="white"
              borderRadius="full"
              onClick={() => newExercise()}
            >
              <IoAddCircleSharp color="purple" style={{ height: "95px", width: "95px" }} />
            </IconButton>
            
          </Box>
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