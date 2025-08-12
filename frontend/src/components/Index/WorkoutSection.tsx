import { Box, Flex, Heading, Text, Image, Button, VStack, HStack, Icon } from "@chakra-ui/react";
import { Link, useNavigate } from "@tanstack/react-router";

import ExerciseCard from "@/components/Exercises/exercise-card";
import { FaPlay } from "react-icons/fa6";

function WorkoutSection() {
    // Example exercise objects
    const exercises = [
        {
            id: "1",
            title: "Squat Exercise",
            duration: 12,
            calories: 120,
            image_url: "path.to",
            video_url: "#",
        },
        {
            id: "2",
            title: "Full Body Stretching",
            duration: 5,
            calories: 100,
            image_url: "path.to",
            video_url: "#",
        },
    ];

    const navigate = useNavigate();
    const handlePlay = (exercise) => {
        navigate({
            to: "/activity#today",
            search: { exerciseId: exercise.id }
        });
    };

    return (
        <Box bg="black" color="white" p={2}>
            {/* Today Section */}
            <Box mb={2}>
                <Flex justify="space-between" align="center" mb={0}>
                    <Heading size="md" color="lime">Today</Heading>
                    <Link to="/activity#today" style={{ textDecoration: "none" }}>
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
                    <Flex gap={4} minW="fit-content" mb={4}>
                        {exercises.map(exercise => (
                            <ExerciseCard key={exercise.id} exercise={exercise} size="180px" onPlay={handlePlay} />
                        ))}
                    </Flex>
                </Box>
            </Box>

            {/* Weekly Challenge Section */}
            <Box
                bg="purple.500"
                position="relative"
                left="50%"
                transform="translateX(-50%)"
                w="100vw"
                p={4}
                paddingRight={7}
                paddingLeft={7}
                mb={4}
            >
                <HStack bg="gray.800" borderRadius="3xl" align="center">
                    <VStack align="center" justify="center">
                        <Heading textAlign="center" size="2xl" color="lime" m={6} mb={0} mt={0}>Weekly Challenge</Heading>
                        <Text>Plank With Hip Twist</Text>
                    </VStack>
                    <Image w="60%" aspectRatio="6/5" src="/path/to/plank-with-hip-twist.jpg" alt="Plank With Hip Twist" borderRadius="3xl" bg="yellow" />
                </HStack>
            </Box>

            {/* Articles & Tips Section */}
            <Box>
                <Heading size="md" color="lime" mb={1}>Articles & Tips</Heading>
                <Flex gap={4} >
                    <Box borderRadius="md" flex="1">
                        <Image src="/path/to/supplement-guide.jpg" alt="Supplement Guide" borderRadius="xl" bg="yellow" aspectRatio="1/1" />
                        <Text mt={2}>Supplement Guide</Text>
                    </Box>
                    <Box borderRadius="md" flex="1">
                        <Image src="/path/to/daily-routines.jpg" alt="Daily Routines" borderRadius="xl" bg="yellow" aspectRatio="1/1" />
                        <Text mt={2}>15 Quick & Effective Daily Routines...</Text>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}

export default WorkoutSection;
