import svgPaths from "./svg-trmdz2szwj";
import imgImage3 from "figma:asset/caf230fb9dce9f73cbf6dc8bc0a3070351708889.png";
import imgMetaColor1 from "figma:asset/694d8d9daafa1747ba956cde4aa8f1b01b7230fa.png";
import imgAppleLogoWhiteSvg1 from "figma:asset/3c471cdd48a07bab241584648dade77d25de1fa4.png";
import imgLogos182 from "figma:asset/3972aedd9c639dce2d6932028c4a0bee6fa569eb.png";

function Time() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[22px] items-center justify-center min-h-px min-w-px pt-[2px] relative" data-name="Time">
      <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[22px] relative shrink-0 text-[17px] text-center text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
        9:41
      </p>
    </div>
  );
}

function Battery() {
  return (
    <div className="h-[13px] relative shrink-0 w-[27.328px]" data-name="Battery">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.328 13">
        <g id="Battery">
          <rect height="12" id="Border" opacity="0.35" rx="3.8" stroke="var(--stroke-0, white)" width="24" x="0.5" y="0.5" />
          <path d={svgPaths.p3bbd9700} fill="var(--fill-0, white)" id="Cap" opacity="0.4" />
          <rect fill="var(--fill-0, white)" height="9" id="Capacity" rx="2.5" width="21" x="2" y="2" />
        </g>
      </svg>
    </div>
  );
}

function Levels() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[7px] h-[22px] items-center justify-center min-h-px min-w-px pt-px relative" data-name="Levels">
      <div className="h-[12.226px] relative shrink-0 w-[19.2px]" data-name="Cellular Connection">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2 12.2264">
          <path clipRule="evenodd" d={svgPaths.p1e09e400} fill="var(--fill-0, white)" fillRule="evenodd" id="Cellular Connection" />
        </svg>
      </div>
      <div className="h-[12.328px] relative shrink-0 w-[17.142px]" data-name="Wifi">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1417 12.3283">
          <path clipRule="evenodd" d={svgPaths.p18b35300} fill="var(--fill-0, white)" fillRule="evenodd" id="Wifi" />
        </svg>
      </div>
      <Battery />
    </div>
  );
}

function Frame() {
  return <div className="-translate-x-1/2 absolute bg-white h-[42px] left-1/2 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[359px] w-[225px]" />;
}

function Frame1() {
  return <div className="-translate-x-1/2 absolute bg-white h-[42px] left-1/2 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[460px] w-[225px]" />;
}

function Frame2() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#46bb39] h-[42px] left-[calc(50%+0.5px)] overflow-clip rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[537px] w-[190px]">
      <p className="-translate-x-1/2 absolute font-['Days_One:Regular',sans-serif] h-[35px] leading-[normal] left-1/2 not-italic text-[19px] text-center text-white top-[7px] w-[176px] whitespace-pre-wrap">Login</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[rgba(255,163,70,0.72)] border-2 border-[#f4f4f4] border-solid left-[235px] overflow-clip rounded-[15px] size-[60px] top-[689px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[30px] top-1/2" data-name="image 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="-translate-x-1/2 absolute bg-[rgba(255,163,70,0.72)] border-2 border-[#f4f4f4] border-solid left-[calc(50%+0.5px)] overflow-clip rounded-[15px] size-[60px] top-[689px]">
      <div className="absolute left-[13px] size-[30px] top-[13px]" data-name="meta-color 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMetaColor1} />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-[rgba(255,163,70,0.72)] border-2 border-[#f4f4f4] border-solid left-[99px] overflow-clip rounded-[15px] size-[60px] top-[689px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[36px] left-1/2 top-1/2 w-[30px]" data-name="Apple_logo_white.svg 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgAppleLogoWhiteSvg1} />
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#4e8149] h-[20px] left-[calc(50%+0.5px)] overflow-clip top-[648px] w-[30px]">
      <div className="-translate-x-1/2 absolute font-['Aleo:Regular',sans-serif] font-normal h-[14px] leading-[normal] left-[calc(50%-0.5px)] text-[14px] text-center text-white top-0 w-[55px] whitespace-pre-wrap">
        <p className="mb-0">or</p>
        <p>&nbsp;</p>
      </div>
    </div>
  );
}

