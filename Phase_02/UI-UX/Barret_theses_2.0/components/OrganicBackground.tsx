import Vector from "../imports/Vector";
import Leaf from "../imports/Leaf5";

interface OrganicBackgroundProps {
  variant?: "default" | "minimal" | "alternate";
}

export function OrganicBackground({ variant = "default" }: OrganicBackgroundProps) {
  if (variant === "minimal") {
    return (
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[5%] w-[350px] h-[350px] bg-gradient-to-br from-[#F67C01]/10 to-[#46BB39]/10 rounded-full blur-3xl" />
      </div>
    );
  }

  if (variant === "alternate") {
    return (
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] opacity-15">
          <Vector />
        </div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[350px] h-[350px] opacity-10">
          <Leaf />
        </div>
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-gradient-to-br from-[#F67C01]/10 to-[#46BB39]/10 rounded-full blur-3xl" />
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Top right organic shape */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] opacity-20">
        <Vector />
      </div>
      {/* Bottom left leaf shape */}
      <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] opacity-15">
        <Leaf />
      </div>
      {/* Subtle gradient blurs */}
      <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-gradient-to-br from-[#F67C01]/10 to-[#46BB39]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-gradient-to-tr from-[#46BB39]/10 to-[#21825C]/10 rounded-full blur-3xl" />
    </div>
  );
}
