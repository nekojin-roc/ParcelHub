import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PackagePlus, PencilLine } from "lucide-react";

export default function IntakePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Package Intake</h1>
        <p className="text-muted-foreground">
          Choose how to register incoming packages.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          className="h-24 text-lg font-semibold [&_svg]:size-6"
          onClick={() => navigate("/intake/label")}
        >
          <PackagePlus className="mr-2" />
          Intake
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => navigate("/intake/manual")}
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Manual Intake
        </Button>
      </div>
    </div>
  );
}
