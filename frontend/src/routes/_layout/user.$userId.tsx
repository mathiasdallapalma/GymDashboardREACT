import { createFileRoute } from "@tanstack/react-router"
import React from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  VStack,
  HStack,
  Separator,
  Button,
  Heading,
  Input,
  Stack,
  Field
} from "@chakra-ui/react";
import { type SubmitHandler, useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { InputGroup } from "@/components/ui/input-group"
import GoBack from "@/components/ui/goback"
import { UsersService, type UserPublic, type UserUpdate } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import useAuth from "@/hooks/useAuth"
import { handleError } from "@/utils"
import type { ApiError } from "@/client/core/ApiError"
import NonAuthorized from "@/components/Errors/403NonAuthorized"

export const Route = createFileRoute("/_layout/user/$userId")({
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { user: currentUser } = useAuth()

  // Check if current user can view this profile
  const canViewProfile = currentUser && (
    currentUser.id === userId || // Own profile
    currentUser.role === "admin" || // Admin role
    currentUser.role === "trainer" // Trainer role - can view client profiles
  )

  // Check if current user can edit this profile
  const canEditProfile = currentUser && (
    currentUser.id === userId || 
    currentUser.role === "admin"
  )

  // Fetch user data from API
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => UsersService.readUserByIdApiV1({ userId }),
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: UserUpdate) =>
      UsersService.updateUserApiV1({ userId, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Profile updated successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
      showErrorToast("Failed to update profile. Please try again.")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  // Reset form with user data when it loads
  React.useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || "",
        email: user.email || "",
        mobile_number: user.mobile_number || "",
        date_of_birth: user.date_of_birth || "",
        weight: user.weight || undefined,
        height: user.height || undefined,
      })
    }
  }, [user, reset])

  const onSubmit: SubmitHandler<UserUpdate> = async (data) => {
    if (isSubmitting) return
    console.log("Profile update data:", data)
    updateMutation.mutate(data)
  }

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text color="white">Loading...</Text>
      </Flex>
    )
  }

  if(!canViewProfile) {
    return (
      <NonAuthorized
        message="You can only view your own profile or profiles of your clients."
      />
    )
  }

  return (
    <Flex direction="column" bg="black" minH="100vh" h="full">
      {/* Top Profile Section */}
      <Flex direction="column" alignItems="center" bg="#b09fff" pb={1} pt={4} h="325px" mb={2} position="relative">
        {/* Go Back Button */}
        <GoBack />

        <VStack mt={4} gap={2}>
          <Avatar.Root w="150px" h="150px">
            <Avatar.Fallback name={user?.full_name || "User"} />
            <Avatar.Image src={(user as any)?.avatar_url || "https://bit.ly/sage-adebayo"} />
          </Avatar.Root>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {user?.full_name}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.900">
            {user?.email}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            Birthday: {(user as any)?.birthday || (user as any)?.dob}
          </Text>
        </VStack>

        {/* Stats */}
        <HStack
          mt={4}
          justify="center"
          gap={4}
          bg="purple.500"
          py={3}
          borderRadius="xl"
          mx={4}
          display="flex"
          w="80%"
        >
          <VStack gap={0} flexGrow={1}>
            <Text fontWeight="bold" color="white">
              {user?.weight || 0} Kg
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Weight
            </Text>
          </VStack>
          <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
          <VStack gap={0} flexGrow={2}>
            <Text fontWeight="bold" color="white">
              {calculateAge(user?.date_of_birth || "")}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Years Old
            </Text>
          </VStack>
          <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
          <VStack gap={0} flexGrow={1}>
            <Text fontWeight="bold" color="white">
              {user?.height || 0} m
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Height
            </Text>
          </VStack>
        </HStack>
      </Flex>

      {/* Form Section - Only show if user can edit profile */}
      {canEditProfile ? (
        <Flex pl={6} pt={4} w="100%" justifyContent="space-around" pb={20}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4}>
              <Field.Root invalid={!!errors.full_name}>
                <Field.Label fontSize="sm" color="purple.500">
                  Full Name
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="full_name"
                    {...register("full_name", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters"
                      }
                    })}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.full_name?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.email}>
                <Field.Label fontSize="sm" color="purple.500">
                  Email
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.mobile_number}>
                <Field.Label fontSize="sm" color="purple.500">
                  Mobile Number
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="mobile_number"
                    type="tel"
                    {...register("mobile_number", {
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: "Invalid mobile number"
                      }
                    })}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.mobile_number?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.date_of_birth}>
                <Field.Label fontSize="sm" color="purple.500">
                  Date of Birth
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...register("date_of_birth")}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.date_of_birth?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.weight}>
                <Field.Label fontSize="sm" color="purple.500">
                  Weight (kg)
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="1"
                    max="500"
                    {...register("weight", {
                      min: {
                        value: 1,
                        message: "Weight must be greater than 0"
                      },
                      max: {
                        value: 500,
                        message: "Weight must be less than 500kg"
                      }
                    })}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.weight?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.height}>
                <Field.Label fontSize="sm" color="purple.500">
                  Height (m)
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="3"
                    {...register("height", {
                      min: {
                        value: 0.5,
                        message: "Height must be greater than 0.5m"
                      },
                      max: {
                        value: 3,
                        message: "Height must be less than 3m"
                      }
                    })}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.height?.message}</Field.ErrorText>
              </Field.Root>

              {/* Action Buttons */}
              <Box pt={4} textAlign="center" w="100%">
                <Button
                  type="submit"
                  w="100%"
                  maxW="200px"
                  mx="auto"
                  borderRadius="full"
                  bg="purple.500"
                  loading={isSubmitting}
                >
                  Update Profile
                </Button>
              </Box>
            </VStack>
          </form>
        </Flex>
      ) : (
        <Flex pl={6} pt={4} w="100%" justifyContent="space-around" pb={20}>
          <VStack gap={4}>
            <Box w="100%">
              <Text fontSize="sm" color="purple.500" mb={2}>
                Full Name
              </Text>
              <Box
                p={3}
                bg="gray.100"
                borderRadius={15}
                border="2px solid"
                borderColor="gray.300"
              >
                <Text color="gray.800">{user?.full_name || "Not provided"}</Text>
              </Box>
            </Box>

            <Box w="100%">
              <Text fontSize="sm" color="purple.500" mb={2}>
                Email
              </Text>
              <Box
                p={3}
                bg="gray.100"
                borderRadius={15}
                border="2px solid"
                borderColor="gray.300"
              >
                <Text color="gray.800">{user?.email || "Not provided"}</Text>
              </Box>
            </Box>

            <Box w="100%">
              <Text fontSize="sm" color="purple.500" mb={2}>
                Mobile Number
              </Text>
              <Box
                p={3}
                bg="gray.100"
                borderRadius={15}
                border="2px solid"
                borderColor="gray.300"
              >
                <Text color="gray.800">{user?.mobile_number || "Not provided"}</Text>
              </Box>
            </Box>

            <Box w="100%">
              <Text fontSize="sm" color="purple.500" mb={2}>
                Date of Birth
              </Text>
              <Box
                p={3}
                bg="gray.100"
                borderRadius={15}
                border="2px solid"
                borderColor="gray.300"
              >
                <Text color="gray.800">{user?.date_of_birth || "Not provided"}</Text>
              </Box>
            </Box>

            <HStack w="100%" gap={3}>
              <Box flex="1">
                <Text fontSize="sm" color="purple.500" mb={2}>
                  Weight (kg)
                </Text>
                <Box
                  p={3}
                  bg="gray.100"
                  borderRadius={15}
                  border="2px solid"
                  borderColor="gray.300"
                >
                  <Text color="gray.800">{user?.weight || "Not provided"}</Text>
                </Box>
              </Box>

              <Box flex="1">
                <Text fontSize="sm" color="purple.500" mb={2}>
                  Height (m)
                </Text>
                <Box
                  p={3}
                  bg="gray.100"
                  borderRadius={15}
                  border="2px solid"
                  borderColor="gray.300"
                >
                  <Text color="gray.800">{user?.height || "Not provided"}</Text>
                </Box>
              </Box>
            </HStack>
          </VStack>
        </Flex>
      )}
    </Flex>
  )
}

export default UserPage