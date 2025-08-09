import { Container, Heading, Stack, Text, Button, Field, Input } from "@chakra-ui/react"
import { InputGroup } from "@/components/ui/input-group"
import { useTheme } from "next-themes"

import { Radio, RadioGroup } from "@/components/ui/radio"

const Appearance = () => {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <Container maxW="full">
        <Heading size="sm" py={4}>
          Appearance
        </Heading>

        <RadioGroup
          onValueChange={(e) => setTheme(e.value)}
          value={theme}
          colorPalette="teal"
        >
          <Stack>
            <Radio value="system">System</Radio>
            <Radio value="light">Light Mode</Radio>
            <Radio value="dark">Dark Mode</Radio>
          </Stack>
        </RadioGroup>
      </Container>





      <Container maxW="full" mt={8} border={"1px solid"} borderColor="gray.200" p={4} bg="custom.background">
        <Heading size="sm" py={4}>
          Theme
        </Heading>
        <Text fontSize="sm" color="gray.500">
          The theme settings allow you to customize the appearance of the application.
        </Text>
        <Button
          mt={4}
          variant="solid"
        >
          Toggle Theme
        </Button>
        <Field.Root >
          <Field.Label fontSize="sm" >
            Username or email
          </Field.Label>
          <Input
            name="username"
            placeholder="example@example.com"
            bg="white"
            color="gray.800"
            borderRadius="full"
          />
        </Field.Root>

      </Container>
    </>
  )
}
export default Appearance
