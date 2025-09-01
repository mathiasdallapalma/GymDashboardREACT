import { Container, Image } from "@chakra-ui/react"
import {
  useColorModeValue,
} from "@/components/ui/color-mode"

import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"

import type { Body_login_login_access_token as AccessToken } from "@/client"


import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import Logo from "/assets/images/fastapi-logo.svg"
import { emailPattern, passwordRules } from "../utils"

import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Link,
  IconButton,
  Stack,
  useBreakpointValue,
  Field
} from '@chakra-ui/react';
import { FaGoogle, FaFacebook, FaFingerprint } from 'react-icons/fa';

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()

    // Debug: Adding console logs to track login process
    console.log("Login form submitted with:", data)

    // Also log the current API base URL
    console.log("API Base URL:", import.meta.env.VITE_API_URL)

    // Log the actual endpoint being called
    console.log("Login endpoint:", `${import.meta.env.VITE_API_URL}/api/v1/login/access-token`)

    try {
      console.log("Sending login request with data:", data)
      const response = await loginMutation.mutateAsync(data)
      console.log("Login response received:", response)
    } catch (error) {
      console.error("Login error:", error)
      // error is handled by useAuth hook
    }
  }

  const containerW = useBreakpointValue({ base: '100%', md: '400px' });

  // Define colors for light and dark modes

  return (
    <>

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="gray.900"
        color="white"
        flexDirection="column"
        p={4}
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Welcome Text */}
        <Box p={4} textAlign="center">
          <Heading size="lg" mb={2}>
            Welcome
          </Heading>
          <Text fontSize="sm" color="gray.300" w="80%" mx="auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
        </Box>

        {/* Form Section */}
        <Box p={6} w="107%" bg="gray.800" m={10}>
          <Stack alignItems="center">
            <Field.Root
              invalid={!!errors.username}
              w={{ sm: "100%", md: "400px" }}
              errorText={errors.username?.message || !!error}
            >
              <Field.Label fontSize="sm" >
                Username or email
              </Field.Label>
              <InputGroup
                w="full"
                startElement={<FiMail />}
              >
                <Input
                
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                    pattern: emailPattern,
                  })}
                  placeholder="example@example.com"
                  type="email"
                  bg="white"
                  color="gray.800"
                  borderRadius={15}
                />
              </InputGroup>
            </Field.Root>

            <Field.Root
              w={{ sm: "100%", md: "400px" }}
            >
              <Field.Label fontSize="sm">
                Password
              </Field.Label>
              <PasswordInput
                type="password"
                startElement={<FiLock />}
                {...register("password", passwordRules())}
                placeholder="************"
                errors={errors}
                
                bg="white"
                color="gray.800"
                borderRadius={15}
              />
              <Flex w="100%" justify="flex-end">
                <Link fontSize="xs" color="gray.600" href="/recover-password" textAlign="right">
                  Forgot Password?
                </Link>
              </Flex>
            </Field.Root>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box p={4} textAlign="center">
          <Button
            type="submit"
            w="100%"
            maxW="200px"
            mx="auto"
            borderRadius="full"
            colorScheme="gray"
            variant="surface"
          >
            Log In
          </Button>

          <Text fontSize="xs" color="gray.400" mt={3}>
            or sign up with
          </Text>

          <Flex justify="center" mt={2} gap={4}>
            <IconButton
              as="a"
              href="/auth/google"
              aria-label="Google"
              icon={<FaGoogle />}
              borderRadius="full"
              bg="white"
              color="gray.800"
              boxShadow="md"
            />
            <IconButton
              as="a"
              href="/auth/facebook"
              aria-label="Facebook"
              icon={<FaFacebook />}
              borderRadius="full"
              bg="white"
              color="gray.800"
              boxShadow="md"
            />
            <IconButton
              as="a"
              href="/auth/fingerprint"
              aria-label="Fingerprint"
              icon={<FaFingerprint />}
              borderRadius="full"
              bg="white"
              color="gray.800"
              boxShadow="md"
            />
          </Flex>
          <Text fontSize="sm" color="gray.400" mt={4}>
            Don’t have an account?{' '}
            <Link color="yellow.400" fontWeight="bold" href="/signup">
              Sign Up
            </Link>
          </Text>
        </Box>

      </Flex>
    </>
  )
}
