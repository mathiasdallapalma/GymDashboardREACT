import { createFileRoute } from '@tanstack/react-router'
import {
  Container,
  Flex,
  Heading,
  HStack,
  Box,
  Text,
  Icon,
  Button,
  Image,
  IconButton,
  NativeSelect,
  SegmentGroup,
  Field,
  Input,
  CloseButton,
  Separator,
  Center,

} from "@chakra-ui/react"
import React, { useState } from "react"
import { FaEdit, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { IoAddCircleSharp } from "react-icons/io5"
import { z } from "zod"
import { FiTrash2 } from "react-icons/fi"
import ExercisesList from "@/components/Exercises/exercise-list"
import CustomDrawer from "@/components/Common/CustomDrawer"
import GoBack from "@/components/ui/goback"
import useCustomToast from "@/hooks/useCustomToast"
import useAuth from "@/hooks/useAuth"

import { type ActivityCreate, ActivitiesService, type ActivityPublic, UsersService, type UserUpdateMe, type UserActivity } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import { handleError } from "@/utils"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"

const exercisesSearchSchema = z.object({
  page: z.number().catch(1),
})

function getActivitiesQueryOptions(userId: string) {
  return {
    queryFn: () =>
      ActivitiesService.readActivitiesApiV1({ userId }), // Load activities for specific user
    queryKey: ["activities", "user", userId],
  }
}

function getExercisesForDayQueryOptions(userId: string, date: string) {
  return {
    queryFn: () =>
      ActivitiesService.getExercisesForDayApiV1({ userId, date }),
    queryKey: ["exercises", "day", userId, date],
  }
}

export const Route = createFileRoute("/_layout/activity")({
  component: Activities,
  validateSearch: (search) => exercisesSearchSchema.parse(search),
})

function Activities() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerContent, setDrawerContent] = React.useState<React.ReactNode>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().toDateString());
  const [addActivity, setAddActivity] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const { user: currentUser } = useAuth()
  const today = new Date();

  const [activities, setActivities] = useState<ActivityPublic[]>([])

  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  // Fetch all activities from API
  const { data: activitiesData, isLoading: activitiesIsLoading } = useQuery({
    ...getActivitiesQueryOptions(currentUser?.id || ""),
    placeholderData: (prevData) => prevData,
    enabled: !!currentUser?.id, // Only run query if user ID exists
  })

  // Fetch exercises for the selected day
  const { data: dayExercisesData, isLoading: exercisesIsLoading } = useQuery({
    ...getExercisesForDayQueryOptions(currentUser?.id || "", selectedDay),
    placeholderData: (prevData) => prevData,
    enabled: !!currentUser?.id && !!selectedDay,
  })

  // Update local state when query data changes
  React.useEffect(() => {
    if (activitiesData?.data) {
      setActivities(activitiesData.data)
    }
  }, [activitiesData?.data])

  // State for errors
  const [error, setError] = React.useState<string | null>(null);

  // Assign activity to day mutation
  const assignActivityMutation = useMutation({
    mutationFn: ({ activityId, date }: { activityId: string, date: string }) =>
      ActivitiesService.assignActivityToUserApiV1({ activityId, date }),
    onSuccess: () => {
      const selectedActivity = activities.find(activity => activity.id === selectedActivityId)
     
      setSelectedActivityId("")
      setAddActivity(false)
      // Refresh exercises for the day and user data
      console.log("selectedDay:", selectedDay)
      queryClient.invalidateQueries({ queryKey: ["exercises", "day", currentUser?.id, selectedDay] })
      queryClient.invalidateQueries({ queryKey: ["users", "me"] })
    },
    onError: (err: ApiError) => {
      handleError(err)
      setError("Failed to assign activity. Please try again.")
    },
  })

  const handleAssignActivityToDay = () => {
    if (selectedActivityId) {
      assignActivityMutation.mutate({
        activityId: selectedActivityId,
        date: selectedDay
      })
    }
  }

  // Helper function to check if date is today or future
  const isDateTodayOrFuture = (dateString: string) => {
    const selectedDate = new Date(dateString)
    const today = new Date()

    // Set time to start of day for accurate comparison
    selectedDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    return selectedDate >= today
  }

  // Get start of the week (Monday as first day)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sunday) - 6 (Saturday)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Create array of days in the week
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const goToPreviousWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
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
        <Text>Modifica qua</Text>
      </Flex>
    );
    setDrawerOpen(true);
  };

  // Unassign activity mutation
  const unassignActivityMutation = useMutation({
    mutationFn: ({ activityId, date }: { activityId: string, date: string }) =>
      ActivitiesService.unassignActivityFromUserApiV1({ activityId, date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises", "day", currentUser?.id, selectedDay] })
      queryClient.invalidateQueries({ queryKey: ["users", "me"] })
      showSuccessToast("Activity unassigned successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
      setError("Failed to unassign activity. Please try again.")
    },
  })

  return (
    <Container maxW="full" p={1} >
      <GoBack />


      <HStack justify="center" align="center" pt={12} mx={-3}>
        <IconButton
          aria-label="Previous Week"
          onClick={goToPreviousWeek}
          borderRadius="full"
          bg="whiteAlpha.300"
          size="xs"
        >
          <FaChevronLeft />
        </IconButton>

        <SegmentGroup.Root
          value={selectedDay}
          onValueChange={(e) => {
            console.log("Day selected:", e.value);
            setSelectedDay(e.value);
          }}
          height="fit-content"
          gap="3%"
          w={{base:"85%",md:"50%"}}
          justifyContent={"center"}
        >
          <SegmentGroup.Indicator />
          {days.map((day, i) => (
            <SegmentGroup.Item
              value={day.toDateString()}
              key={i}
              w="11.8%"
              maxW={{ sm: "50px", md: "65px" }}
              aspectRatio={{ sm: "6/1", md: "10/1" }}
              px={0}
              pt={2}
              bg="gray.700"
              border="2px solid"
              borderColor={
                selectedDay === day.toDateString()
                  ? "white"
                  : "gray.500"
              }
              borderRadius="lg"
              transform={selectedDay === day.toDateString() ? "scale(1.2)" : "scale(1)"}
              transition="all 0.2s"
            >
              <SegmentGroup.ItemText w="100%">
                <Flex gap={0.5} justify="center" align="center">
                  <Text
                    fontSize="base"
                    fontWeight="bold"
                    color={
                      day.toDateString() === today.toDateString()
                        ? "lime"
                        : "purple.300"
                    }
                    _before={{ bg: "lime" }}
                  >
                    {day.getDate()}
                  </Text>
                  {currentUser?.activities && currentUser.activities.some((a: any) => a?.date === day.toDateString()) && (
                    <Box
                      h="3px"
                      w="3px"
                      ml={1}
                      mr={-1}
                      bg="red.500"
                      borderRadius="full"
                      boxShadow="0px 0px 4px 2px rgba(255,46,46,0.75)"
                    />
                  )}
                </Flex>
                <Text
                  color={
                    day.toDateString() === today.toDateString()
                      ? "lime"
                      : "purple.400"
                  }
                  bg="gray.600"
                  borderBottomRadius="lg"
                  fontSize="xs"
                >
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
              </SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          ))}
        </SegmentGroup.Root>

        <IconButton
          aria-label="Next Week"
          onClick={goToNextWeek}
          borderRadius="full"
          bg="whiteAlpha.300"
          size="xs"
        >
          <FaChevronRight />
        </IconButton>
      </HStack>

      {error && (
        <Text color="red.500" fontSize="sm" mt={4}>
          {error}
        </Text>
      )}

      {/* Only show Add Activity button when no activity is assigned and not in add mode */}
      {!addActivity && (!dayExercisesData || !dayExercisesData.activity) && !exercisesIsLoading && isDateTodayOrFuture(selectedDay) && ( 
        <Button
          bg="transparent"
          w="full"
          mt={8}
          onClick={() => setAddActivity(!addActivity)}
        >
          <Box bg="white"
            borderRadius="full"
            w="50px" h="50px"
            display="flex"
            alignItems="center"
            justifyContent="center">
            <Icon
              as={IoAddCircleSharp}
              boxSize={12}
              color="purple"
              cursor="pointer"
            />
          </Box>
        </Button>
      )}

      {/* Only show Add Activity form when no activity is assigned */}
      {addActivity && (!dayExercisesData || !dayExercisesData.activity) && isDateTodayOrFuture(selectedDay) && ( 

        <Flex w="full" justify="center" align="center">
        <Flex flexDirection="column" gap={3} p={4} bg="gray.800" borderRadius="md" mt={8}
        w={{base:"full",md:"60%"}}
        justifySelf={"center"}
        >
          <Text color="white" fontSize="lg" mb={2}>
            Add Activity for {new Date(selectedDay).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </Text>

          <Flex justify="space-between" align="center">
            <Field.Root flex="1" mr={4}>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  bg="black"
                  border="1px solid"
                  borderColor="gray.600"
                  color="white"
                >
                  <option value="">Select existing activity</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <Button
              bg="blue.500"
              size="sm"
              mr={2}
              rounded="full"
              onClick={handleAssignActivityToDay}
              disabled={!selectedActivityId}
              loading={assignActivityMutation.isPending}
            >
              Assign Activity
            </Button>
            <CloseButton color="white" onClick={() => setAddActivity(false)} />
          </Flex>

          <Separator borderColor="gray.600" size="md" />
        </Flex>
        </Flex>
      )}

      {/* Content for selected day */}
      <Box>
        {exercisesIsLoading ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">Loading exercises...</Text>
          </Box>
        ) : dayExercisesData && dayExercisesData.activity ? (
          <Flex flexDirection="column" gap={3} p={4} bg="gray.800" borderRadius="md" mt={4} w="parent">
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold" color="white">
                {dayExercisesData.activity?.title}
              </Text>

              <HStack gap={2}>
                {isDateTodayOrFuture(selectedDay)  && ( 
                  <IconButton
                    aria-label="Delete Activity"
                    size="sm"
                    bg="transparent"
                    border="1px solid"
                    borderColor="red.500"
                    color="red.500"
                    onClick={() => unassignActivityMutation.mutate({ activityId: dayExercisesData.activity.id, date: selectedDay })}
                  >
                    <FiTrash2 />
                  </IconButton>
                )}
              </HStack>
            </Flex>

            <Separator borderColor="gray.600" />
            
            
            <ExercisesList
              onPlay={handlePlay}
              routeFullPath={Route.fullPath}
              exercises={dayExercisesData.exercises || []}
              showAddExercise={false}
              access_from_activity={true}
              selectedDate={selectedDay}
            />
          </Flex>
        ) : (
          <Box textAlign="center" py={12}>
            <Heading size="md" color="gray.400" mb={2}>
              No Activities Planned
            </Heading>
            
            <Text color="gray.500" mt={2}>
              This day has no scheduled exercises.
            </Text>
          </Box>
        )}
      </Box>



    </Container>
  )
}