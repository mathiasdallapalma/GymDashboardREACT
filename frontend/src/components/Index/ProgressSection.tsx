import { Box, Flex, Heading, Text, VStack, HStack, Icon, Button } from "@chakra-ui/react";
import { FaRunning } from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";
import { Link } from "@tanstack/react-router";
import StepsChart from "@/components/Exercises/chart"; // Import the StepsChart component
import ActivityCard from "@/components/Exercises/activity-card"; // Import the LastActivityCard component

function ProgressSection() {

  const activitiesData = [
  {
    id: 1,
    type: 'cardio',
    name: 'Running',
    date: 'June 09 - 6:00 AM',
    calories: '120 Kcal',
    duration: '25',
    details: {
      sets: [
        { name: 'Warm-up', duration: '5 mins', link: '/exercises/warm-up' },
        { name: 'Running', duration: '20 mins', link: '/exercises/running' }
      ]
    }
  },
  {
    id: 2,
    type: 'exercise',
    name: 'Pull Day',
    date: 'April 15 - 4:00 PM',
    calories: '130 Kcal',
    duration: '30',
    details:{
      sets: [
        { name: 'Pull Ups', reps: '3x10', weight: '5KG', link: '/exercises/pull-ups' },
        { name: 'Bent Over Rows', reps: '3x6', weight: '15KG', link: '/exercises/bent-over-rows' },
        { name: 'Seated Rows', reps: '3x8', weight: '12KG', link: '/exercises/seated-rows' }
      ]
    },
  },
  {
    id: 3,
    type: 'cardio',
    name: 'Cycling',
    date: 'May 20 - 7:00 AM',
    calories: '150 Kcal',
    duration: '40',
    details: {
      sets: [
        { name: 'Cycling', duration: '40 mins', link: '/exercises/cycling' }
      ]
    },
  }
];
  return (


    <Box bg="black" color="white" p={4}>
      <StepsChart />
    

      {/* Activities Section */}
      <Box mb={6} mt={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="lime">Last Activities</Heading>
        <Button variant="ghost" color="lime">See All</Button>
      </Flex>
      
      <VStack gap={4}>
        {activitiesData.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
        
        {/* Three dots indicator for more content */}
        
          <Flex
            bg="gray.800"
            borderRadius="md"
            p={4}
            as={Link}
            to="/exercises"

            align="center"
            justify="center"
            w="full"
            cursor="pointer"
            
          >
            
            <Text fontSize="2xl" color="gray.400" letterSpacing="4px" >
              ...
            </Text>
          </Flex>
        
      </VStack>
      </Box>


    </Box>
  
  );
}

export default ProgressSection;
