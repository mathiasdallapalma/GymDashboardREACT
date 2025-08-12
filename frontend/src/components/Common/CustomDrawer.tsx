import { Text, Box, IconButton, HStack, Image, Flex, Icon, Heading } from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { TiMediaPlayReverse } from "react-icons/ti";

function CustomDrawer({ open, onClose, element }) {
    return (
        <Box
            position="fixed"
            top={0}
            right={open ? 0 : "-100vw"}
            width="80%"
            height="100vh"
            bg="gray.700"
            zIndex={1400}
            boxShadow="2xl"
            transition="right 0.3s"
            borderTopLeftRadius="2xl"
            borderBottomLeftRadius="2xl"
        >
            <HStack
                p={1}
                mb={4}
            >
                <IconButton
                    aria-label="Exit"
                    size="lg"
                    bg="transparent"
                    borderRadius="full"
                    onClick={onClose}
                    display="flex"
                    alignItems="center"
                    gap={1}
                >
                    <Icon as={TiMediaPlayReverse} boxSize={6} color="lime" position="relative" bottom="2px" />
                    <Text color="gray.400" fontSize="lg" fontWeight="normal">
                        Close
                    </Text>
                </IconButton>
            </HStack>
            
            {element}
        </Box>
    );
}

export default CustomDrawer;
