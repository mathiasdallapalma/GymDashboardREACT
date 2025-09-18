import { Box, Flex, Heading,Stack, Text, Image, Button, VStack, HStack, Icon } from "@chakra-ui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import ExerciseCard from "@/components/Exercises/exercise-card";
import { FaPlay } from "react-icons/fa6";
import { ActivitiesService, ExercisePublic } from "@/client";
import useAuth from "@/hooks/useAuth";

function WorkoutSection() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    
    // Get today's date as string
    const today = new Date().toDateString();
    
    // Fetch today's exercises
    const { data: todayExercisesData, isLoading } = useQuery({
        queryFn: () => ActivitiesService.getExercisesForDayApiV1({ 
            userId: currentUser?.id || "", 
            date: today 
        }),
        queryKey: ["exercises", "day", currentUser?.id, today],
        enabled: !!currentUser?.id,
    });

    const handlePlay = (exercise: any) => {
        navigate({
            to: "/activity",
            search: { exerciseId: exercise.id }
        });
    };

    return (
        <Box bg="black" color="white" p={2}>
            {/* Today Section */}
            <Box mb={2}>
                <Flex justify="space-between" align="center" mb={0}>
                    <Heading size="md" color="white">Today</Heading>
                    <Link to="/activity" style={{ textDecoration: "none" }}>
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
                            See All
                            <Icon as={FaPlay} boxSize={4} color="lime" position="relative" bottom="3px"/>
                        </Button>
                    </Link>
                </Flex>

                <Box overflowX="auto">
                    <Flex gap={4} minW="fit-content" my={4}>
                        {isLoading ? (
                            <Text color="gray.400">Loading today's exercises...</Text>
                        ) : todayExercisesData && (todayExercisesData as ExercisePublic).exercises && (todayExercisesData as ExercisePublic).exercises.length > 0 ? (
                            (todayExercisesData as ExercisePublic).exercises.map((exercise: any) => (
                                <ExerciseCard key={exercise.id} exercise={exercise} size="180px" onPlay={handlePlay} />
                            ))
                        ) : (
                            <Box h="8vh">
                                <Text color="gray.400">No exercises scheduled for today</Text>
                            </Box>
                        )}
                    </Flex>
                </Box>
            </Box>

            {/* Weekly Challenge Section */}
            <Stack
                bg="purple.400"
                position="relative"
                left="50%"
                transform="translateX(-50%)"
                w="100vw"
                p={4}
                paddingRight={7}
                paddingLeft={7}
                mb={4}
                alignItems="center"
            >
                <HStack bg="gray.800" borderRadius="3xl" 
                w="fit-content"
                >
                    <VStack >
                        <Heading textAlign="center" size="2xl" color="lime" m={6} mb={0} mt={0}>Weekly Challenge</Heading>
                        <Text>Full Body Circuit</Text>
                    </VStack>
                    <Image 
                    w={{ base:"60%",sm: "60%", md: "300px" }}
                    //aspectRatio="6/5" 
                    src="./assets/images/Challenge.webp" alt="Full Body Circuit" borderRadius="3xl" bg="yellow" />
                </HStack>
            </Stack>

            {/* Articles & Tips Section */}
            <Box>
                <Heading size="md" color="white" mb={1}>Articles & Tips</Heading>
                <Flex gap={4} >
                    <Box borderRadius="md" flex="1" >
                        <Image src="./assets/images/SupplementGuide.jpeg" w="200px" h="100px" alt="Supplement Guide" borderRadius="xl" bg="yellow" aspectRatio="1/1" />
                        <Text mt={2}>Supplement Guide</Text>
                    </Box>
                    <Box borderRadius="md" flex="1">
                        <Image src="./assets/images/changeyourlife.jpeg" w="200px" h="100px" alt="Daily Routines" borderRadius="xl" bg="yellow" aspectRatio="1/1" />
                        <Text mt={2}>15 Quick & Effective Daily Routines...</Text>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}

export default WorkoutSection;
