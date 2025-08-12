import { Box, Container, Flex, IconButton, Text, Separator, HStack, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"


import useAuth from "@/hooks/useAuth"

import { CgGym } from "react-icons/cg";
import { GiProgression } from "react-icons/gi";
import { RiUser3Fill } from "react-icons/ri";


import WorkoutSection from "@/components/Index/WorkoutSection"
import ProgressSection from "@/components/Index/ProgressSection";
import ProfileSection from "@/components/Index/ProfileSection";



const tabsConfig = [
  { value: "workout", title: "WorkOut", icon: CgGym, component: WorkoutSection },
  { value: "progress", title: "Progress", icon: GiProgression, component: ProgressSection },
  { value: "profile", title: "Profile", icon: RiUser3Fill, component: ProfileSection },
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

        <Tabs.Root defaultValue="workout" variant="line">
          <Tabs.List
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            gap={1} // Add spacing between tabs
            p={1} // Add padding to the tabs list
            color="lime"
            borderBottom="none"
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
                  gap={1} // Add spacing between the icon and text
                  minH="80px" // Ensure enough height for the icon and text
                  bg="transparent"
                  color="purple.400"
                  _selected={{
                    color: "lime",
                    
                  }}

                  _before={{  bg: "lime" }}
                >
                  <tab.icon size="48px" /> {/* Adjust icon size */}
                  <Text fontSize="0.5rem">{tab.title}</Text>
                </Tabs.Trigger>
                {index < tabsConfig.length - 1 && (
                  <Separator orientation="vertical" height="12" size="lg" />
                )}
              </>
            ))}
          </Tabs.List>
          {tabsConfig.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value} pt="0">
              <tab.component />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Container>
    </>
  )
}
