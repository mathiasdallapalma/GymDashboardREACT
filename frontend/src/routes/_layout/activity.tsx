import {
  Container,
  Flex,
  Heading,
  Tabs,
  HStack,
  Box,
  Text,
  Icon,
  Button,
  Image,
} from "@chakra-ui/react"
import React from "react"

import { createFileRoute, Link } from "@tanstack/react-router"
import { FaEdit } from "react-icons/fa"
import { z } from "zod"

import AddExercise from "@/components/Exercises/AddExercise"
import ExercisesList from "@/components/Exercises/exercise-list"
import CustomDrawer from "@/components/Common/CustomDrawer"

const exercisesSearchSchema = z.object({
  page: z.number().catch(1),
})

const activity = {
  title: "Leg Day",
  exercises: [
    {
      id: "1",
      title: "Push Up",
      description: "A basic exercise for upper body strength",
      category: "strength",
      muscle_group: "chest",
      equipment: "none",
      reps: 10,
      sets: 3,
      weight: 70,
      duration: 5,
      difficulty: "beginner",
      image_url: "https://example.com/push-up.jpg",
      video_url: "https://example.com/push-up-video.mp4",
      owner_id: "user-1"
    },
    {
      id: "2",
      title: "Squat",
      description: "A basic exercise for lower body strength",
      category: "strength",
      muscle_group: "legs",
      equipment: "none",
      duration: 8,
      difficulty: "beginner",
      image_url: "https://example.com/squat.jpg",
      video_url: "https://example.com/squat-video.mp4",
      owner_id: "user-1"
    },
    {
      id: "3",
      title: "Plank",
      description: "A core stability exercise",
      category: "core",
      muscle_group: "core",
      equipment: "none",
      duration: 10,
      difficulty: "intermediate",
      image_url: "https://example.com/plank.jpg",
      video_url: "https://example.com/plank-video.mp4",
      owner_id: "user-1"
    }]
}

export const Route = createFileRoute("/_layout/activity")({
  component: Activities,
  validateSearch: (search) => exercisesSearchSchema.parse(search),
})

