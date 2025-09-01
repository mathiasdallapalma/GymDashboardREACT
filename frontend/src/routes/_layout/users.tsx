import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  Table,
  Icon,
  IconButton,
  Button,
  Box,
  VStack
} from "@chakra-ui/react"
import React from "react"
import { Link } from "@tanstack/react-router";
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

import { IoAddCircleSharp } from "react-icons/io5";

import { createFileRoute } from "@tanstack/react-router"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { FiEdit, FiTrash2 } from "react-icons/fi"

import PendingUsers from "@/components/Pending/PendingUsers"
import { CgGym } from "react-icons/cg";

import useCustomToast from "@/hooks/useCustomToast"
import { UsersService, type UserPublic } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import { handleError } from "@/utils"
import GoBack from "@/components/ui/goback"
import SortComponent from "@/components/ui/sort-component"
import useAuth from "@/hooks/useAuth"

import { FaPlay } from "react-icons/fa6";

const usersSearchSchema = z.object({
  page: z.number().catch(1),
})

function getUsersQueryOptions() {
  return {
    queryFn: () => UsersService.readUsersApiV1(),
    queryKey: ["users"],
  }
}

export const Route = createFileRoute("/_layout/users")({
  component: Users,
  validateSearch: (search) => usersSearchSchema.parse(search),
})

function Users() {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { user: currentUser } = useAuth()

  

  // State for sorting
  const [sortBy, setSortBy] = React.useState<string>("full_name")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")

  // Fetch all users from API
  const { data, isLoading } = useQuery({
    ...getUsersQueryOptions(),
    placeholderData: (prevData) => prevData,
  })

  // State for errors
  const [error, setError] = React.useState<string | null>(null);

  const users = data?.data ?? []
  const count = data?.count ?? 0

  // Sort users based on selected criteria
  const sortedUsers = React.useMemo(() => {
    if (!users.length) return users;

    return [...users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle specific field types properly
      switch (sortBy) {
        case "full_name":
          aValue = a.full_name || "";
          bValue = b.full_name || "";
          break;
        case "email":
          aValue = a.email;
          bValue = b.email;
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          aValue = (a as any)[sortBy];
          bValue = (b as any)[sortBy];
      }

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
  const userSortOptions = [
    { value: "full_name", label: "Full Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
    { value: "is_active", label: "Status" },
  ]

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      UsersService.deleteUserApiV1({ userId }),
    onSuccess: () => {
      showSuccessToast("User deleted successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
      setError("Failed to delete user. Please try again.")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleDeleteUser = (userId: string) => {
    setError(null)
    deleteMutation.mutate(userId)
  }

  return (
    <Container maxW="full" p={1} overflowY="none">
      <GoBack to="/"/>

      {/* Header with Heading and Sort Controls */}
      <HStack justify="space-between" align="center" pt={12} pb={4}>

        <Heading size="lg" w="25%">
          Clients ({count})
        </Heading>

        {/* Sort Controls */}
        <SortComponent
          w="100px"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          sortOptions={userSortOptions}
        />

        <VStack>

          <Link to="/new_user" >
              <Box bg="white"
                borderRadius="full"
                w="30px" h="30px"
                display="flex"
                alignItems="center"
                justifyContent="center">
                <Icon
                  as={IoAddCircleSharp}
                  boxSize={7

                  }
                  color="purple"
                  cursor="pointer"
                />
              </Box>
            </Link>
            <Text fontSize="sm" color="gray.500">
              Add User
            </Text>
        </VStack>

      </HStack>

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error}
        </Text>
      )}

      {isLoading ? (
        <PendingUsers />
      ) : (
        <Flex direction="column" w="100vw" maxW="100vw" overflowX="auto">
          <Table.Root size={{ base: "sm", md: "md" }} w="full" minW="200px" mr={8}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Full Name</Table.ColumnHeader>
                <Table.ColumnHeader w="100px">Email</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedUsers?.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    {user.full_name || "N/A"}
                  </Table.Cell>
                  <Table.Cell w="130px">
                    {user.email ? (
                      (() => {
                        const [before, after] = user.email.split("@");
                        return (
                          <VStack align="start">
                            <Text>{before}</Text>
                            <Text color="gray.400">@{after}</Text>
                          </VStack>
                        );
                      })()
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>
                    {user.role}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack>
                      <Link to="/user/$userId/activity" params={{ userId: user.id }}>
                        <Icon
                          as={CgGym}
                          boxSize={5}
                          color="white"
                          cursor="pointer"
                        />
                      </Link>
                      {currentUser?.role === "admin" && (
                        /* Delete Icon with Confirmation Dialog */
                        <DialogRoot>
                          <DialogTrigger asChild>
                            <IconButton
                              aria-label="Delete User"
                              size="sm"
                              bg="transparent"
                              color="red.500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete User</DialogTitle>
                            </DialogHeader>
                            <DialogBody>
                              <Text>
                                Are you sure you want to delete "{user.full_name}"? This action cannot be undone.
                              </Text>
                            </DialogBody>
                            <DialogFooter>
                              <DialogActionTrigger asChild>
                                <Button color="green" borderRadius="full" variant="outline">Cancel</Button>
                              </DialogActionTrigger>
                              <DialogActionTrigger asChild>
                                <Button
                                  bg="red.500"
                                  borderRadius="full"
                                  onClick={() => {
                                    if (handleDeleteUser) {
                                      handleDeleteUser(user.id);
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </DialogActionTrigger>
                            </DialogFooter>
                            <DialogCloseTrigger />
                          </DialogContent>
                        </DialogRoot>
                      )}
                      <Link to="/user/$userId/profile" params={{ userId: user.id }}>
                        <Icon
                          as={FaPlay}
                          boxSize={4}
                          color="lime"
                          cursor="pointer"
                        />
                      </Link>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>
      )}


    </Container>
  )
}

export default Users
