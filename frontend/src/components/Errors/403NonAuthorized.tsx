import React from "react";
import {
  Flex,
  VStack,
  Text,
  Icon,
  Box,
} from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";

interface NonAuthorizedProps {
  message?: string;
  description?: string;
}

function NonAuthorized({ 
  message = "You don't have permission to access this resource.",
  description 
}: NonAuthorizedProps) {
  return (
    <Flex 
      direction="column" 
      bg="black" 
      minH="100vh" 
      h="full" 
      justify="center" 
      align="center"
    >
      <VStack gap={6} textAlign="center" maxW="md" mx="auto" p={8}>
        {/* Lock Icon */}
        <Box
          p={4}
          borderRadius="full"
          bg="red.900"
          border="2px solid"
          borderColor="red.500"
        >
          <Icon as={FaLock} boxSize={12} color="red.400" />
        </Box>

        {/* 403 Title */}
        <VStack gap={2}>
          <Text 
            fontSize="6xl" 
            fontWeight="bold" 
            color="red.400"
            lineHeight="1"
          >
            403
          </Text>
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            color="red.400"
          >
            Non Authorized
          </Text>
        </VStack>

        {/* Message */}
        <Text 
          color="gray.300" 
          fontSize="lg"
          textAlign="center"
        >
            
          {message}
        </Text>

        {/* Optional Description */}
        {description && (
          <Text 
            color="gray.500" 
            fontSize="sm"
            textAlign="center"
          >
            {description}
          </Text>
        )}
      </VStack>
    </Flex>
  );
}

export default NonAuthorized;