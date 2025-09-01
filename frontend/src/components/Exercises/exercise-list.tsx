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
  IconButton,
  NumberInput,
  Separator
} from "@chakra-ui/react"
import React from "react"
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi"
import FieldForm from "@/components/Users/FieldForm"

import PendingExercises from "@/components/Pending/PendingExercises"
import ExerciseCard from "@/components/Exercises/exercise-card"
import CustomDrawer from "@/components/Common/CustomDrawer"
import AddUpdateExerciseDrawer from "@/components/Exercises/add-update-exercise-drawer"
import useAuth from "@/hooks/useAuth"
import { type ExercisePublic, UsersService } from "@/client"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiError } from "@/client/core/ApiError"
import { handleError } from "@/utils"
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
  access_from_activity?: boolean;
  selectedDate?: string; // Add selectedDate prop
  onAddExercise?: (exercise: ExercisePublic) => void;
  onUpdateExercise?: (exercise: ExercisePublic) => void;
  onDeleteExercise?: (exerciseId: string) => void;
  performance?: any[];
}

function ExercisesList({ 
  onPlay, 
  exercises, 
  showAddExercise = false, 
  access_from_activity = false, 
  selectedDate,
  onAddExercise, 
  onUpdateExercise, 
  onDeleteExercise,
  performance,
}: ExercisesListProps) {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerContent, setDrawerContent] = React.useState<React.ReactNode>(null);
  const { user: currentUser } = useAuth()
  const [value, setValue] = useState("0")
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient()

  // Helper function to check if the selected date is today
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    
    // Set time to start of day for accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return selectedDate.getTime() === today.getTime();
  };

  // Mutation for updating exercise performance
  const updatePerformanceMutation = useMutation({
    mutationFn: (data: { exercise_id: string; date: string; performance: number }) =>
      UsersService.updateExercisePerformanceApiV1({
        requestBody: data
      }),
    onSuccess: () => {
      // Optionally refresh user data or show success message
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      queryClient.invalidateQueries({ queryKey: ["exercises", "day"] });
    },
    onError: (err: ApiError) => {
      handleError(err);
      console.error("Failed to update exercise performance:", err);
    },
  });

  // Function to get current performance for an exercise on the selected date
  const getCurrentPerformance = (exerciseId: string): string => {
    console.log("Getting current performance for exercise:", exerciseId);
    console.log("Selected date:", selectedDate);
    if (!selectedDate || !currentUser?.exercises) return "1";
    
    // Find the exercise in user's exercises array
    const userExercise = currentUser.exercises.find(ex => ex.id === exerciseId);
    if (!userExercise || !userExercise.performance) return "2";
    
    // Get performance for the selected date
    const performanceValue = userExercise.performance[selectedDate];
    console.log("Current performance value:", performanceValue);
    return performanceValue ? performanceValue.toString() : "0";
  };

    // Helper to get performance for an exercise
  const getPerformanceValue = (exerciseId: string) => {

    if (!performance) return undefined;
    const perfObj = performance.find((ex) => ex.id === exerciseId);
    if (!perfObj || !perfObj.performance) return undefined;
    const dates = Object.keys(perfObj.performance);
    if (dates.length === 0) return undefined;
    // Sort dates as actual dates
    const sortedDates = dates.sort((a, b) => {
      const da = new Date(a);
      const db = new Date(b);
      return da.getTime() - db.getTime();
    });
    const latestDate = sortedDates[sortedDates.length - 1];

    return perfObj.performance[latestDate];
  };

  // Function to update exercise performance
  const updateExercisePerformance = (exerciseId: string, performance: number) => {
    if (!selectedDate) return;

    // Update local currentUser.exercises so UI reflects change immediately
    if (currentUser?.exercises) {
      const updatedExercises = currentUser.exercises.map((ex: any) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            performance: {
              ...(ex.performance || {}),
              [selectedDate]: performance,
            },
          };
        }
        return ex;
      });
      
      currentUser.exercises = updatedExercises;
      setValue(performance.toString());
    }

    // Update local input value for the control
    setInputValues(prev => ({ ...prev, [exerciseId]: String(performance) }));

    updatePerformanceMutation.mutate({
      exercise_id: exerciseId,
      date: selectedDate,
      performance: performance
    });
  };

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
        {isTrainerOrAdmin && (
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
                  Are you sure you want to delete "{exercise.title}"? This action cannot be undone.
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
      )}

        <Heading size="lg" text-overflow="clip" color="white">{exercise.title} </Heading>
        <HStack gap={3} justifyContent="center">
          {exercise.duration && (
            <HStack>
              <VStack gap={1} align="center">
                <Text fontSize={{ sm: "xs", md: "sm" }} color="lime">Duration:</Text>
                <Text fontSize={{ sm: "sm", md: "md" }} color="white" fontWeight="bold">
                  {exercise.duration} Mins
                </Text>
              </VStack>
               <Separator orientation="vertical" height="50px" w="2px" size="md" color="gray.600" />
            </HStack>
          )}
          {exercise.reps && (
            <HStack>
            <VStack gap={1} align="center">
              <Text fontSize={{ sm: "xs", md: "sm" }} color="lime">Sets & Reps:</Text>
              <Text fontSize={{ sm: "sm", md: "md" }} color="white" fontWeight="bold">
                {exercise.sets} x {exercise.reps}
              </Text>
            </VStack>
            <Separator orientation="vertical" height="50px" w="2px" size="md" color="gray.600" />
          </HStack>

          )}
          {access_from_activity && isToday(selectedDate) && (
            <VStack gap={1} align="center">
              <Text fontSize="xs" color="lime">Performance:</Text>
              <NumberInput.Root 
                size="sm" 
                defaultValue={getCurrentPerformance(exercise.id)}
                key={exercise.id}
                min={0} 
                max={1000}
                width="80px"
                onValueChange={(e) => {
                 
                  // Call API to update performance for today
                  updateExercisePerformance(exercise.id, parseFloat(e.value));
                   
                }}
              >
                <NumberInput.Input 
                  bg="gray.700" 
                  border="1px solid" 
                  borderColor="gray.600"
                  color="white"
                  textAlign="center"
                />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger 
                    bg="gray.600" 
                    color="white"
                    _hover={{ bg: "gray.500" }}
                  />
                  <NumberInput.DecrementTrigger 
                    bg="gray.600" 
                    color="white"
                    _hover={{ bg: "gray.500" }}
                  />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>
          )}
          {access_from_activity && !isToday(selectedDate) && ( 
            <VStack gap={1} align="center"> 
              <Text fontSize={{ sm: "xs", md: "sm" }} color="lime">Performance:</Text>
              <Text fontSize={{ sm: "sm", md: "md" }} color="white" fontWeight="bold">
                {getCurrentPerformance(exercise.id)}
              </Text>
            </VStack>
          )}
          {!access_from_activity && performance && (
            <VStack gap={1} align="center" >
              <Text fontSize={{ sm: "xs", md: "sm" }} color="lime">Last Performance:</Text>
              <Text fontSize={{ sm: "sm", md: "md" }} color="white" fontWeight="bold">
                {getCurrentPerformance(exercise.id) ?? "-"}
              </Text>
            </VStack>
          )}

          
        </HStack>
        <Flex bg="gray.800" p={6} justify="center" w="parent" mx={-4} >
          <Image borderRadius="4xl" bg="gray.800"
            src={exercise.image_url || "./assets/images/placeholder.png"}
            alt={exercise.title}
            aspectRatio="6/8"
            w="95%"
            maxW="260px" />
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
      <Grid 
      templateColumns={{ sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap="3">
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
            size={{ sm: "40vw", md: "260px" }}
            onPlay={handlePlay}
          />
          
        ))}
      </Grid>
    </>
  )
}

export default ExercisesList