
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Player } from "@/lib/types"

interface PlayerComboboxProps {
  players: Player[];
  value: string;
  onChange: (value: string) => void;
  disabledPlayerId?: string;
  placeholder: string;
}

export function PlayerCombobox({ players, value, onChange, disabledPlayerId, placeholder }: PlayerComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? players.find((player) => player.id === value)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search player..." />
          <CommandList>
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name}
                  disabled={player.id === disabledPlayerId}
                  onSelect={(currentValue) => {
                    // Find player by name to get id
                    const selectedPlayer = players.find(p => p.name.toLowerCase() === currentValue.toLowerCase());
                    if (selectedPlayer) {
                      onChange(selectedPlayer.id)
                    }
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === player.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {player.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
