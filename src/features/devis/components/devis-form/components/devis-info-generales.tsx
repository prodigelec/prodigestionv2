"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { ValiditeSelect } from "@/components/ui/validite-select";
import { TypeClientSelect } from "@/features/clients/components/type-client-select";

interface Props {
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  clientId: string;
  clientOptions: { value: string; label: string }[];
  onClientChange: (val: string) => void;
  validiteDuree: number;
  onValiditeChange: (jours: number, date: string) => void;
  errors: Record<string, string>;
}

export function DevisInfoGenerales({
  typeFilter,
  onTypeFilterChange,
  clientId,
  clientOptions,
  onClientChange,
  validiteDuree,
  onValiditeChange,
  errors,
}: Props) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Type de client</label>
        <TypeClientSelect value={typeFilter} onChange={onTypeFilterChange} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Client *</label>
        <CustomSelect
          name="clientId"
          value={clientId}
          onChange={onClientChange}
          options={clientOptions}
          className={errors.clientId ? "border-destructive" : ""}
        />
        {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
      </div>

      <ValiditeSelect value={validiteDuree} onChange={onValiditeChange} error={errors.dateValidite} />
    </div>
  );
}
