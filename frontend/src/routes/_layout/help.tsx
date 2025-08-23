import { Box, Container, Flex, IconButton, Text, Separator, HStack, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"


import useAuth from "@/hooks/useAuth"
import GoBack from "@/components/ui/goback"



export const Route = createFileRoute("/_layout/help")({
  component: HelpPage,
})

function HelpPage() {
  const { user: currentUser } = useAuth()

  return (
    <>
      <Container maxW="full" p={1}>
        <GoBack />
        <Text>hELLo I'm A tEmPLate Page!</Text>
      </Container>
    </>
  )
}
