import React from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  VStack,
  HStack,
  Icon,
  Spacer,
  Separator,
  Button,
  IconButton,

} from "@chakra-ui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FaPlay } from "react-icons/fa6";
import { FaUser, FaStar, FaLock, FaCog,FaCalendarAlt, FaQuestionCircle, FaSignOutAlt, FaHome, FaFileAlt, FaRegStar, FaHeadphones } from "react-icons/fa";
import { link } from "fs";

function ProfileSection() {
  const user = {
    name: "Madison Smith",
    email: "madison@example.com",
    birthday: "April 1st",
    weight: "75",
    age: 28,
    height: "1.65",
  };

  const menuItems = [
    { label: "Profile", icon: FaUser, href: "/profile" },
    { label: "Exercises", icon: FaStar, href: "/exercises" },
    { label: "Calendar", icon: FaCalendarAlt, href: "/calendar" },
    { label: "Privacy Policy", icon: FaLock, href: "/privacy" },
    { label: "Settings", icon: FaCog, href: "/settings" },
    { label: "Help", icon: FaQuestionCircle, href: "/help" },
    { label: "Logout", icon: FaSignOutAlt, href: "/logout" },
  ];

  return (


    <Flex direction="column" bg="black" minH="100vh" h="full">
      {/* Top Profile Section */}
      <Flex direction="column" alignItems="center" bg="#b09fff" pb={6} pt={4} h="325px" mb={6}>

        <VStack mt={4} spacing={2}>
          <Avatar.Root w="150px" h="150px">
            <Avatar.Fallback name="Segun Adebayo" />
            <Avatar.Image src="https://bit.ly/sage-adebayo" />
          </Avatar.Root>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {user.name}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.900">
            {user.email}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800">
            Birthday: {user.birthday}
          </Text>
        </VStack>

        {/* Stats */}
        <HStack
          mt={4}
          justify="center"
          spacing={4}
          bg="purple.500"
          py={3}
          borderRadius="xl"
          mx={4}
          display="flex"
          w="80%"

        >
          <VStack spacing={0} flexGrow={1} gap={0}>
            <Text fontWeight="bold" color="white">
              {user.weight} Kg
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Weight
            </Text>
          </VStack>
          <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
          <VStack spacing={0} flexGrow={2} gap={0}>
            <Text fontWeight="bold" color="white">
              {user.age}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Years Old
            </Text>
          </VStack>
          <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
          <VStack spacing={0} flexGrow={1} gap={0}>
            <Text fontWeight="bold" color="white">
              {user.height} m
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Height
            </Text>
          </VStack>
        </HStack>
      </Flex>

      {/* Menu */}
      <VStack align="stretch" spacing={0} flex="1" mt={4} >
        {menuItems.map((item, idx) => (
          <Flex
            key={idx}
            px={4}
            py={3}
            _hover={{ bg: "gray.800" }}
            color="white"
            as={Link}
            to={item.href}
            alignItems="center"
            justifyContent="space-between"
            flexDirection="row"
            w="100%"
          >
            <HStack spacing={3} alignItems="center">
              <Icon bg="purple" as={item.icon} borderRadius="full" boxSize={9} p={1.5} color="white" />
              <Text>{item.label}</Text>
            </HStack>
            <Icon as={FaPlay} boxSize={4} color="lime" />
          </Flex>
        ))}
      </VStack>


    </Flex>

  );
}

export default ProfileSection;
