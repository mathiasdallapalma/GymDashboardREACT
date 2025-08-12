import { Box, Flex, Text, Image, IconButton, HStack, Icon, Link } from "@chakra-ui/react";
import { FaClock, FaFire,FaInfoCircle } from "react-icons/fa";



function ExerciseCard({ exercise, size = "180px", onPlay,  }) {
    return (
        <Box
            bg="gray.900"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="2xl"
            position="relative"
            color="white"
            aspectRatio="1/1"
            w={size}
            mb={2}
        >
            <Image src={exercise.image_url} alt={exercise.title} w="full" h="60%" objectFit="cover" bg="yellow" />
            
                <IconButton
                    aria-label="Play Exercise"
                    size="xs"
                    position="absolute"
                    top="45%"
                    right={2}
                    bg="white"
                    borderRadius="full"
                    onClick={() => onPlay && onPlay(exercise)}
                >
                    <FaInfoCircle color="purple" style={{ height: "28px", width: "28px" }} />
                </IconButton>
           
            <Box p={2} border="solid" borderTop="none" h="40%" borderBottomRadius="2xl">
                <Text fontSize="sm" color="lime">
                    {exercise.title}
                </Text>
                <HStack gap={4} mt={1}>
                    <Flex align="center" gap={1}>
                        <Icon as={FaClock} color="purple.400" />
                        <Text fontSize="xs">{exercise.duration} min</Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                        <Icon as={FaFire} color="purple.400" />
                        <Text fontSize="xs">{exercise.calories || "-"}</Text>
                    </Flex>
                </HStack>
            </Box>
        </Box>
    );
}

export default ExerciseCard;