export default function IPhone() {
  return (
    <div className="bg-[#f67c01] relative size-full" data-name="iPhone 16 - 3">
      <div className="absolute flex inset-[-24.3%_-28.97%_75.64%_22.65%] items-center justify-center">
        <div className="flex-none h-[326.914px] rotate-[47.06deg] w-[262.064px]">
          <div className="relative size-full" data-name="Leaf 5">
            <div className="absolute inset-[0_-1.53%_-3.36%_-1.53%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 270.064 337.914">
                <g filter="url(#filter0_d_19_471)" id="Leaf 5">
                  <path clipRule="evenodd" d={svgPaths.pdef1a00} fill="var(--fill-0, #21825C)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="337.914" id="filter0_d_19_471" width="270.064" x="-3.87445e-10" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="7" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_19_471" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_19_471" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[613.962px] items-center justify-center left-[-150px] top-[361px] w-[586.7px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[-6.33deg]">
          <div className="h-[559.131px] relative w-[528.279px]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 528.279 559.131">
              <path clipRule="evenodd" d={svgPaths.pdf44c00} fill="var(--fill-0, #21825C)" fillOpacity="0.79" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[613.962px] items-center justify-center left-[-233px] top-[526px] w-[586.7px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[-6.33deg]">
          <div className="h-[559.131px] relative w-[528.279px]" data-name="Vector">
            <div className="absolute inset-[0_-0.76%_-1.43%_-0.76%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 536.279 567.131">
                <g filter="url(#filter0_d_19_475)" id="Vector">
                  <path clipRule="evenodd" d={svgPaths.p12958b00} fill="var(--fill-0, #F6830F)" fillOpacity="0.91" fillRule="evenodd" shapeRendering="crispEdges" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="567.131" id="filter0_d_19_475" width="536.279" x="-1.38069e-08" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_19_475" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_19_475" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute h-[34px] left-[calc(50%-0.5px)] top-[817px] w-[400px]" data-name="Home Indicator">
        <div className="-translate-x-1/2 absolute bottom-[8px] flex h-[5px] items-center justify-center left-1/2 w-[144px]">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="bg-white h-[5px] rounded-[100px] w-[144px]" data-name="Home Indicator" />
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex gap-[154px] h-[66px] items-center justify-center left-0 pb-[19px] pt-[21px] px-[16px] top-0 w-[393px]" data-name="Status bar - iPhone">
        <Time />
        <Levels />
      </div>
      <Frame />
      <p className="absolute font-['Aleo:Bold',sans-serif] font-bold h-[35px] leading-[normal] left-[89px] text-[19px] text-white top-[327px] w-[176px] whitespace-pre-wrap">Email</p>
      <Frame1 />
      <Frame2 />
      <p className="absolute font-['Aleo:Bold',sans-serif] font-bold h-[35px] leading-[normal] left-[89px] text-[19px] text-white top-[422px] w-[176px] whitespace-pre-wrap">Password</p>
      <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%-0.14px)] size-[12.728px] top-[273.17px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="-rotate-45 flex-none">
          <div className="bg-white size-[9px]" />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute h-0 left-[calc(50%+0.5px)] top-[280px] w-[280px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 280 1">
            <line id="Line 1" stroke="var(--stroke-0, white)" x2="280" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute h-0 left-[calc(50%+0.5px)] top-[658px] w-[280px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 280 1">
            <line id="Line 1" stroke="var(--stroke-0, white)" x2="280" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame3 />
      <Frame4 />
      <Frame5 />
      <Frame6 />
      <p className="-translate-x-1/2 absolute decoration-solid font-['Aleo:Medium',sans-serif] font-medium h-[25px] leading-[normal] left-[calc(50%+0.5px)] text-[12px] text-center text-white top-[605px] underline w-[136px] whitespace-pre-wrap">Forgot password?</p>
      <div className="-translate-x-1/2 absolute left-1/2 size-[293px] top-[76px]" data-name="LOGOS(18) 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogos182} />
      </div>
      <div className="absolute bg-[#f67c01] border-4 border-solid border-white h-[27px] left-[306px] rounded-[29px] top-[803px] w-[69px]" />
      <div className="absolute left-[349px] size-[19px] top-[807px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
          <circle cx="9.5" cy="9.5" fill="var(--fill-0, #FFFCFC)" id="Ellipse 3" r="9.5" />
        </svg>
      </div>
    </div>
  );
}