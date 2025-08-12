import React from 'react';
import { Box, Flex, Text, Heading, VStack, Spacer, HStack, Separator } from '@chakra-ui/react';

// Sample data for the steps, with a value and a label.
const stepsData = [
  { label: 'Jan', value: 16 },
  { label: 'Feb', value: 15 },
  { label: 'Mar', value: 12 },
  { label: 'Apr', value: 7 },
];

// A simple way to get the max value for scaling the bars.
const maxValue = 16;
const minValue = 5;
const range = maxValue - minValue;

function StepsChart() {
  return (
    <Box
      bg="#1a1a1a" // Dark background color to match the image
      p={6}
      borderRadius="2xl"
      maxW="lg"
      mx="auto"
      color="white"
      fontFamily="Inter, sans-serif"
      border="solid"
    >
      <Heading size="md" color="lime" mb={6}>
        N° WorkOuts
      </Heading>

      <Flex align="flex-start" justifyContent="space-between" height="200px">
        {/* Y-Axis Labels */}
        <VStack gap={4} align="center" pr={4} fontSize="sm" color="#888">
          <Text>{maxValue}</Text>
          <Box h="20%" /> {/* Spacer to align the bars */}
          <Text>{maxValue - 5}</Text>
          <Box h="20%" />
          <Text>{maxValue - 10}</Text>
          <Box h="20%" />
          <Text>{minValue}</Text>
        </VStack>

        {/* Chart Bars */}
        <Flex flex="1" justifyContent="space-around" alignItems="flex-end" h="100%">
          {stepsData.map((monthData, index) => {
            const barHeight = ((monthData.value - minValue) / range) * 100;
            const isLastMonth = index === stepsData.length - 1;
            const barColor = isLastMonth ? "lime" : "#929b69ff";


            return (
              <VStack key={monthData.label} spacing={2} justify="flex-end" w="15%" h="100%">
                <Box
                  position="relative"
                  w="30px"
                  h="100%"
                  bg="#333" // Light grey background for the full bar
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
      <Separator orientation="horizontal"  height="100%" size="lg" mb={2} mt={2} color="white" />
      {/* Y-Axis Labels */}
        <HStack gap={7} align="center" justify="flex-end" pr={4} fontSize="sm" color="#888">
          {stepsData.map((monthData, index) => {
            const barHeight = ((monthData.value - minValue) / range) * 100;
            const isLastMonth = index === stepsData.length - 1;
            const barColor = isLastMonth ? "lime" : "#929b69ff";

            return (
                <Text fontSize="sm" color={barColor} fontWeight="medium">
                  {monthData.label}
                </Text>
            );
          })}
        </HStack>
    </Box>
  );
}

export default StepsChart;