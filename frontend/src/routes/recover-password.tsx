import { Container, Heading, Input, Text, Box, Field, Flex } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiMail } from "react-icons/fi"

import { type ApiError, AuthService } from "@/client"
import { Button } from "@/components/ui/button"

import { InputGroup } from "@/components/ui/input-group"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"

interface FormData {
  email: string
}

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function RecoverPassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const { showSuccessToast } = useCustomToast()

  const recoverPassword = async (data: FormData) => {
    await AuthService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("Password recovery email sent successfully.")
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data)
  }
//TODO non riguarda
  return (
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
      <Heading size="xl" color="ui.main" textAlign="center" mb={2}>
        Forgot Password?
      </Heading>
      <Text textAlign="center">
        A password recovery email will be sent to the registered account.
      </Text>
      <Box p={6} w="107%" m={10}>

        <Field.Root
          invalid={!!errors.email}
        //errorText={errors.username?.message || !!error}
        >
          <Field.Label fontSize="sm" >
            Enter your email address
          </Field.Label>
          <InputGroup w="100%" startElement={<FiMail />}>
            <Input
              id="username"
              {...register("email", {
                required: "Email is required",
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
      </Box>
      <Button
        loading={isSubmitting}
        w="100%"
        maxW="200px"
        mx="auto"
        borderRadius="full"
        colorScheme="gray"
        variant="surface">
        Continue
      </Button>
    </Flex>
  )
}
