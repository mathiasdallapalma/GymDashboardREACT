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
  Stat,
  FormatNumber,

} from "@chakra-ui/react";
import { type SubmitHandler, useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import GoBack from "@/components/ui/goback"
import { UsersService, type UserPublic, type UserUpdate } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import useAuth from "@/hooks/useAuth"
import { handleError } from "@/utils"
import type { ApiError } from "@/client/core/ApiError"
import NonAuthorized from "@/components/Errors/403NonAuthorized"
import NotFound from "@/components/Common/NotFound"
import FieldForm from "@/components/Users/FieldForm"


export const Route = createFileRoute("/_layout/user/$userId/profile")({
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams<{ userId: string }>()
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
    currentUser.id === userId

  )

  // Fetch user data from API
  const { data: user, isLoading, error, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => UsersService.readUserByIdApiV1({ userId }),
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 error
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
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
        notes: user.notes || "",
      })
    }
  }, [user, reset])

  const onSubmit: SubmitHandler<UserUpdate> = async (data) => {
    if (isSubmitting) return

    // Clean up empty strings and convert them to null for optional fields
    const cleanedData = {
      ...data,
      mobile_number: data.mobile_number || null,
      date_of_birth: data.date_of_birth || null,
      weight: data.weight ? Number(data.weight) : null,
      height: data.height ? Number(data.height) : null,
      notes: data.notes || null,
    }

    console.log("Profile update data:", cleanedData)
    updateMutation.mutate(cleanedData)
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

  // Show NotFound component if user is not found (404 error)
  if (isError && (error as ApiError)?.status === 404) {
    return <NotFound />
  }

  if (!canViewProfile) {
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
        <GoBack top={2} />

        <VStack mt={4} gap={2}>
          <Avatar.Root w="150px" h="150px">
            <Avatar.Fallback name={user?.full_name || "User"} />
            <Avatar.Image src="https://bit.ly/sage-adebayo" />
          </Avatar.Root>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {user?.full_name}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.900">
            {user?.email}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            Birthday: {user?.date_of_birth || "Not provided"}
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
               w={{ sm: "80%", md: "500px" }}
          minW="300px"
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
        <Flex pl={6} pt={8} w="100%" justifyContent="space-around" pb={20}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4}>
              <FieldForm
                label="Full Name"
                id="full_name"
                register={register}
                validation={{
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                }}
                error={errors.full_name?.message}
                isRequired
              />

              <FieldForm
                label="Email"
                id="email"
                type="email"
                register={register}
                validation={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                error={errors.email?.message}
                isRequired
              />

              <FieldForm
                label="Mobile Number"
                id="mobile_number"
                type="tel"
                register={register}
                validation={{
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: "Invalid mobile number"
                  }
                }}
                error={errors.mobile_number?.message}
              />

              <FieldForm
                label="Date of Birth"
                id="date_of_birth"
                type="date"
                register={register}
                error={errors.date_of_birth?.message}
              />

              <HStack w="100%" gap={3}>
                <FieldForm
                  label="Weight (kg)"
                  id="weight"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  register={register}
                  validation={{
                    min: {
                      value: 1,
                      message: "Weight must be greater than 0"
                    },
                    max: {
                      value: 500,
                      message: "Weight must be less than 500kg"
                    }
                  }}
                  error={errors.weight?.message}
                  flex="1"
                />

                <FieldForm
                  label="Height (m)"
                  id="height"
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="3"
                  register={register}
                  validation={{
                    min: {
                      value: 0.5,
                      message: "Height must be greater than 0.5m"
                    },
                    max: {
                      value: 3,
                      message: "Height must be less than 3m"
                    }
                  }}
                  error={errors.height?.message}
                  flex="1"
                />
              </HStack>

              <FieldForm
                label="Notes"
                id="notes"
                placeholder="Add any additional notes or information about this user..."
                register={register}
                validation={{
                  maxLength: {
                    value: 1000,
                    message: "Notes must be less than 1000 characters"
                  }
                }}
                error={errors.notes?.message}
                isTextarea
              />

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
        <Flex mt={6} p={6} w="100%" flexDirection="column" pb={20}>
          <VStack gap={6} align="stretch" maxW="400px" mx="auto" w="100%">
            
            <Stat.Root>
              <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                Full Name
              </Stat.Label>
              <Stat.ValueText fontSize="lg" color="white" fontWeight="bold">
                {user?.full_name || "Not provided"}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                Email
              </Stat.Label>
              <Stat.ValueText fontSize="lg" color="white" fontWeight="bold">
                {user?.email || "Not provided"}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                Mobile Number
              </Stat.Label>
              <Stat.ValueText fontSize="lg" color="white" fontWeight="bold">
                {user?.mobile_number || "Not provided"}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                Date of Birth
              </Stat.Label>
              <Stat.ValueText fontSize="lg" color="white" fontWeight="bold">
                {user?.date_of_birth || "Not provided"}
              </Stat.ValueText>
            </Stat.Root>

            <HStack w="100%" gap={4}>
              <Stat.Root flex="1">
                <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                  Weight
                </Stat.Label>
                <Stat.ValueText fontSize="lg" color="white" fontWeight="bold">
                  {user?.weight ? `${user.weight} kg` : "Not set"}
                </Stat.ValueText>
              </Stat.Root>

              <Stat.Root flex="1">
                <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                  Height
                </Stat.Label>
                <Stat.ValueText fontSize="lg" color="white" fontWeight="bold">
                  {user?.height ? `${user.height} m` : "Not set"}
                </Stat.ValueText>
              </Stat.Root>
            </HStack>

            <Stat.Root>
              <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                Notes
              </Stat.Label>
              <Stat.ValueText fontSize="md" color="white" lineHeight="1.6">
                {user?.notes || "No notes available"}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label fontSize="sm" color="purple.400" fontWeight="medium">
                Role
              </Stat.Label>
              <Stat.ValueText fontSize="lg" color="lime" fontWeight="bold" textTransform="capitalize">
                {user?.role || "User"}
              </Stat.ValueText>
            </Stat.Root>

          </VStack>
        </Flex>
      )}
    </Flex>
  )
}

export default UserPage