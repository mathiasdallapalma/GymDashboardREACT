import { createFileRoute, useNavigate } from "@tanstack/react-router"
import React from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  Heading,
} from "@chakra-ui/react";
import { type SubmitHandler, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Field } from "@chakra-ui/react"
import { Radio, RadioGroup } from "@/components/ui/radio"
import GoBack from "@/components/ui/goback"
import { UsersService, type UserCreate } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import useAuth from "@/hooks/useAuth"
import { handleError } from "@/utils"
import type { ApiError } from "@/client/core/ApiError"
import NonAuthorized from "@/components/Errors/403NonAuthorized"
import FieldForm from "@/components/Users/FieldForm"

export const Route = createFileRoute("/_layout/new_user")({
  component: NewUserPage,
})

function NewUserPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { user: currentUser } = useAuth()
  const [selectedRole, setSelectedRole] = React.useState<string>("user")

  // Check if current user can create users (admin or trainer)
  const canCreateUser = currentUser && (currentUser.role === "admin" || currentUser.role === "trainer")
  
  // Determine available roles based on current user's role
  const getAvailableRoles = () => {
    if (currentUser?.role === "admin") {
      return [
        { value: "user", label: "User" },
        { value: "trainer", label: "Trainer" },
        { value: "admin", label: "Admin" }
      ]
    } else if (currentUser?.role === "trainer") {
      return [
        { value: "user", label: "User" }
      ]
    }
    return [{ value: "user", label: "User" }]
  }

  const availableRoles = getAvailableRoles()

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUserApiV1({ requestBody: data }),
    onSuccess: (newUser) => {
      showSuccessToast("User created successfully.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      // Navigate to the new user's profile page
      navigate({ to: "/users" })
    },
    onError: (err: ApiError) => {
      handleError(err)
      showErrorToast("Failed to create user. Please try again.")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      role: "user", // Default role
    }
  })

  const onSubmit: SubmitHandler<UserCreate> = async (data) => {
    if (isSubmitting) return
    
    // Clean up empty strings and convert them to null for optional fields
    const cleanedData = {
      ...data,
      role: selectedRole as "user" | "admin" | "trainer", // Use selected role
      mobile_number: data.mobile_number || null,
      date_of_birth: data.date_of_birth || null,
      weight: data.weight ? Number(data.weight) : null,
      height: data.height ? Number(data.height) : null,
      notes: data.notes || null,
    }
    
    console.log("User creation data:", cleanedData)
    createMutation.mutate(cleanedData)
  }

  if (!canCreateUser) {
    return (
      <NonAuthorized
        message="You don't have permission to create new users. Only admins and trainers can create users."
      />
    )
  }

  return (
    <Flex direction="column" bg="black" minH="100vh" h="full">
      {/* Header Section */}
      <Flex direction="column" alignItems="center" bg="#b09fff" pb={4} pt={4} position="relative">
        {/* Go Back Button */}
        <GoBack top={2} />

        <VStack mt={8} gap={2}>
          <Heading size="lg" color="white" textAlign="center">
            Create New User
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.900" textAlign="center">
            Fill in the details to create a new user account
          </Text>
        </VStack>
      </Flex>

      {/* Form Section */}
      <Flex pl={6} pt={8} w="100%" justifyContent="space-around" pb={20}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4} maxW="400px" w="100%">
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
              label="Password"
              id="password"
              type="password"
              register={register}
              validation={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              }}
              error={errors.password?.message}
              isRequired
            />

            {/* Role Selection - Only show if user has permission to select roles */}
            {availableRoles.length > 1 && (
              <Field.Root w="100%">
                <Field.Label fontSize="sm" color="purple.500" mb={2}>
                  User Role
                </Field.Label>
                <RadioGroup
                  value={selectedRole}
                  onValueChange={(details) => setSelectedRole(details.value)}
                  colorScheme="purple"
                >
                  <VStack align="start" gap={2}>
                    {availableRoles.map((role) => (
                      <Radio key={role.value} value={role.value}>
                        <Text color="white">{role.label}</Text>
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>
              </Field.Root>
            )}

            {/* Show selected role if only one option available */}
            {availableRoles.length === 1 && (
              <Box w="100%">
                <Text fontSize="sm" color="purple.500" mb={2}>
                  User Role
                </Text>
                <Box
                  p={3}
                  bg="gray.100"
                  borderRadius={15}
                  border="2px solid"
                  borderColor="gray.300"
                >
                  <Text color="gray.800">{availableRoles[0].label}</Text>
                </Box>
              </Box>
            )}

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
            <HStack pt={4} w="100%" gap={3}>
             
              <Button
                type="submit"
                w="100%"
                maxW="200px"
                borderRadius="full"
                bg="purple.500"
                loading={isSubmitting}
              >
                Create User
              </Button>
            </HStack>
          </VStack>
        </form>
      </Flex>
    </Flex>
  )
}

export default NewUserPage