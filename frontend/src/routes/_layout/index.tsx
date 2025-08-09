import { Box, Container, Flex, IconButton, Text, Separator, HStack, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"


import useAuth from "@/hooks/useAuth"

import { CgGym } from "react-icons/cg";
import { GiProgression } from "react-icons/gi";

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import WorkoutSection from "@/components/Index/WorkoutSection"
import ProgressSection from "@/components/Index/ProgressSection";



const tabsConfig = [
  { value: "workout", title: "WorkOut", icon: CgGym, component: WorkoutSection },
  { value: "progress", title: "Progress", icon: GiProgression, component: ProgressSection },

]

export const Route = createFileRoute("/_layout/")({
  component: Home,
})

function Home() {
  const { user: currentUser } = useAuth()

  return (
    <>
      <Container maxW="full" p={1}>
        <Box pt={12} m={4}>
          <Text fontSize="2xl" truncate maxW="sm">
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Text>
          <Text>Welcome back, nice to see you again!</Text>
        </Box>

        <Tabs.Root defaultValue="my-profile" variant="subtle">
          <Tabs.List
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap={4} // Add spacing between tabs
            p={1} // Add padding to the tabs list
          >
            {tabsConfig.map((tab, index) => (
              <>
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={2} // Add spacing between the icon and text
                  minH="80px" // Ensure enough height for the icon and text
                >
                  <IconButton
                    aria-label={tab.title}
                    size="lg"
                    colorScheme="teal"
                    variant="ghost"
                    flexDir="column"
                  >
                    <tab.icon size="24px" /> {/* Adjust icon size */}
                  </IconButton>
                  <Text fontSize="sm">{tab.title}</Text>
                </Tabs.Trigger>
                {index < tabsConfig.length - 1 && (
                  <Separator orientation="vertical" height="8" />
                )}
              </>
            ))}
          </Tabs.List>
          {tabsConfig.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value}>
              <tab.component />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Container>
    </>
  )
}
