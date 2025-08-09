import { Box, Flex, Text, Image, IconButton, HStack, Icon } from "@chakra-ui/react";
import { FaClock, FaFire } from "react-icons/fa";
import { MdPlayArrow } from "react-icons/md";

function ExerciseCard({ title, duration, calories, imageSrc }) {
    return (
        <Box
            bg="gray.900"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="2xl"
            position="relative"
            color="white"
            aspectRatio="1/1"
            w="180px" // Adjusted to fit the container
            
        >
            <Image src={imageSrc} alt={title} w="full" h="60%" objectFit="cover" bg="yellow" />
            <IconButton
                aria-label="Play Exercise"
                colorScheme="purple"
                size="xs"
                position="absolute"
                top={"50%"}
                right={4}
                borderRadius="full"
            >
                <MdPlayArrow />
            </IconButton>
            <Box p={2} border="solid" borderTop="none" h="40%" borderBottomRadius="2xl">
                <Text fontSize="sm" color="lime">
                    {title}
                </Text>
                <HStack spacing={4} mt={1}>
                    <Flex align="center" gap={1}>
                        <Icon as={FaClock} color="purple.400" />
                        <Text fontSize="xs">{duration}</Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                        <Icon as={FaFire} color="purple.400" />
                        <Text fontSize="xs">{calories}</Text>
                    </Flex>
                </HStack>
            </Box>
        </Box>
    );
}

export default ExerciseCard;
