import React from 'react';
import { Box, Flex, Text, Heading, VStack, HStack, Button, Icon, Separator, Collapsible, } from '@chakra-ui/react';
import { FaRunning, FaChevronDown, FaClock } from 'react-icons/fa';
import { BsChevronCompactDown } from "react-icons/bs";
import { GiWeightLiftingUp } from 'react-icons/gi';
import { Link } from '@tanstack/react-router';
import { FaBiking, FaSwimmer, FaDumbbell, FaWalking } from 'react-icons/fa';
import useAuth from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ActivitiesService, ExercisesService } from "@/client";

function ActivityCard({ activity }) {
  const { user: currentUser } = useAuth();
  // Fallbacks for missing data
  const name = activity.title || activity.name || "Activity";
  const date = activity.date || "";
  let totalDuration = 0;
  // Random icon from a list
  const icons = [FaRunning, FaBiking, FaSwimmer, FaDumbbell, FaWalking];
  const iconIdx = Math.floor(Math.random() * icons.length);
  const IconComponent = icons[iconIdx];

  

  // Fetch activity name by id
  const { data: activityData } = useQuery({
    queryFn: () => ActivitiesService.readActivityApiV1({ id: activity.id }),
    queryKey: ["activity", activity.id],
    enabled: !!activity.id,
  });
  const activityName = activityData?.title || activity.title || activity.name || "Activity";

  // Details: get exercises from currentUser.exercises with performance for activity.date
  const details = (currentUser?.exercises || [])
    .filter(ex => ex.performance[activity.date]!=undefined)
    .map(ex => {
      // Fetch exercise name by id
      const { data: exerciseData } = useQuery({
        queryFn: () => ExercisesService.readExerciseApiV1({ id: ex.id }),
        queryKey: ["exercise", ex.id],
        enabled: !!ex.id,
      });
      totalDuration+=exerciseData?.duration || 0;
      
      return {
        ...ex,
        performance: ex.performance[activity.date],
        exerciseName: exerciseData?.title || ex.title || ex.name || "Exercise",
        
      };
    });

  return (
    <Collapsible.Root unmountOnExit
      key={activity.id}
      bg="gray.800"
      borderRadius="md"
      p={4}
      pb={1}
      w="full">
      <Collapsible.Trigger w="full" alignItems="center" justifyContent="space-between">
        <HStack gap={4} pb={1}>
          {/* Random icon */}
          <Icon as={IconComponent} boxSize={6} color="purple.400" />
          <Separator orientation="vertical" w="4px" h="42px" size="lg" bg="lime" color="lime" />
          <Box w="50%">
            <Text fontWeight="bold" color="white">{activityName}</Text>
            <Text fontSize="sm" color="gray.400">{date}</Text>
          </Box>
          {/* Show total duration */}
          <Flex justifySelf="flex-end" gap={1}>
            <Icon as={FaClock} color="purple.400" />
            <Text fontSize="xs">{totalDuration} Mins</Text>
          </Flex>
        </HStack>
        <Icon  as={BsChevronCompactDown} color="gray.400" boxSize={4} />
      </Collapsible.Trigger>
      {/* Details section: show exercises and performance */}
      {details.length > 0 && (
        <Collapsible.Content>
          <Box mt={1}>
            <VStack gap={2} align="stretch" mb={2}>
              {details.map((ex, idx) => (
                <Box key={ex.id || idx} p={2} bg="gray.700" borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <Text w="50%" color="white" textAlign="left" fontWeight="medium">{ex.exerciseName}</Text>
                    <HStack gap={3} w="50%" justifyContent="right">
                      <Text w="1/3" fontSize="sm" color="lime">{ex.performance ?? "-"}</Text>
                      {ex.duration && (
                        <Text w="1/3" fontSize="sm" color="purple.400">{ex.duration} min</Text>
                      )}
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
        </Collapsible.Content>
      )}
    </Collapsible.Root>
  );
}

export default ActivityCard;