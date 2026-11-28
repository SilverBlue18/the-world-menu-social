import { Composition, Still } from "remotion";
import { loadStudioFonts } from "./shared/fonts";
import { ImamShort, SHORT_S } from "./imam/Short";
import { Mock } from "./mock/Mock";
import { ImamDesk, DESK_S } from "./imam/Desk";
import { ImamFlow, FLOW_S } from "./imam/MapFlow";
import { SaleeFlow, SALEE_S } from "./salee/Salee";
import { PimentFlow, PIMENT_S } from "./piment/Piment";
import { PimentStick, STICK_S } from "./pimentStick/PimentStick";
import { KetchupHook, KetchupCountdown, KetchupSplit, KetchupV2Hook, KetchupV2Body } from "./ketchup/KetchupFrames";
import { KetchupShort, KETCHUP_S } from "./ketchup/KetchupShort";
import { BrandV2Board, LogoOptions, ClocheAvatars, ProfilePic, LogoLight, LogoDark } from "./brand/BrandV2";
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
    {/* new real-food format: style frames for the ketchup pilot */}
    <Still id="ProfilePic" component={ProfilePic} width={1080} height={1080} />
    <Still id="LogoLight" component={LogoLight} width={2000} height={800} />
    <Still id="LogoDark" component={LogoDark} width={1080} height={1350} />
    <Still id="ClocheAvatars" component={ClocheAvatars} width={1800} height={900} />
    <Still id="LogoOptions" component={LogoOptions} width={1800} height={1000} />
    <Still id="BrandV2Board" component={BrandV2Board} width={1800} height={860} />
    <Composition id="KetchupShort" component={KetchupShort} durationInFrames={Math.round(KETCHUP_S * 30)} fps={30} width={1080} height={1920} />
    <Still id="KetchupV2Hook" component={KetchupV2Hook} width={1080} height={1920} />
    <Still id="KetchupV2Body" component={KetchupV2Body} width={1080} height={1920} />
    <Still id="KetchupHook" component={KetchupHook} width={1080} height={1920} />
    <Still id="KetchupCountdown" component={KetchupCountdown} width={1080} height={1920} />
    <Still id="KetchupSplit" component={KetchupSplit} width={1080} height={1920} />
    {/* style v3 test: first 10.2 s, one continuous camera (growkaz-stickman-studio/projects/piment_v3) */}
    <Composition id="PimentV3Test" component={PimentStick} durationInFrames={306} fps={30} width={1080} height={1920} defaultProps={{ video: "piment_v3/stick.mp4", audio: "piment_v3/mix.wav" }} />
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
