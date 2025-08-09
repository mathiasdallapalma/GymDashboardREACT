import { Container, Flex, Image, Input, Text } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiUser } from "react-icons/fi"

import type { UserRegister } from "@/client"
import { Button } from "@/components/ui/button"

import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { confirmPasswordRules, emailPattern, passwordRules } from "@/utils"
import Logo from "/assets/images/fastapi-logo.svg"
import { FiMail } from "react-icons/fi"

import {
  Box,

  Heading,
  Field,
  Link,
  IconButton,
  Stack,
  useBreakpointValue,

} from '@chakra-ui/react';

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const { signUpMutation } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    signUpMutation.mutate(data)
  }

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
        <Image
          src={Logo}
          alt="FastAPI logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={8}
        />
        <Text fontSize="xl"textAlign="center" >
          Let's Start!
        </Text>


        {/* Form Section */}
        <Box p={6} w="107%" m={10} bg="purple">
          <Stack spacing={4}>
            <Field.Root
              invalid={!!errors.full_name}
            //errorText={errors.username?.message || !!error}
            >
              <Field.Label fontSize="sm" >
                Full Name
              </Field.Label>
              <InputGroup w="100%" startElement={<FiUser />}>
                <Input
                  id="full_name"
                  minLength={3}
                  {...register("full_name", {
                    required: "Full Name is required",
                  })}
                  placeholder="Jhon Doe"
                  type="text"
                  bg="white"
                  color="gray.800"
                  borderRadius={15}
                />
              </InputGroup>
            </Field.Root>

            <Field.Root invalid={!!errors.email}
            //</Container>errorText={errors.email?.message}
            >
              <Field.Label fontSize="sm" >
                Email
              </Field.Label>
              <InputGroup w="100%" startElement={<FiMail />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  type="email"
                  bg="white"
                  color="gray.800"
                  borderRadius={15}
                />
              </InputGroup>
            </Field.Root>
            <Field.Root>
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

            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm">
                Confirm Password
              </Field.Label>
              <PasswordInput
                type="confirm_password"
                startElement={<FiLock />}
                {...register("confirm_password", confirmPasswordRules(getValues))}
                placeholder="************"
                errors={errors}
                bg="white"
                color="gray.800"
                borderRadius={15}
              />
            </Field.Root>
          </Stack>
        </Box>
        <Text w="75%" textAlign="center">
          By continuing you agree to {" "}
          <RouterLink to="/terms_use" className="main-link">
            Terms of Use
          </RouterLink>
          {" \n"}and{" "}
          <RouterLink to="/privcy_policy" className="main-link">
            Privacy Policy
          </RouterLink>
        </Text>

        <Box p={4} textAlign="center">
          <Button type="submit"
            w="100%"
            maxW="200px"
            mx="auto"
            
            borderRadius="full"
            colorScheme="gray"
            variant="surface"
            loading={isSubmitting}>
            Sign Up
          </Button>
          <Text mt={10}>
            Already have an account?{" "}
            <RouterLink to="/login" className="main-link">
              Log In
            </RouterLink>
          </Text>
        </Box>

      </Flex>



    </>
  )
}

export default SignUp
