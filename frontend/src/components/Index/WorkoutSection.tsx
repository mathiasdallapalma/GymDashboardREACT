import { Box, Flex, Heading, Text, Image, Button, VStack, HStack } from "@chakra-ui/react";

import ExerciseCard from "@/components/ui/exercise-card";

function WorkoutSection() {
    return (
        <Box bg="black" color="white" p={2}>
            {/* Today Section */}
            <Box mb={2}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="lime">Today</Heading>
                    <Button variant="link" color="lime">See All</Button>
                </Flex>
                <Box overflowX="auto">
                    <Flex gap={4} minW="fit-content" mb={4}>
                        <ExerciseCard title="Squat Exercise" duration="12 Minutes" calories="120 Kcal" imageSrc="path.to" />
                        <ExerciseCard title="Full Body Streatching" duration="5 Minutes" calories="100 Kcal" imageSrc="path.to" />
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
                mb={6}
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
                <Heading size="md" color="lime" mb={4}>Articles & Tips</Heading>
                <Flex gap={4}>
                    <Box bg="gray.800" borderRadius="md" p={4} flex="1">
                        <Image src="/path/to/supplement-guide.jpg" alt="Supplement Guide" borderRadius="md" />
                        <Text mt={2}>Supplement Guide</Text>
                    </Box>
                    <Box bg="gray.800" borderRadius="md" p={4} flex="1">
                        <Image src="/path/to/daily-routines.jpg" alt="Daily Routines" borderRadius="md" />
                        <Text mt={2}>15 Quick & Effective Daily Routines...</Text>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}

export default WorkoutSection;
