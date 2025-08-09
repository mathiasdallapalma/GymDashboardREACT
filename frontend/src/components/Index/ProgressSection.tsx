import { Box, Flex, Heading, Text, VStack, HStack, Icon,Button } from "@chakra-ui/react";
import { FaRunning } from "react-icons/fa";

function ProgressSection() {
  return (
    <Box bg="black" color="white" p={4}>
      {/* Activities Section */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="lime">Activities</Heading>
                  <Button variant="link" color="lime">See All</Button>
                </Flex>
        <VStack spacing={4}>
          <Flex
            bg="gray.800"
            borderRadius="md"
            p={4}
            align="center"
            justify="space-between"
            w="full"
          >
            <HStack spacing={4}>
              <Icon as={FaRunning} boxSize={6} color="purple.400" />
              <Box>
                <Text fontWeight="bold">Upper Body Workout</Text>
                <Text fontSize="sm" color="gray.400">June 09</Text>
                <Text fontSize="sm" color="purple.400">120 Kcal</Text>
              </Box>
            </HStack>
            <Text fontSize="sm" color="purple.400">Duration: 25 Mins</Text>
          </Flex>
          <Flex
            bg="gray.800"
            borderRadius="md"
            p={4}
            align="center"
            justify="space-between"
            w="full"
          >
            <HStack spacing={4}>
              <Icon as={FaRunning} boxSize={6} color="purple.400" />
              <Box>
                <Text fontWeight="bold">Pull Out</Text>
                <Text fontSize="sm" color="gray.400">April 15 - 4:00 PM</Text>
                <Text fontSize="sm" color="purple.400">130 Kcal</Text>
              </Box>
            </HStack>
            <Text fontSize="sm" color="purple.400">Duration: 30 Mins</Text>
          </Flex>
        </VStack>
      </Box>

      {/* Steps Section */}
      <Box bg="gray.800" borderRadius="md" p={4}>
        <Heading size="md" color="lime" mb={4}>WorkOut</Heading>
        <Flex justify="space-between" align="flex-end">
          <Box textAlign="center">
            <Text fontSize="sm" color="lime">170</Text>
            <Box bg="lime" h="50px" w="10px" borderRadius="md" />
            <Text fontSize="sm" color="gray.400">Jan</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" color="lime">165</Text>
            <Box bg="lime" h="40px" w="10px" borderRadius="md" />
            <Text fontSize="sm" color="gray.400">Feb</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" color="lime">155</Text>
            <Box bg="lime" h="30px" w="10px" borderRadius="md" />
            <Text fontSize="sm" color="gray.400">Mar</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="sm" color="lime">150</Text>
            <Box bg="lime" h="20px" w="10px" borderRadius="md" />
            <Text fontSize="sm" color="gray.400">Apr</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

export default ProgressSection;
