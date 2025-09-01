import React from "react"
import {
  Box,
  Input,
  Text,
  HStack,
  Textarea,
} from "@chakra-ui/react"
import { Field } from "@chakra-ui/react"
import { InputGroup } from "@/components/ui/input-group"

interface FieldFormProps {
  label: string
  id: string
  type?: string
  placeholder?: string
  value?: string | number | null
  error?: string
  isRequired?: boolean
  isReadOnly?: boolean
  step?: string
  min?: string | number
  max?: string | number
  register?: any
  validation?: object
  flex?: string | number // For side-by-side layout
  isTextarea?: boolean // For larger text fields
}

const FieldForm: React.FC<FieldFormProps> = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  error,
  isRequired = false,
  isReadOnly = false,
  step,
  min,
  max,
  register,
  validation,
  flex,
  isTextarea = false,
}) => {
  if (isReadOnly) {
    return (
      <Box w="100%" flex={flex}>
        <Text fontSize="sm" color="purple.500" mb={2}>
          {label}
          {isRequired && <Text as="span" color="red.500"> *</Text>}
        </Text>
        <Box
          p={3}
          bg="gray.100"
          borderRadius={15}
          border="2px solid"
          borderColor="gray.300"
          minH={isTextarea ? "100px" : "auto"}
        >
          <Text color="gray.800" whiteSpace={isTextarea ? "pre-wrap" : "normal"}>
            {value || "Not provided"}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Field.Root invalid={!!error} flex={flex}>
      <Field.Label fontSize="sm" color="purple.500">
        {label}
        {isRequired && <Text as="span" color="red.500"> *</Text>}
      </Field.Label>
      <InputGroup w="100%">
        {isTextarea ? (
          <Textarea
            id={id}
            placeholder={placeholder}
            {...(register && register(id, validation))}
            bg="white"
            color="gray.800"
            borderRadius={15}
            minH="100px"
            resize="vertical"
          />
        ) : (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            {...(register && register(id, validation))}
            bg="white"
            color="gray.800"
            borderRadius={15}
          />
        )}
      </InputGroup>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  )
}

export default FieldForm