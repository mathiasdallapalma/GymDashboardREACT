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
import { useQuery } from "@tanstack/react-query";
import { FaPlay } from "react-icons/fa6";
import { FaUser, FaStar, FaLock, FaCog,FaCalendarAlt, FaQuestionCircle, FaSignOutAlt, FaHome, FaFileAlt, FaRegStar, FaHeadphones, FaUsers } from "react-icons/fa";
import { UsersService, type UserPublic } from "@/client";
import useAuth from "@/hooks/useAuth";

function ProfileSection() {
  const { user: currentUser, logout } = useAuth();
  
  // Fetch user profile from API
  const { data: user, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => UsersService.readUserMeApiV1(),
    
  });

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null | undefined): number => {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Check if user is trainer or admin - now using proper typing
  const isTrainerOrAdmin = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "trainer"
  );

  const baseMenuItems = [
    { label: "Profile", icon: FaUser, href: `/user/${user?.id}/profile` },
    { label: "Exercises", icon: FaStar, href: "/exercises" },
    { label: "Calendar", icon: FaCalendarAlt, href: "/activity" },
  ];

  const adminMenuItems = [
    { label: "Clients", icon: FaUsers, href: "/users" },
  ];

  const settingsMenuItems = [
    { label: "Privacy Policy", icon: FaLock, href: "/privacy" },
    { label: "Settings", icon: FaCog, href: "/settings" },
    { label: "Help", icon: FaQuestionCircle, href: "/help" },
  ];

  const logoutMenuItem = {
    label: "Logout",
    icon: FaSignOutAlt,
    onClick: () => logout(),
  };

  // Combine menu items based on user role
  const menuItems = [
    ...baseMenuItems,
    ...(isTrainerOrAdmin ? adminMenuItems : []),
    ...settingsMenuItems,
  ];

  return (
    <Flex direction="column" bg="black" minH="100vh" h="full">
      {/* Top Profile Section */}
      <Flex direction="column" alignItems="center" bg="#b09fff" pb={6} pt={4} h="325px" mb={6}>
        <VStack mt={4}>
          <Avatar.Root w="150px" h="150px">
            <Avatar.Fallback name={user?.full_name || "User"} />
            <Avatar.Image src="https://avatar.iran.liara.run/public" />
          </Avatar.Root>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {user?.full_name}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.900">
            {user?.email}
          </Text>
        </VStack>
        {/* Stats */}
        <HStack
          mt={4}
          justify="center"
          
          bg="purple.500"
          py={3}
          borderRadius="xl"
          mx={4}
          display="flex"
          w={{ sm: "80%", md: "500px" }}
          minW="300px"
        >
          <VStack flexGrow={1} gap={0} className="asd">
            <Text fontWeight="bold" color="white">
              {user?.weight} Kg
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Weight
            </Text>
          </VStack>
          <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
          <VStack flexGrow={2} gap={0}>
            <Text fontWeight="bold" color="white">
              {calculateAge(user?.date_of_birth)}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Years Old
            </Text>
          </VStack>
          <Separator orientation="vertical" height="40px" borderColor="whiteAlpha.500" />
          <VStack flexGrow={1} gap={0}>
            <Text fontWeight="bold" color="white">
              {user?.height} m
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              Height
            </Text>
          </VStack>
        </HStack>
      </Flex>
      {/* Menu */}
      <VStack align="stretch" flex="1" mt={4}
      w={{ sm: "full", md: "200px" }}
      alignSelf="center"
      >
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
            <HStack alignItems="center">
              <Icon bg="purple" as={item.icon} borderRadius="full" boxSize={9} p={1.5} color="white" />
              <Text>{item.label}</Text>
            </HStack>
            <Icon as={FaPlay} boxSize={4} color="lime" />
          </Flex>
        ))}
        
        {/* Logout button with onClick handler */}
        <Flex
          px={4}
          py={3}
          _hover={{ bg: "gray.800" }}
          color="white"
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          w="100%"
          cursor="pointer"
          onClick={logoutMenuItem.onClick}
        >
          <HStack alignItems="center">
            <Icon bg="purple" as={logoutMenuItem.icon} borderRadius="full" boxSize={9} p={1.5} color="white" />
            <Text>{logoutMenuItem.label}</Text>
          </HStack>
          <Icon as={FaPlay} boxSize={4} color="lime" />
        </Flex>
      </VStack>
    </Flex>
  );
}

export default ProfileSection;
