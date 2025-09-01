import { createFileRoute, Link } from '@tanstack/react-router'
import {
    Container,
    Flex,
    NativeSelect,
    Heading,
    Separator,
    Text,
    IconButton,
    VStack,
    Table,
    Button,
    Box,
    Icon,
    Input,
    Field,
    CloseButton,
    Select
} from '@chakra-ui/react'
import GoBack from '@/components/ui/goback'
import { useState } from 'react'
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
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
import React from "react"
import { type ActivityCreate, ActivitiesService, type ActivityPublic, UsersService, type UserPublic } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import { handleError } from "@/utils"


import { IoAddCircleSharp } from "react-icons/io5"
import { FiTrash2 } from "react-icons/fi"
import { FaEdit } from "react-icons/fa"
import { ExercisesService } from "@/client"

export const Route = createFileRoute('/_layout/user/$userId/activity')({
    component: UserActivityPage,
})

function getExercisesQueryOptions() {
    return {
        queryFn: () =>
            ExercisesService.readExercisesApiV1(), // Load up to 1000 exercises
        queryKey: ["exercises", "all"],
    }
}

function getActivitiesQueryOptions(userId: string) {
    return {
        queryFn: () =>
            ActivitiesService.readActivitiesApiV1({ userId }), // Load activities for specific user
        queryKey: ["activities", "user", userId],
    }
}

function getUserQueryOptions(userId: string) {
    return {
        queryFn: () =>
            UsersService.readUserByIdApiV1({ userId }), // Load user details
        queryKey: ["user", userId],
    }
}

