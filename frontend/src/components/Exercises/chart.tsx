import React from 'react';
import { Box, Flex, Text, Heading, VStack, Spacer, HStack, Separator } from '@chakra-ui/react';
import useAuth from "@/hooks/useAuth"

// A simple way to get the max value for scaling the bars.
const minValue = 0;

function WorkoutsPerMonthChart() {
  const { user: currentUser } = useAuth();

  // Get activities and count per month
  const activities = currentUser?.activities || [];
  // Map: { 'Jan': 3, 'Feb': 5, ... }
  const monthCounts: Record<string, number> = {};
  activities.forEach((activity: any) => {
    if (activity.date) {
      const d = new Date(activity.date);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
    }
  });

  // Get the previous 4 months including current month
  const now = new Date();
  const prevMonths: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    prevMonths.push(d.toLocaleString("en-US", { month: "short" }));
  }
  const stepsData = prevMonths.map(label => ({ label, value: monthCounts[label] || 0 }));

  // Find min/max for chart scaling
  const values = stepsData.map(m => m.value);
  const maxValue = 16;
  const range = maxValue - minValue || 1;

  return (
    <Box
      bg="#1a1a1a"
      p={6}
      borderRadius="2xl"
      maxW="lg"
      mx="auto"
      color="white"
      fontFamily="Inter, sans-serif"
      border="solid"
    >
      <Heading size="md" color="lime" mb={6}>
        N° Workouts
      </Heading>

      <Flex align="flex-start" justifyContent="space-between" height="200px">
        {/* Y-Axis Labels */}
        <VStack gap={4} align="center" pr={4} fontSize="sm" color="#888" w="10%">
          <Text>{maxValue}</Text>
          <Box h="20%" />
          <Text>{Math.round(maxValue - range / 3)}</Text>
          <Box h="20%" />
          <Text>{Math.round(maxValue - 2 * range / 3)}</Text>
          <Box h="20%" />
          <Text>{minValue}</Text>
        </VStack>

        {/* Chart Bars */}
        <Flex flex="1" justifyContent="space-around" alignItems="flex-end" h="100%" w="90%">
          {stepsData.map((monthData, index) => {
            const barHeight = ((monthData.value - minValue) / range) * 100;
            const isLastMonth = index === stepsData.length - 1;
            const barColor = isLastMonth ? "lime" : "#929b69ff";
            return (
              <VStack key={monthData.label} spacing={2} justify="flex-end" w="6%" h="100%">
                <Box
                  position="relative"
                  w="30px"
                  h="100%"
                  bg="#333"
                  borderRadius="full"
                >
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    w="full"
                    h={`${barHeight}%`}
                    bg={barColor}
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            );
          })}
        </Flex>
      </Flex>
      <Separator orientation="horizontal" height="100%" size="lg" mb={2} mt={2} color="white" />
      {/* Month Labels */}
      <HStack gap={2} align="center" justifyContent="space-around" ml="10%"  w="90%" fontSize="sm" color="#888">
        {stepsData.map((monthData, index) => {
          const barColor = index === stepsData.length - 1 ? "lime" : "#929b69ff";
          return (
            <Text fontSize="sm" color={barColor} fontWeight="medium" key={monthData.label}>
              {monthData.label}
            </Text>
          );
        })}
      </HStack>
    </Box>
  );
}

export default WorkoutsPerMonthChart;