import React from "react";
import { IconButton } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { FaArrowLeft } from "react-icons/fa";

interface GoBackProps {
  to?: string;
  position?: "absolute" | "relative" | "fixed" | "sticky";
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  bg?: string;
  color?: string;
  hoverBg?: string;
  borderRadius?: string;
  "aria-label"?: string;
}

function GoBack({ 
  to = "/",
  position = "absolute",
  top = "0",
  left = "2",
  right,
  bottom,
  size = "md",
  bg = "whiteAlpha.200",
  color = "white",
  hoverBg = "whiteAlpha.300",
  borderRadius = "full",
  "aria-label": ariaLabel = "Go back"
}: GoBackProps) {
  const navigate = useNavigate();

  return (
    <IconButton
      aria-label={ariaLabel}
      position={position}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      size={size}
      bg={bg}
      color={color}
      borderRadius={borderRadius}
      _hover={{ bg: hoverBg }}
      onClick={() => navigate({ to })}
    >
      <FaArrowLeft />
    </IconButton>
  );
}

export default GoBack;