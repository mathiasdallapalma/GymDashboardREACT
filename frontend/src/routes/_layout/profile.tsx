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
import { InputGroup } from "@/components/ui/input-group"

interface UserProfile {
  fullName: string;
  email: string;
  mobile: string;
  dob: string;
  weight: number;
  height: number;
}

export const Route = createFileRoute("/_layout/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const userMockUp = {
    name: "Madison Smith",
    email: "madison@example.com",
    birthday: "April 1st",
    dob: "1995-04-01",
    weight: "75",
    age: 28,
    height: "1.65",
    mobile: "123-456-7890"
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfile>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      fullName: userMockUp.name,
      email: userMockUp.email,
      mobile: userMockUp.mobile,
      dob: userMockUp.dob,
      weight: parseInt(userMockUp.weight),
      height: parseFloat(userMockUp.height),
    },
  })

  const onSubmit: SubmitHandler<UserProfile> = async (data) => {
    if (isSubmitting) return
    console.log("Profile update data:", data)
    // Handle profile update logic here
  }



  return (
    <>

      <Flex direction="column" bg="black" minH="100vh" h="full">
        {/* Top Profile Section */}
        <Flex direction="column" alignItems="center" bg="#b09fff" pb={6} pt={4} h="325px" mb={6}>

          <VStack mt={4} gap={2}>
            <Avatar.Root w="150px" h="150px">
              <Avatar.Fallback name="Segun Adebayo" />
              <Avatar.Image src="https://bit.ly/sage-adebayo" />
            </Avatar.Root>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {userMockUp.name}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              {userMockUp.email}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              Birthday: {userMockUp.birthday}
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
                {userMockUp.weight} Kg
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                Weight
              </Text>
            </VStack>
            <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
            <VStack gap={0} flexGrow={2}>
              <Text fontWeight="bold" color="white">
                {userMockUp.age}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                Years Old
              </Text>
            </VStack>
            <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
            <VStack gap={0} flexGrow={1}>
              <Text fontWeight="bold" color="white">
                {userMockUp.height} m
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                Height
              </Text>
            </VStack>
          </HStack>
        </Flex>

        {/* Form Section */}
        <Box p={6} w="100%" m={10}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4}>
              <Field.Root invalid={!!errors.fullName}>
                <Field.Label fontSize="sm" color="purple.500">
                  Full Name
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="fullName"
                    {...register("fullName", {
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
                <Field.ErrorText>{errors.fullName?.message}</Field.ErrorText>
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

              <Field.Root invalid={!!errors.mobile}>
                <Field.Label fontSize="sm" color="purple.500">
                  Mobile Number
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="mobile"
                    type="tel"
                    {...register("mobile", {
                      required: "Mobile number is required",
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
                <Field.ErrorText>{errors.mobile?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.dob}>
                <Field.Label fontSize="sm" color="purple.500">
                  Date of Birth
                </Field.Label>
                <InputGroup w="100%">
                  <Input
                    id="dob"
                    type="date"
                    {...register("dob", {
                      required: "Date of birth is required"
                    })}
                    bg="white"
                    color="gray.800"
                    borderRadius={15}
                  />
                </InputGroup>
                <Field.ErrorText>{errors.dob?.message}</Field.ErrorText>
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
                      required: "Weight is required",
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
                      required: "Height is required",
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
                  colorScheme="purple"
                  loading={isSubmitting}
                >
                  Update Profile
                </Button>
              </Box>
            </VStack>
          </form>
        </Box>






      </Flex>
    </>
  )
}
