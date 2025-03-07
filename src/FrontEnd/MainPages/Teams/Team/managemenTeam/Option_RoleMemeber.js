import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const roles = ["Developer", "Designer", "Leader", "Tester", "Product Manager"];

export default function RoleSelector({ onSelect }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelect = (role) => {
    setSelectedRole(role);
    onSelect && onSelect(role);
  };

  return (
    <div className="flex flex-col items-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {selectedRole ? selectedRole : "Chọn vị trí"} ▼
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {roles.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => handleSelect(role)}
              className="flex justify-between items-center"
            >
              {role}
              {selectedRole === role && <Check className="w-4 h-4 text-green-500" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
