import svgPaths from "./svg-4solqyh9xq";

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
  return <div className="-translate-x-1/2 absolute bg-white h-[41px] left-1/2 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[262px] w-[293px]" />;
}

function Frame1() {
  return <div className="-translate-x-1/2 absolute bg-white h-[41px] left-[calc(50%-2px)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[381px] w-[293px]" />;
}

function Frame2() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#46bb39] h-[42px] left-[calc(50%+0.5px)] overflow-clip rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[656px] w-[320px]">
      <p className="-translate-x-1/2 absolute font-['Days_One:Regular',sans-serif] h-[35px] leading-[normal] left-1/2 not-italic text-[19px] text-center text-white top-[7px] w-[176px] whitespace-pre-wrap">Register</p>
    </div>
  );
}

function Frame3() {
  return <div className="-translate-x-1/2 absolute bg-white h-[41px] left-[calc(50%-2px)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[504px] w-[293px]" />;
}

export default function IPhone() {
  return (
    <div className="bg-[#f67c01] relative size-full" data-name="iPhone 16 - 17">
      <div className="absolute flex h-[343.733px] items-center justify-center left-[-44px] top-[-185px] w-[536.649px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[-78.6deg]">
          <div className="h-[496.954px] relative w-[250.475px]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 250.475 496.954">
              <path clipRule="evenodd" d={svgPaths.p15fa4aa0} fill="var(--fill-0, #4E8149)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[682.409px] items-center justify-center left-[-108px] top-[445px] w-[736px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[61.65deg]">
          <div className="h-[589.552px] relative w-[457.331px]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 457.331 589.552">
              <path clipRule="evenodd" d={svgPaths.pbc29900} fill="var(--fill-0, #4E8149)" fillRule="evenodd" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex gap-[154px] h-[66px] items-center justify-center left-0 pb-[19px] pt-[21px] px-[16px] top-0 w-[393px]" data-name="Status bar - iPhone">
        <Time />
        <Levels />
      </div>
      <p className="absolute font-['Aleo:Bold',sans-serif] font-bold h-[75px] leading-[normal] left-[20px] text-[36px] text-white top-[129px] w-[330px] whitespace-pre-wrap">Create account</p>
      <Frame />
      <p className="absolute font-['Aleo:Bold',sans-serif] font-bold h-[25px] leading-[normal] left-[50px] text-[19px] text-white top-[230px] w-[226px] whitespace-pre-wrap">Email/Phone number</p>
      <Frame1 />
      <Frame2 />
      <p className="absolute font-['Aleo:Bold',sans-serif] font-bold h-[26px] leading-[normal] left-[48px] text-[19px] text-white top-[355px] w-[176px] whitespace-pre-wrap">Password</p>
      <Frame3 />
      <p className="absolute font-['Aleo:Bold',sans-serif] font-bold h-[23px] leading-[normal] left-[48px] text-[19px] text-white top-[474px] w-[160px] whitespace-pre-wrap">Repeat password</p>
      <div className="absolute flex h-[678.71px] items-center justify-center left-[-210px] top-[581px] w-[696.042px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[-65.82deg]">
          <div className="h-[537.253px] relative w-[502.778px]" data-name="Vector">
            <div className="absolute inset-[0_-0.8%_-1.49%_-0.8%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 510.778 545.253">
                <g filter="url(#filter0_d_19_489)" id="Vector">
                  <path clipRule="evenodd" d={svgPaths.p13a5b00} fill="var(--fill-0, #21825C)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="545.253" id="filter0_d_19_489" width="510.778" x="3.4265e-08" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_19_489" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_19_489" mode="normal" result="shape" />
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
      <div className="absolute bg-[#f67c01] border-4 border-solid border-white h-[27px] left-[306px] rounded-[29px] top-[803px] w-[69px]" />
      <div className="absolute left-[349px] size-[19px] top-[807px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
          <circle cx="9.5" cy="9.5" fill="var(--fill-0, #FFFCFC)" id="Ellipse 2" r="9.5" />
        </svg>
      </div>
    </div>
  );
}