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
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi"

import PendingExercises from "@/components/Pending/PendingExercises"
import ExerciseCard from "@/components/Exercises/exercise-card"
import CustomDrawer from "@/components/Common/CustomDrawer"
import AddUpdateExerciseDrawer from "@/components/Exercises/add-update-exercise-drawer"
import useAuth from "@/hooks/useAuth"
import { type ExercisePublic } from "@/client"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@chakra-ui/react"

import { IoAddCircleSharp } from "react-icons/io5";

interface ExercisesListProps {
  onPlay?: (exercise: ExercisePublic) => void;
  routeFullPath: string;
  exercises: ExercisePublic[];
  showAddExercise: boolean;
  onAddExercise?: (exercise: ExercisePublic) => void;
  onUpdateExercise?: (exercise: ExercisePublic) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

function ExercisesList({ onPlay, exercises, showAddExercise = false, onAddExercise, onUpdateExercise, onDeleteExercise }: ExercisesListProps) {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerContent, setDrawerContent] = React.useState<React.ReactNode>(null);
  const { user: currentUser } = useAuth()

  // Check if user is trainer or admin using proper typing
  const isTrainerOrAdmin = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "trainer"
  );

  const newExercise = () => {
    setDrawerContent(
      <AddUpdateExerciseDrawer
        mode="add"
        onSubmit={onSubmitNewExercise}
        onCancel={() => setDrawerOpen(false)}
      />
    );
    setDrawerOpen(true);
  };

  const editExercise = (exercise: ExercisePublic) => {
    setDrawerContent(
      <AddUpdateExerciseDrawer
        mode="update"
        exercise={exercise}
        onSubmit={onSubmitUpdateExercise}
        onCancel={() => setDrawerOpen(false)}
      />
    );
    setDrawerOpen(true);
  };

  const onSubmitNewExercise = (data: any) => {
    console.log("New exercise data:", data);
    
    // Call the parent's onAddExercise function if provided
    if (onAddExercise) {
      onAddExercise(data); // Pass the raw form data to parent
    }
        
    setDrawerOpen(false);
  };

  const onSubmitUpdateExercise = (data: any) => {
    console.log("Update exercise data:", data);
    
    // Call the parent's onUpdateExercise function if provided
    if (onUpdateExercise) {
      onUpdateExercise(data); // Pass the raw form data to parent
    }
        
    setDrawerOpen(false);
  };

  const handlePlay = (exercise: any) => {
    setDrawerContent(
      <Flex direction="column" gap={4} p={4} position="relative">
        {/* Action Icons in top right corner */}
        <HStack position="absolute" top="2" right="2" gap={2}>
          {/* Edit Icon */}
          <IconButton
            aria-label="Edit Exercise"
            size="sm"
            bg="gray.800"
            color="white"
            borderRadius="full"
            _hover={{ bg: "gray.700" }}
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen(false); // Close current drawer first
              setTimeout(() => editExercise(exercise), 100); // Small delay to ensure smooth transition
            }}
          >
            <FiEdit />
          </IconButton>

          {/* Delete Icon with Confirmation Dialog */}
          <DialogRoot>
            <DialogTrigger asChild>
              <IconButton
                aria-label="Delete Exercise"
                size="sm"
                bg="red.500"
                color="white"
                borderRadius="full"
                _hover={{ bg: "red.500" }}
                onClick={(e) => e.stopPropagation()}
              >
                <FiTrash2 />
              </IconButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Exercise</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Text>
                  Are you sure you want tdwdadwao delete "{exercise.title}"? This action cannot be undone.
                </Text>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild   >
                  <Button color="green" borderRadius="full" variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <DialogActionTrigger asChild>
                  <Button 
                    bg="red.500"
                    borderRadius="full"
                    onClick={() => {
                      if (onDeleteExercise) {
                        onDeleteExercise(exercise.id);
                      }
                      setDrawerOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </DialogActionTrigger>
              </DialogFooter>
              <DialogCloseTrigger />
            </DialogContent>
          </DialogRoot>
        </HStack>

        <Heading size="lg" text-overflow="clip" color="lime">{exercise.title} </Heading>
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

  return (
    <>
      <CustomDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} element={drawerContent} />
      <Grid templateColumns="repeat(2, 1fr)" gap="3">
        {showAddExercise && isTrainerOrAdmin && (
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
              aria-label="Add Exercise"
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