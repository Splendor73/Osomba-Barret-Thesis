import svgPaths from "./svg-71iur0bkv0";
import imgLogos181 from "figma:asset/3972aedd9c639dce2d6932028c4a0bee6fa569eb.png";
import imgIconClean12 from "figma:asset/8db656f50ab3e38ec2bd76601e1dcb46c066d4ba.png";
import imgIconClean22 from "figma:asset/32aadd9be88a54df0ab834f7432d60f12e3eb1cb.png";
import imgIconClean32 from "figma:asset/ef1da7f36b2a9d7af94a52facd76c8490114fde0.png";
import imgIconClean42 from "figma:asset/a26dfcb757f97f852807f7faceb51f442b7ff92c.png";

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
  return (
    <div className="-translate-x-1/2 absolute bg-[#0f9400] h-[37px] left-[calc(50%+0.5px)] overflow-clip rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[776px] w-[342px]">
      <p className="-translate-x-1/2 absolute font-['Days_One:Regular',sans-serif] h-[35px] leading-[normal] left-1/2 not-italic text-[19px] text-center text-white top-[7px] w-[176px] whitespace-pre-wrap">Continue</p>
    </div>
  );
}

export default function IPhone() {
  return (
    <div className="bg-[#f67c01] relative size-full" data-name="iPhone 16 - 12">
      <div className="absolute flex h-[860.895px] items-center justify-center left-[-180px] top-[138px] w-[960px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[74.76deg]">
          <div className="h-[812.194px] relative w-[671.024px]" data-name="Vector">
            <div className="absolute inset-[0_-0.6%_-0.98%_-0.6%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 679.024 820.194">
                <g filter="url(#filter0_dd_19_447)" id="Vector">
                  <path clipRule="evenodd" d={svgPaths.p3e7f99f0} fill="var(--fill-0, #32742C)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="820.194" id="filter0_dd_19_447" width="679.024" x="9.43937e-08" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_19_447" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="effect1_dropShadow_19_447" mode="normal" result="effect2_dropShadow_19_447" />
                    <feBlend in="SourceGraphic" in2="effect2_dropShadow_19_447" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[366px] left-[-99px] top-[733px] w-[621px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 621 366">
          <path clipRule="evenodd" d={svgPaths.p32dfc900} fill="var(--fill-0, #F67C01)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
      <div className="absolute h-[531px] left-[-1474px] top-[598px] w-[628px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 628 531">
          <path clipRule="evenodd" d={svgPaths.p643800} fill="var(--fill-0, #F67C01)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
      <div className="absolute flex h-[659.566px] items-center justify-center left-[-151px] top-[-473px] w-[628.223px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="flex-none rotate-[-102.89deg]">
          <div className="h-[516.687px] relative w-[558.38px]" data-name="Vector">
            <div className="absolute inset-[0_-0.72%_-1.55%_-0.72%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 566.38 524.687">
                <g filter="url(#filter0_d_19_445)" id="Vector">
                  <path clipRule="evenodd" d={svgPaths.p28e24980} fill="var(--fill-0, #32742C)" fillRule="evenodd" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="524.687" id="filter0_d_19_445" width="566.38" x="2.73759e-08" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_19_445" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_19_445" mode="normal" result="shape" />
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
      <div className="-translate-x-1/2 absolute left-1/2 size-[293px] top-[118px]" data-name="LOGOS(18) 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogos181} />
      </div>
      <div className="absolute h-[68px] left-[24px] top-[351px] w-[50px]" data-name="icon_clean_1 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconClean12} />
      </div>
      <div className="absolute h-[70px] left-[22px] top-[447px] w-[54px]" data-name="icon_clean_2 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconClean22} />
      </div>
      <div className="absolute h-[72px] left-[20px] top-[552px] w-[59px]" data-name="icon_clean_3 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconClean32} />
      </div>
      <div className="absolute h-[62px] left-[20px] top-[652px] w-[61px]" data-name="icon_clean_4 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconClean42} />
      </div>
      <p className="absolute font-['Aleo:Regular',sans-serif] font-normal h-[131px] leading-[0] left-[86px] text-[0px] text-white top-[351px] w-[291px] whitespace-pre-wrap">
        <span className="leading-[99.8550033569336%] text-[20px]">Track your orders</span>
        <span className="leading-[normal] text-[20px]">
          <br aria-hidden="true" />
        </span>
        <span className="leading-[normal] text-[18px]">{`Check order status and track, change, or return items you've purchased.`}</span>
      </p>
      <p className="absolute font-['Aleo:Regular',sans-serif] font-normal h-[131px] leading-[0] left-[86px] text-[0px] text-white top-[445px] w-[291px] whitespace-pre-wrap">
        <span className="leading-[99.8550033569336%] text-[20px]">Shop from your favorites</span>
        <span className="leading-[normal] text-[20px]">
          <br aria-hidden="true" />
        </span>
        <span className="leading-[normal] text-[18px]">Browse past purchases and discover everyday essentials from local sellers.</span>
      </p>
      <p className="absolute font-['Aleo:Regular',sans-serif] font-normal h-[131px] leading-[0] left-[86px] text-[0px] text-white top-[547px] w-[291px] whitespace-pre-wrap">
        <span className="leading-[99.8550033569336%] text-[20px]">Save your items</span>
        <span className="leading-[normal] text-[20px]">
          <br aria-hidden="true" />
        </span>
        <span className="leading-[normal] text-[18px]">Create lists with the items you want — for now or later.</span>
      </p>
      <p className="absolute font-['Aleo:Regular',sans-serif] font-normal h-[131px] leading-[0] left-[86px] text-[0px] text-white top-[652px] w-[291px] whitespace-pre-wrap">
        <span className="leading-[99.8550033569336%] text-[20px]">Open your own Boutique</span>
        <span className="leading-[normal] text-[20px]">
          <br aria-hidden="true" />
        </span>
        <span className="leading-[normal] text-[18px]">Create your online boutique and start selling locally with Osomba.</span>
      </p>
      <div className="absolute bg-[#f67c01] border-4 border-solid border-white h-[27px] left-[296px] rounded-[29px] top-[57px] w-[69px]" />
      <div className="absolute left-[339px] size-[19px] top-[61px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
          <circle cx="9.5" cy="9.5" fill="var(--fill-0, #FFFCFC)" id="Ellipse 2" r="9.5" />
        </svg>
      </div>
    </div>
  );
}