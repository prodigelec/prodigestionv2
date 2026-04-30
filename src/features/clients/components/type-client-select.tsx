"use client";

import { TypeClient } from "@/generated/prisma";
import { CustomSelect } from "@/components/ui/custom-select";

interface TypeClientSelectProps {
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

export function TypeClientSelect({
  value,
  onChange,
  showAllOption = true,
  allOptionLabel = "Tous les types",
  className = "",
}: TypeClientSelectProps) {
  const options = [
    ...(showAllOption ? [{ value: "TOUS", label: allOptionLabel }] : []),
    ...Object.values(TypeClient).map((type) => ({
      value: type,
      label: type.replace(/_/g, " "),
    })),
  ];

  return (
    <CustomSelect
      name="type-client"
      value={value}
      onChange={onChange}
      options={options}
      className={className}
    />
  );
}
