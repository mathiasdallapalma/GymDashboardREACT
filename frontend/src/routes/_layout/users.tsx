import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  Image,
  EmptyState,
  VStack,
} from "@chakra-ui/react"
import React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { FiSearch } from "react-icons/fi"




import PendingUsers from "@/components/Pending/PendingUsers"
import type { UserPublic } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { type UserCreate, UsersService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import { handleError } from "@/utils"
import GoBack from "@/components/ui/goback"
import SortComponent from "@/components/ui/sort-component"



function getUsersQueryOptions() {
  return {
    queryFn: () =>
      UsersService.readUsersApiV1(), 
    queryKey: ["users", "all"],
  }
}

interface User {
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



export const Route = createFileRoute("/_layout/users")({
  component: Users,
  validateSearch: (search) => usersSearchSchema.parse(search),
})

function Users() {
  const { page } = Route.useSearch()
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  // State for sorting
  const [sortBy, setSortBy] = React.useState<string>("title")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")

  // Fetch users from API
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getUsersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  // State for errors
  const [error, setError] = React.useState<string | null>(null);

  const users = data?.data ?? []

  // Sort users based on selected criteria
  const sortedUsers = React.useMemo(() => {
    if (!users.length) return users;
    
    return [...users].sort((a, b) => {
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
  }, [users, sortBy, sortOrder])

  // Sorting options for users
  const exerciseSortOptions = [
    { value: "title", label: "Title" },
    { value: "category", label: "Category" },
    { value: "muscle_group", label: "Muscle Group" },
    { value: "difficulty", label: "Difficulty" },
    { value: "duration", label: "Duration" },
    { value: "sets", label: "Sets" },
    { value: "reps", label: "Reps" },
  ]

  // Create exercise mutation - similar to AddItem
  const createMutation = useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUserApiV1({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User created successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
      setError("Failed to create exercise. Please try again.")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  // Update exercise mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UserCreate }) =>
      UsersService.updateUserApiV1({ id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
      setError("Failed to update exercise. Please try again.")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleAddUser = (exerciseData: User) => {
    setError(null)
    // Map User to UserCreate
    const createData: UserCreate = {
      title: exerciseData.title,
      description: exerciseData.description,
      // Add other fields as needed for your API
    }
    createMutation.mutate(createData)
  }

  const handleUpdateUser = (exerciseData: User) => {
    setError(null)
    if (!exerciseData.id) return;
    
    // Map User to UserCreate
    const updateData: UserCreate = {
      title: exerciseData.title,
      description: exerciseData.description,
      // Add other fields as needed for your API
    }
    updateMutation.mutate({ id: exerciseData.id, data: updateData })
  }

  const handlePlay = (exercise: User) => {
    console.log("Playing exercise:", exercise);
    // Handle play functionality if needed
  };

  return (
    <Container maxW="full" p={1} >
      <GoBack />
      
      {/* Header with Heading and Sort Controls */}
      <HStack justify="space-between" align="center" pt={12} pb={4}>
        <Heading size="lg">
          Your users
        </Heading>
        
        {/* Sort Controls */}
        <SortComponent
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
        <PendingUsers />
      ) : sortedUsers.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiSearch />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>You don't have any users yet</EmptyState.Title>
              <EmptyState.Description>
                Add a new exercise to get started
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <Text>
          You have {sortedUsers.length} users.
        </Text>
      )}
    </Container >
  )
}

export default Users
