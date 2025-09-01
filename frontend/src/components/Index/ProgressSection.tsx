import { Box, Flex, Heading, Text, VStack, HStack, Icon, Button } from "@chakra-ui/react";
import { FaRunning } from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";
import { Link } from "@tanstack/react-router";
import WorkoutsPerMonthChart from "@/components/Exercises/chart"; // Import the StepsChart component
import ActivityCard from "@/components/Exercises/activity-card"; // Import the LastActivityCard component
import useAuth from "@/hooks/useAuth";

function ProgressSection() {
  const { user: currentUser } = useAuth();

  // Only show activities with a date in the past
  const now = new Date();
  const activitiesData = (currentUser?.activities || [])
    .filter(a => a.date && new Date(a.date) < now)
    .reverse();

  return (
    <Box bg="black" color="white" p={4}>
      <WorkoutsPerMonthChart />
      {/* Activities Section */}
      <Box mb={6} mt={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="white">Last Activities</Heading>
          
        </Flex>
        <VStack gap={4}>
          {activitiesData.map((activity, i) => (
            <ActivityCard key={i} activity={activity} />
          ))}
          
        </VStack>
      </Box>
    </Box>
  );
}

export default ProgressSection;
