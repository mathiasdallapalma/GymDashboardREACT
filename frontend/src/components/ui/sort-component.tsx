import React from "react";
import {
  HStack,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface SortOption {
  value: string;
  label: string;
}

interface SortComponentProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  sortOptions?: SortOption[];
  size?: "xs" | "sm" | "md" | "lg";
  gap?: number;
  w?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: "title", label: "Title" },
  { value: "category", label: "Category" },
  { value: "muscle_group", label: "Muscle Group" },
  { value: "difficulty", label: "Difficulty" },
  { value: "duration", label: "Duration" },
  { value: "sets", label: "Sets" },
  { value: "reps", label: "Reps" },
];

function SortComponent({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  sortOptions = defaultSortOptions,
  size = "sm",
  w = "180px",
  gap = 2,
}: SortComponentProps) {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <VStack position="relative" textAlign="left" align="start" top={-4}>
      <Text>Order by:</Text>
    
    <HStack gap={gap} w="full" justifyContent="flex-end">
        
      <SelectRoot
        size={size}
        w={w}
        collection={createListCollection({ items: sortOptions })}
        value={[sortBy]}
        onValueChange={(e) => onSortByChange(e.value[0])}
        
      >
        <SelectTrigger
          w={w}
          bg="gray.800"
          color="white"
          borderRadius="md"
          fontSize="sm"
        >
          <SelectValueText placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent
          position="absolute"
          w={w}
          zIndex={1000}
          bg="gray.800"
          border="1px solid"
          borderColor="gray.600"
          borderRadius="md"
          boxShadow="lg"
        >
          {sortOptions.map((option) => (
            <SelectItem key={option.value} item={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      <IconButton
        aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
        size={size}
        bg="gray.800"
        color="white"
        borderRadius="md"
        _hover={{ bg: "gray.700" }}
        _active={{ bg: "gray.600" }}
        onClick={toggleSortOrder}
      >
        {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
      </IconButton>
    </HStack>
    </VStack>
  );
}

export default SortComponent;