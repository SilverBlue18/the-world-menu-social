import { Composition, Still } from "remotion";
import { loadStudioFonts } from "./shared/fonts";
import { ImamShort, SHORT_S } from "./imam/Short";
import { Mock } from "./mock/Mock";
import { ImamDesk, DESK_S } from "./imam/Desk";
import { ImamFlow, FLOW_S } from "./imam/MapFlow";
import { SaleeFlow, SALEE_S } from "./salee/Salee";
import { PimentFlow, PIMENT_S } from "./piment/Piment";
import { PimentStick, STICK_S } from "./pimentStick/PimentStick";
import * as Concepts from "./concepts/Concepts";
import { PimentTest3D } from "./three3d/PimentTest3D";

loadStudioFonts();

export const MyComposition = () => (
  <>
    {(["ConceptA1", "ConceptA2", "ConceptB1", "ConceptB2", "ConceptC1", "ConceptC2"] as const).map((id) => (
      <Still key={id} id={id} component={Concepts[id]} width={1080} height={1920} />
    ))}
    {(["A", "B"] as const).map((look) => (["field", "ship"] as const).map((scene) => (
      <Composition key={look + scene} id={`Test3D-${scene}-${look}`} component={PimentTest3D} defaultProps={{ look, scene }} durationInFrames={scene === "field" ? 240 : 120} fps={30} width={1080} height={1920} />
    )))}
    <Composition id="PimentStick" component={PimentStick} durationInFrames={Math.round(STICK_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="PimentFlow" component={PimentFlow} durationInFrames={Math.round(PIMENT_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="SaleeFlow" component={SaleeFlow} durationInFrames={SALEE_S * 30} fps={30} width={1080} height={1920} />
    <Composition id="ImamFlow" component={ImamFlow} durationInFrames={FLOW_S * 30} fps={30} width={1080} height={1920} />
    <Composition id="ImamDesk" component={ImamDesk} durationInFrames={DESK_S * 30} fps={30} width={1080} height={1920} />
    <Composition id="ImamShort" component={ImamShort} durationInFrames={SHORT_S * 30} fps={30} width={1080} height={1920} />
    {([1, 2, 3, 4] as const).flatMap((opt) => (["A", "B"] as const).map((scene) => (
      <Still key={`${opt}${scene}`} id={`Mock${opt}${scene}`} component={Mock} defaultProps={{ opt, scene }} width={1080} height={1920} />
    )))}
  </>
);
