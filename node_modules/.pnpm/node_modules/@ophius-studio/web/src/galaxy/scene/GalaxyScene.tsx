import { CameraRig } from "./rigs/CameraRig";
import { RingScene } from "./ui/RingScene";
import { EnvironmentFx } from "./fx/EnvironmentFx";
import { Starfield } from "./entities/Starfield";

type GalaxySceneProps = {
  /** aktifkan input + render loop */
  interactive?: boolean;
};

export function GalaxyScene({ interactive = true }: GalaxySceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 8, 4]} intensity={0.8} />

      <Starfield />
      <RingScene />
      <EnvironmentFx />

      <CameraRig interactive={interactive} />
    </>
  );
}
