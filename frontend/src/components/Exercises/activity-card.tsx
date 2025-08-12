import React from 'react';
import { Box, Flex, Text, Heading, VStack, HStack, Button, Icon, Separator, Collapsible, } from '@chakra-ui/react';
import { FaRunning, FaChevronDown } from 'react-icons/fa';
import { BsChevronCompactDown } from "react-icons/bs";
import { GiWeightLiftingUp } from 'react-icons/gi';
import { Link } from '@tanstack/react-router';
import { FaClock } from "react-icons/fa";

function ActivityCard({ activity }) {
  return (

    <Collapsible.Root unmountOnExit
      key={activity.id}
      bg="gray.800"
      borderRadius="md"
      p={4}
      pb={1}
      align="center"
      justify="space-between"
      w="full">
      <Collapsible.Trigger w="full" alignItems="center" justifyContent="space-between">
        <HStack gap={4} pb={1}>
          <Icon as={activity.type === 'cardio' ? FaRunning : GiWeightLiftingUp} boxSize={6} color="purple.400" />
          <Separator orientation="vertical" w="4px" h="42px" size="lg" bg="lime" color="lime" />
          <Box>
            <Text fontWeight="bold" color="white">{activity.name}</Text>
            <Text fontSize="sm" color="gray.400">{activity.date}</Text>
            <Text fontSize="sm" color="purple.400">{activity.calories}</Text>
          </Box>
          <Flex align="center" gap={1}>
            <Icon as={FaClock} color="purple.400" />
            <Text fontSize="xs">{activity.duration} Mins</Text>
          </Flex>
        </HStack>

        <Icon  as={BsChevronCompactDown} color="gray.400" boxSize={4} />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box mt={1}>
          <VStack gap={2} align="stretch">
            {activity.details.sets.map((set, index) => (
              <Box key={index} p={2} bg="gray.700" borderRadius="md" as={Link} to={set.link}>
                <Flex justify="space-between" align="center">
                  <Text w="50%"color="white" textAlign="left" fontWeight="medium">{set.name}</Text>
                  <HStack gap={3} w="50%" justifyContent="right">
                    {set.duration && (
                      <Text w="1/3" fontSize="sm" color="purple.400">{set.duration}</Text>
                    )}
                    {set.reps && (
                      <Text w="1/3" fontSize="sm" color="lime">{set.reps}</Text>
                    )}
                    {set.weight && (
                      <Text w="1/3" fontSize="sm" color="orange.400">{set.weight}</Text>
                    )}
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>





  );
}

export default ActivityCard;