function Activities() {

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerContent, setDrawerContent] = React.useState<React.ReactNode>(null);
  const [selectedTab, setSelectedTab] = React.useState("");
  const tabsListRef = React.useRef<HTMLDivElement>(null);
  const { page } = Route.useSearch()




  const [tabsConfig, setTabsConfig] = React.useState(() => {
    // Initialize with 21 days (-10 to +10)
    const today = new Date();
    const todayValue = today.toLocaleDateString("en-GB");

    return Array.from({ length: 21 }, (_, i) => {
      const offset = i - 10;
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const value = date.toLocaleDateString("en-GB"); // dd/mm/yyyy format
      const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
      const month = date.toLocaleDateString("en-GB", { month: "short" });
      const isToday = value === todayValue;
      return { value, day, month, offset, isToday };
    });
  });

  // Set initial selected tab to today
  React.useEffect(() => {
    const todayTab = tabsConfig.find(tab => tab.isToday);
    if (todayTab && !selectedTab) {
      setSelectedTab(todayTab.value);
    }
  }, [tabsConfig, selectedTab]);

  const scrollToCenter = React.useCallback((tabValue: string) => {
    if (!tabsListRef.current) return;

    const tabsContainer = tabsListRef.current;
    const selectedTabElement = tabsContainer.querySelector(`[data-value="${tabValue}"]`) as HTMLElement;

    if (selectedTabElement) {
      const containerWidth = tabsContainer.clientWidth;
      const tabLeft = selectedTabElement.offsetLeft;
      const tabWidth = selectedTabElement.offsetWidth;

      // Calculate the scroll position to center the tab
      const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);

      tabsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleTabChange = React.useCallback((details: { value: string }) => {
    setSelectedTab(details.value);
    // Small delay to ensure the tab is rendered before scrolling
    setTimeout(() => {
      scrollToCenter(details.value);
    }, 50);
  }, [scrollToCenter]);

  const handlePlay = (exercise) => {
    setDrawerContent(
      <Flex direction="column" gap={4} p={4}>
        <Heading>{exercise.title}</Heading>
        <HStack gap={3} w="80%" justifyContent="right">
          {exercise.duration && (
            <Text w="1/3" fontSize="sm" color="purple.400">{exercise.duration} Mins</Text>
          )}
          {exercise.reps && (
            <Text w="1/3" fontSize="sm" color="lime">{exercise.sets} x {exercise.reps} </Text>
          )}
          {exercise.weight && (
            <Text w="1/3" fontSize="sm" color="orange.400">{exercise.weight}KG</Text>
          )}
        </HStack>
        <Flex bg="purple.500" p={6} justify="center" >
          <Image borderRadius="4xl" bg="yellow" src={exercise.image_url} alt={exercise.title} aspectRatio="6/8" w="95%" />
        </Flex>
        <Text>
          {exercise.description}
        </Text>
      </Flex>
    );
    setDrawerOpen(true);
  };

  const loadMoreDays = React.useCallback((direction: 'past' | 'future') => {
    const today = new Date();
    const todayValue = today.toLocaleDateString("en-GB");

    setTabsConfig(current => {
      const newTabs = [...current];

      if (direction === 'past') {
        // Add 10 more days to the beginning
        const firstOffset = newTabs[0].offset;
        const newPastTabs = Array.from({ length: 10 }, (_, i) => {
          const offset = firstOffset - (10 - i);
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const value = date.toLocaleDateString("en-GB");
          const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
          const month = date.toLocaleDateString("en-GB", { month: "short" });
          const isToday = value === todayValue;
          return { value, day, month, offset, isToday };
        });
        return [...newPastTabs, ...newTabs];
      } else {
        // Add 10 more days to the end
        const lastOffset = newTabs[newTabs.length - 1].offset;
        const newFutureTabs = Array.from({ length: 10 }, (_, i) => {
          const offset = lastOffset + i + 1;
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const value = date.toLocaleDateString("en-GB");
          const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
          const month = date.toLocaleDateString("en-GB", { month: "short" });
          const isToday = value === todayValue;
          return { value, day, month, offset, isToday };
        });
        return [...newTabs, ...newFutureTabs];
      }
    });
  }, []);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;

    // Check if scrolled to the left (past)
    if (scrollLeft === 0) {
      loadMoreDays('past');
    }

    // Check if scrolled to the right (future)
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
      loadMoreDays('future');
    }
  }, [loadMoreDays]);

  return (
    <Container maxW="full" p={1} >

      <Flex justify="flex-end" mb={-4}>
        <Link to="/edit-calendar" style={{ textDecoration: "none" }}>
          <Button
            variant="ghost"
            fontSize="sm"
            fontWeight="bold"
            color="lime"
            display="inline-flex"
            alignItems="center"
            gap={2}
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Edit Calendar<Icon as={FaEdit} boxSize={4} color="lime" position="relative" bottom="3px" />
          </Button>
        </Link>
      </Flex>

      {/* Calendar Tab Navigation */}
      <Tabs.Root
        defaultValue={tabsConfig.find(tab => tab.isToday)?.value || tabsConfig[10]?.value}
        variant="plain"
        onValueChange={handleTabChange}
      >
        <Tabs.List
          ref={tabsListRef}
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={4} // Add spacing between tabs
          p={1} // Add padding to the tabs list
          color="lime"
          borderBottom="none"
          w="100%"
          overflowX="hidden"
          onScroll={handleScroll}
        >
          {tabsConfig.map((tab) => (
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
                bg="transparent"
                color={tab.isToday ? "lime" : "purple.400"}
                _selected={{
                  color: "lime",
                }}
                _before={{ bg: "lime" }}
              >
                <Box
                  bg="gray.700"
                  border="2px solid"
                  borderColor={tab.isToday ? "lime" : "gray.300"}
                  borderRadius="sm"
                  borderBottomRadius="lg"
                  w="50px"
                  gap={1}
                  css={{
                    '[data-selected] &': {
                      borderWidth: '4px',
                      scale: '1.1'
                    }
                  }}
                >
                  <Text
                    p={1}
                    pb={0}
                    fontSize="lg"
                    fontWeight="bold"
                    color={tab.isToday ? "lime" : "purple.300"}
                  >
                    {tab.day}
                  </Text>
                  <Text
                    p={1}
                    bg="gray.600"
                    borderBottomRadius="lg"
                    fontSize="xs"
                    color={tab.isToday ? "lime" : "purple.300"}
                  >
                    {tab.month}
                  </Text>
                </Box>
              </Tabs.Trigger>
            </>
          ))}
        </Tabs.List>
        {tabsConfig.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value} pt="0">
            <Heading size="lg" py={2} px={4}>
              {activity.title}
            </Heading>

            <ExercisesList
              onPlay={handlePlay}
              routeFullPath={Route.fullPath}
              page={page}
              exercises={activity.exercises}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>



    </Container >
  )
}
