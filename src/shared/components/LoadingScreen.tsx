import { Compass } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="grid gap-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-lg bg-blue-700 text-white animate-spin">
          <Compass />
        </div>
        <p className="font-semibold text-slate-600">Loading CareerCompass</p>
      </div>
    </div>
  );
}
