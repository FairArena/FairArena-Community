"use client";

import type { CommentSortOrder } from "@/sanity/lib/vote/getPostComments";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface CommentSortSelectorProps {
  currentSort: CommentSortOrder;
  onSortChange: (sort: CommentSortOrder) => void;
}

const sortOptions: Array<{ value: CommentSortOrder; label: string; description: string }> = [
  {
    value: "best",
    label: "Best",
    description: "Highest voted (default)",
  },
  {
    value: "new",
    label: "New",
    description: "Recently posted",
  },
  {
    value: "top",
    label: "Top",
    description: "Most upvoted",
  },
  {
    value: "controversial",
    label: "Controversial",
    description: "Most polarizing",
  },
];

export default function CommentSortSelector({
  currentSort,
  onSortChange,
}: CommentSortSelectorProps) {
  const currentLabel =
    sortOptions.find((opt) => opt.value === currentSort)?.label || "Best";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {currentLabel}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="flex flex-col gap-0.5"
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