function UserActivityPage() {
    const { userId } = Route.useParams<{ userId: string }>()
    const [addActivity, setAddActivity] = useState(false)
    const [newActivityTitle, setNewActivityTitle] = useState("")
    const [selectedExercises, setSelectedExercises] = useState<Record<string, string>>({}) // Track selected exercise ID as string

    const [activities, setActivities] = useState<ActivityPublic[]>([])

    const queryClient = useQueryClient()


    // Fetch all activities from API
    const { data: activitiesData, isLoading: activitiesIsLoading } = useQuery({
        ...getActivitiesQueryOptions(userId),
        placeholderData: (prevData) => prevData,
    })

    // Fetch user details
    const { data: userData, isLoading: userIsLoading } = useQuery({
        ...getUserQueryOptions(userId),
        placeholderData: (prevData) => prevData,
    })

    // State for errors
    const [error, setError] = React.useState<string | null>(null);

    // Update local state when query data changes
    React.useEffect(() => {
        if (activitiesData?.data) {
            setActivities(activitiesData.data)
        }
    }, [activitiesData?.data])

    // Fetch all exercises from API
    const { data: exercisesData, isLoading: exercisesIsLoading } = useQuery({
        ...getExercisesQueryOptions(),
        placeholderData: (prevData) => prevData,
    })

    const exercises = exercisesData?.data ?? []

    // Create activity mutation with optimistic updates
    const createActivityMutation = useMutation({
        mutationFn: (data: ActivityCreate) =>
            ActivitiesService.createActivityApiV1({ requestBody: data }),
        onMutate: async (newActivity) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["activities", "user", userId] })

            // Snapshot the previous state for rollback
            const previousActivities = [...activities]

            // Create optimistic activity
            const optimisticActivity: ActivityPublic = {
                id: `temp-${Date.now()}`, // Temporary ID
                title: newActivity.title,
                exercises: newActivity.exercises || [],
                user_id: userId,
            }

            // Optimistically update local state
            setActivities(prev => [optimisticActivity, ...prev])

            return { previousActivities }
        },
        onSuccess: (newActivity) => {
            setNewActivityTitle("")
            setAddActivity(false)
        },
        onError: (err: ApiError, _variables, context) => {
            handleError(err)
            setError("Failed to create activity. Please try again.")
            // Roll back to the previous state
            if (context?.previousActivities) {
                setActivities(context.previousActivities)
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we have correct data
            queryClient.invalidateQueries({ queryKey: ["activities", "user", userId] })
        },
    })

    // Delete activity mutation with optimistic updates
    const deleteActivityMutation = useMutation({
        mutationFn: (activityId: string) =>
            ActivitiesService.deleteActivityApiV1({ id: activityId }),
        onMutate: async (activityId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["activities", "user", userId] })

            // Snapshot the previous state for rollback
            const previousActivities = [...activities]

            // Optimistically remove the activity from local state
            setActivities(prev => prev.filter(activity => activity.id !== activityId))

            return { previousActivities }
        },
        onError: (err: ApiError, _variables, context) => {
            handleError(err)
            setError("Failed to delete activity. Please try again.")
            // Roll back to the previous state
            if (context?.previousActivities) {
                setActivities(context.previousActivities)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["activities", "user", userId] })
        },
    })

    // Add exercise to activity mutation with optimistic updates
    const addExerciseMutation = useMutation({
        mutationFn: ({ activityId, exerciseId }: { activityId: string, exerciseId: string }) =>
            ActivitiesService.addExerciseToActivityApiV1({ id: activityId, exerciseId }),
        onMutate: async ({ activityId, exerciseId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["activities", "user", userId] })

            // Snapshot the previous state for rollback
            const previousActivities = [...activities]

            // Optimistically add the exercise to the activity in local state
            setActivities(prev =>
                prev.map(activity => {
                    if (activity.id === activityId) {
                        const currentExercises = activity.exercises || []
                        // Add exercise if not already present
                        if (!currentExercises.includes(exerciseId)) {
                            return {
                                ...activity,
                                exercises: [...currentExercises, exerciseId]
                            }
                        }
                    }
                    return activity
                })
            )

            return { previousActivities }
        },
        onError: (err: ApiError, _variables, context) => {
            handleError(err)
            setError("Failed to add exercise. Please try again.")
            // Roll back to the previous state
            if (context?.previousActivities) {
                setActivities(context.previousActivities)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["activities", "user", userId] })
        },
    })

    // Remove exercise from activity mutation with optimistic updates
    const removeExerciseMutation = useMutation({
        mutationFn: ({ activityId, exerciseId }: { activityId: string, exerciseId: string }) =>
            ActivitiesService.removeExerciseFromActivityApiV1({ id: activityId, exerciseId }),
        onMutate: async ({ activityId, exerciseId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["activities", "user", userId] })

            // Snapshot the previous state for rollback
            const previousActivities = [...activities]

            // Optimistically remove the exercise from the activity in local state
            setActivities(prev =>
                prev.map(activity => {
                    if (activity.id === activityId) {
                        const currentExercises = activity.exercises || []
                        return {
                            ...activity,
                            exercises: currentExercises.filter((id: string) => id !== exerciseId)
                        }
                    }
                    return activity
                })
            )

            return { previousActivities }
        },
        onError: (err: ApiError, _variables, context) => {
            handleError(err)
            setError("Failed to remove exercise. Please try again.")
            // Roll back to the previous state
            if (context?.previousActivities) {
                setActivities(context.previousActivities)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["activities", "user", userId] })
        },
    })

    const handleAddActivity = () => {
        if (newActivityTitle.trim()) {
            const activityData: ActivityCreate = {
                title: newActivityTitle,
                exercises: [], // Start with empty exercises
                user_id: userId
            }
            createActivityMutation.mutate(activityData)
        }
    }

    const handleDeleteActivity = (activityId: string) => {
        deleteActivityMutation.mutate(activityId)
    }

    const handleAddExercise = (activityId: string) => {
        const selectedExerciseId = selectedExercises[activityId]
        if (selectedExerciseId) {
            addExerciseMutation.mutate({
                activityId,
                exerciseId: selectedExerciseId
            })
            // Clear the selection for this activity
            setSelectedExercises(prev => ({ ...prev, [activityId]: "" }))
        }
    }

    const handleDeleteExercise = (activityId: string, exerciseId: string) => {
        removeExerciseMutation.mutate({
            activityId,
            exerciseId
        })
    }

    const handleExerciseSelectionChange = (activityId: string, exerciseId: string) => {
        setSelectedExercises(prev => ({ ...prev, [activityId]: exerciseId }))
    }

    return (
        <Container maxW="full" p={4}>
            <GoBack />
            
            <Flex justify="flex-end" mb={-4}>
                <Link to="/exercises" style={{ textDecoration: "none" }}>
                    <Button
                        variant="ghost"
                        fontSize="sm"
                        fontWeight="bold"
                        color="lime"
                        display="inline-flex"
                        alignItems="center"
                        gap={2}
                        _hover={{ bg: "whiteAlpha.200" }}
                    >
                        Manage Exercises<Icon as={FaEdit} boxSize={4} color="lime" position="relative" bottom="3px" />
                    </Button>
                </Link>
            </Flex>

            <VStack gap={4} align="start" pt={12}>
                <Heading size="lg" color="white">
                    {userIsLoading ? (
                        "Loading user information..."
                    ) : userData ? (
                        `Activities for ${userData.full_name}`
                    ) : (
                        "User Activity"
                    )}
                </Heading>

             
            </VStack>

            <VStack gap={6} align="stretch" mt={2}>
                {error && (
                    <Text color="red.500" fontSize="sm" mt={2}>
                        {error}
                    </Text>
                )}

                {activitiesIsLoading ? (
                    <Text color="white">Loading activities...</Text>
                ) : (
                    activities.map(activity => (
                        <Flex key={activity.id} flexDirection="column" gap={3} p={4} bg="gray.800" borderRadius="md">
                            <Flex justify="space-between" align="center">
                                <Text fontSize="lg" fontWeight="bold" color="white">
                                    {activity.title}
                                </Text>


                                <DialogRoot>
                                    <DialogTrigger asChild>
                                        <IconButton
                                            aria-label="Delete Activity"
                                            size="sm"
                                            bg="transparent"
                                            border="1px solid"
                                            color="red.500"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FiTrash2 />
                                        </IconButton>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Activity</DialogTitle>
                                        </DialogHeader>
                                        <DialogBody>
                                            <Text>
                                                Are you sure you want to delete "{activity.title}"? This action cannot be undone.
                                            </Text>
                                        </DialogBody>
                                        <DialogFooter>
                                            <DialogActionTrigger asChild>
                                                <Button color="green.700" borderColor="green.700" borderRadius="full" variant="outline">Cancel</Button>
                                            </DialogActionTrigger>
                                            <DialogActionTrigger asChild>
                                                <Button
                                                    bg="red.500"
                                                    borderRadius="full"
                                                    onClick={() => {
                                                        handleDeleteActivity(activity.id);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </DialogActionTrigger>
                                        </DialogFooter>
                                        <DialogCloseTrigger color="white" />
                                    </DialogContent>
                                </DialogRoot>
                            </Flex>

                            <Separator borderColor="gray.600" />

                            <Table.Root size="sm" striped>
                                <Table.Body>
                                    {/* Show current exercises with names */}
                                    {activity.exercises?.map((exerciseId, index) => {
                                        const exercise = exercises.find(ex => ex.id === exerciseId)
                                        return (
                                            <Table.Row key={`${activity.id}-${exerciseId}-${index}`}>
                                                <Table.Cell color="white">
                                                    {exercise ? exercise.title : `Exercise ID: ${exerciseId}`}
                                                </Table.Cell>
                                                <Table.Cell w="50px">
                                                    <IconButton
                                                        aria-label="Delete Exercise"
                                                        size="xs"
                                                        bg="transparent"
                                                        color="red.500"
                                                        onClick={() => handleDeleteExercise(activity.id, exerciseId)}
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })}
                                    <Table.Row>
                                        <Table.Cell colSpan={2}>
                                            <Flex gap={2} align="center">
                                                <Field.Root flex="1">
                                                    <NativeSelect.Root>
                                                        <NativeSelect.Field
                                                            value={selectedExercises[activity.id] || ""}
                                                            onChange={(e) => handleExerciseSelectionChange(activity.id, e.target.value)}
                                                        >
                                                            <option value="">Select an exercise</option>
                                                            {exercises.map(exercise => (
                                                                <option key={exercise.id} value={exercise.id}>
                                                                    {exercise.title}
                                                                </option>
                                                            ))}
                                                        </NativeSelect.Field>
                                                        <NativeSelect.Indicator />
                                                    </NativeSelect.Root>
                                                </Field.Root>
                                                <Button
                                                    bg="transparent"
                                                    w="50px"
                                                    onClick={() => handleAddExercise(activity.id)}
                                                    disabled={!selectedExercises[activity.id]}
                                                    loading={addExerciseMutation.isPending}


                                                >
                                                    <Box bg="white"
                                                        borderRadius="full"
                                                        w="35px" h="35px"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center">
                                                        <Icon
                                                            as={IoAddCircleSharp}
                                                            boxSize={9}
                                                            color="purple"
                                                            cursor="pointer"
                                                        />
                                                    </Box>
                                                </Button>
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table.Root>
                        </Flex>
                    ))
                )}
            </VStack>

            {!addActivity && (
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
                </Button>)}

            {addActivity && (
                <Flex flexDirection="column" gap={3} p={4} bg="gray.800" borderRadius="md" mt={4}>
                    <Flex justify="space-between" align="center">
                        <Field.Root flex="1" mr={4}>
                            <Input
                                placeholder="Activity Title"
                                value={newActivityTitle}
                                onChange={(e) => setNewActivityTitle(e.target.value)}
                                bg="black"
                                border="1px solid"
                                borderColor="gray.600"
                                color="white"
                            />
                        </Field.Root>
                        <Button
                            bg="purple.500"
                            size="sm"
                            mr={2}
                            rounded="full"
                            onClick={handleAddActivity}
                        >
                            Save Activity
                        </Button>
                        <CloseButton color="white" onClick={() => setAddActivity(false)} />
                    </Flex>

                    <Separator borderColor="gray.600" size="md" />

                </Flex>
            )}


        </Container>
    )
}