import { Box, Flex, Text, Image, IconButton, HStack, Icon, Link } from "@chakra-ui/react";
import { FaClock, FaFire,FaInfoCircle } from "react-icons/fa";
import { type ExercisePublic } from "@/client";

interface ExerciseCardProps {
  exercise: ExercisePublic;
  size?: string;
  onPlay?: (exercise: ExercisePublic) => void;
}

function ExerciseCard({ exercise, size = "180px", onPlay }: ExerciseCardProps) {
    // Function to get color based on difficulty
    const getDifficultyColor = (difficulty: string | null | undefined) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "green.400";
            case "medium":
                return "orange.400";
            case "hard":
                return "red.400";
            default:
                return "purple.400";
        }
    };

    return (
        <Box
            bg="gray.900"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="2xl"
            position="relative"
            color="white"
            aspectRatio="1/1"
            w={size}
            mb={2}
            minW="180px"
            maxW="260px"
        >
            
            <Image 
                src={exercise.image_url || "./assets/images/placeholder.png"}
                alt={exercise.title} 
                w="full" 
                h="60%" 
                objectFit="cover" 
                bg="gray.800" 
            />
            
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
                <Text fontSize="sm" color="lime" h="50%" overflow="hidden" textOverflow="clip" whiteSpace="nowrap">
                    {exercise.title}
                </Text>
                <HStack gap={4} mt={1} h="50%" px={2}>
                    <Flex align="center" gap={1} justify="left" w="60%">
                        <Icon as={FaClock} color="purple.400" />
                        <Text fontSize="xs">{exercise.duration || 0} min</Text>
                    </Flex>
                    <Flex align="center" gap={1} justify="center" w="40%" >
                        <Icon as={FaFire} color={getDifficultyColor(exercise.difficulty)} />
                        <Text fontSize="xs" fontStyle="initial">{exercise.difficulty?.toUpperCase() || "-"}</Text>
                    </Flex>
                </HStack>
            </Box>
        </Box>
    );
}

export default ExerciseCard;
