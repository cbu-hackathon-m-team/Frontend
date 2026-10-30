import type { ReactNode } from "react";
import styles from "./landing-product-artwork.module.css";

export type ArtworkKind =
  | "versions"
  | "requests"
  | "evidence"
  | "tests"
  | "isolation"
  | "packages"
  | "notification"
  | "analysis"
  | "history"
  | "stock"
  | "payment"
  | "json"
  | "ignored";

function Frame({
  label,
  children,
  tall = false,
  compact = false,
}: {
  label: string;
  children: ReactNode;
  tall?: boolean;
  compact?: boolean;
}) {
  return (
    <svg
      className={`${styles.artwork} ${compact ? styles.compact : ""}`}
      viewBox={tall ? "0 0 400 480" : "0 0 400 240"}
      role="img"
      aria-label={label}
      fill="none"
    >
      <title>{label}</title>
      {children}
    </svg>
  );
}
function Window({
  x,
  y,
  width,
  height,
  title,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className={styles.panel} width={width} height={height} rx="8" />
      <path className={styles.line} d={`M0 34H${width}`} />
      <circle className={styles.dot} cx="14" cy="17" r="2" />
      <text className={styles.label} x="26" y="21">
        {title}
      </text>
      {children}
    </g>
  );
}
function Check({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className={styles.success}>
      <circle r="8" stroke="currentColor" />
      <path d="m-3 0 2 2 4-4" stroke="currentColor" />
    </g>
  );
}

export function ProductArtwork({
  kind,
  label,
}: {
  kind: ArtworkKind;
  label: string;
}) {
  switch (kind) {
    case "versions":
      return (
        <Frame label={label}>
          <path className={styles.line} d="M200 38v30m-108 20V68h216v20" />
          <rect
            className={styles.chip}
            x="139"
            y="12"
            width="122"
            height="30"
            rx="15"
          />
          <text className={styles.code} x="200" y="31" textAnchor="middle">
            같은 SHA / main
          </text>
          <Window x={22} y={88} width={166} height={126} title="기존 버전 A">
            <text className={styles.code} x="18" y="64">
              pydantic
            </text>
            <text className={styles.number} x="18" y="96">
              1.10.24
            </text>
          </Window>
          <Window x={212} y={88} width={166} height={126} title="새 버전 B">
            <text className={styles.code} x="18" y="64">
              pydantic
            </text>
            <text className={styles.number} x="18" y="96">
              2.12.5
            </text>
          </Window>
          <path className={styles.line} d="M188 151h24m-6-5 6 5-6 5" />
        </Frame>
      );
    case "requests":
      return (
        <Frame label={label}>
          <Window
            x={22}
            y={19}
            width={356}
            height={204}
            title="POST /orders · 실행 비교"
          >
            <path className={styles.line} d="M39 73h278M39 145h278" />
            <text className={styles.label} x="18" y="61">
              기존 A
            </text>
            <text className={styles.label} x="18" y="133">
              후보 B
            </text>
            <rect
              className={styles.chip}
              x="27"
              y="73"
              width="120"
              height="39"
              rx="5"
            />
            <rect
              className={styles.chip}
              x="209"
              y="73"
              width="120"
              height="39"
              rx="5"
            />
            <rect
              className={styles.chip}
              x="27"
              y="145"
              width="120"
              height="39"
              rx="5"
            />
            <rect
              className={styles.dangerPanel}
              x="209"
              y="145"
              width="120"
              height="39"
              rx="5"
            />
            <text className={styles.greenText} x="52" y="98">
              HTTP 200
            </text>
            <text className={styles.code} x="232" y="98">
              배송 1회
            </text>
            <text className={styles.greenText} x="52" y="170">
              HTTP 200
            </text>
            <text className={styles.redText} x="232" y="170">
              배송 0회
            </text>
            <path
              className={styles.line}
              d="M150 92h55m-6-5 6 5-6 5M150 164h55m-6-5 6 5-6 5"
            />
          </Window>
        </Frame>
      );
    case "evidence":
      return (
        <Frame label={label}>
          <Window x={78} y={10} width={292} height={132} title="uv.lock" />
          <Window x={28} y={48} width={292} height={130} title="pyproject.toml">
            <text className={styles.redText} x="20" y="70">− pydantic==1.10.24</text>
            <text className={styles.greenText} x="20" y="102">+ pydantic==2.12.5</text>
          </Window>
          <path className={styles.line} d="M174 178v17" strokeDasharray="3 3" />
          <rect className={styles.chip} x="28" y="195" width="292" height="32" rx="5" />
          <text className={styles.label} x="42" y="215">실제 설치</text>
          <text className={styles.code} x="126" y="215">pydantic 2.12.5</text>
          <Check x={302} y={211} />
        </Frame>
      );
    case "tests":
      return (
        <Frame label={label}>
          <Window
            x={36}
            y={18}
            width={328}
            height={204}
            title="정상 주문 · 승인할 기대값"
          >
            {[
              { y: 66, text: "HTTP 상태", value: "200" },
              { y: 109, text: "응답의 남은 재고", value: "8" },
              { y: 152, text: "배송 API 요청", value: "1회" },
            ].map((item) => (
              <g key={item.text}>
                <rect
                  className={styles.chip}
                  x="17"
                  y={item.y - 14}
                  width="17"
                  height="17"
                  rx="3"
                />
                <path className={styles.line} d={`m21 ${item.y - 6} 3 3 6-7`} />
                <text className={styles.label} x="47" y={item.y}>
                  {item.text}
                </text>
                <text
                  className={styles.code}
                  x="302"
                  y={item.y}
                  textAnchor="end"
                >
                  {item.value}
                </text>
              </g>
            ))}
            <path className={styles.line} d="M18 83h292M18 126h292" />
          </Window>
        </Frame>
      );
    case "isolation":
      return (
        <Frame label={label}>
          <g transform="translate(200 116)">
            <path
              className={styles.layerBack}
              d="m0-86 130 66v34L0 80-130 14v-34Z"
            />
            <path
              className={styles.layerFront}
              d="m0-58 130 66v34L0 108-130 42V8Z"
            />
            <path className={styles.layerTop} d="m0-58 130 66L0 74-130 8Z" />
            <path className={styles.line} d="M0 74v34" />
            <path className={styles.line} d="m-88 4 88 45 88-45M-44-18l88 45" />
            <rect
              className={styles.chip}
              x="-38"
              y="-31"
              width="76"
              height="32"
              rx="6"
            />
            <text className={styles.code} x="0" y="-10" textAnchor="middle">
              A / B
            </text>
          </g>
        </Frame>
      );
    case "packages":
      return (
        <Frame label={label}>
          <path
            className={styles.line}
            d="M90 55v122m0-89h100m-100 44h100m-100 44h100"
          />
          <rect
            className={styles.chip}
            x="36"
            y="21"
            width="147"
            height="35"
            rx="6"
          />
          <text className={styles.code} x="52" y="43">
            pydantic
          </text>
          {["pydantic-core", "typing-extensions", "annotated-types"].map(
            (name, i) => (
              <g key={name}>
                <circle className={styles.dot} cx="90" cy={88 + i * 44} r="3" />
                <rect
                  className={styles.panel}
                  x="185"
                  y={69 + i * 44}
                  width="181"
                  height="36"
                  rx="5"
                />
                <text className={styles.code} x="199" y={92 + i * 44}>
                  {name}
                </text>
              </g>
            ),
          )}
        </Frame>
      );
    case "notification":
      return (
        <Frame label={label}>
          <rect
            className={styles.panel}
            x="77"
            y="26"
            width="246"
            height="174"
            rx="8"
          />
          <text className={styles.heading} x="99" y="60">
            검증 결과
          </text>
          <rect
            className={styles.dangerPanel}
            x="99"
            y="79"
            width="98"
            height="25"
            rx="5"
          />
          <text className={styles.redText} x="110" y="97">
            업무 기준 위반
          </text>
          <path className={styles.skeleton} d="M100 123h197M100 143h138" />
          <path
            className={styles.layerFront}
            d="m42 118 158 73 158-73v91a12 12 0 0 1-12 12H54a12 12 0 0 1-12-12Z"
          />
          <path className={styles.line} d="m42 216 111-76m205 76-111-76" />
        </Frame>
      );
    case "analysis":
      return (
        <Frame label={label}>
          <Window x={18} y={44} width={164} height={146} title="확인된 기록">
            <text className={styles.code} x="16" y="67">
              HTTP 200
            </text>
            <text className={styles.redText} x="16" y="101">
              배송 요청 0회
            </text>
            <path className={styles.skeleton} d="M18 123h106" />
          </Window>
          <path
            className={styles.line}
            d="M182 117h36m-6-5 6 5-6 5"
            strokeDasharray="4 4"
          />
          <Window x={218} y={44} width={164} height={146} title="원인 후보">
            <text className={styles.label} x="16" y="67">
              의존성 동작 변화
            </text>
            <path
              className={styles.skeleton}
              d="M18 90h125M18 111h98M18 132h118"
            />
          </Window>
        </Frame>
      );
    case "history":
      return (
        <Frame label={label}>
          {[
            { x: 64, y: 24 },
            { x: 49, y: 43 },
            { x: 34, y: 62 },
          ].map((p, i) => (
            <g key={p.x} opacity={i === 0 ? 0.35 : i === 1 ? 0.65 : 1}>
              <Window
                x={p.x}
                y={p.y}
                width={298}
                height={152}
                title="실행 기록"
              >
                <text className={styles.code} x="20" y="64">
                  EXAMPLE-001
                </text>
                <path className={styles.skeleton} d="M22 86h189M22 109h144" />
                <Check x={270} y={66} />
              </Window>
            </g>
          ))}
        </Frame>
      );
    case "stock":
      return (
        <Frame label={label} compact>
          <text className={styles.label} x="44" y="49">
            주문 2개 · 재고 10개
          </text>
          {Array.from({ length: 10 }, (_, i) => (
            <rect
              key={i}
              className={i < 8 ? styles.stockUnit : styles.removedUnit}
              x={44 + (i % 5) * 64}
              y={76 + Math.floor(i / 5) * 51}
              width="49"
              height="37"
              rx="4"
            />
          ))}
          <text className={styles.code} x="200" y="213" textAnchor="middle">
            stock_after: 8
          </text>
        </Frame>
      );
    case "payment":
      return (
        <Frame label={label} compact>
          <path className={styles.line} d="M96 113h208" strokeDasharray="4 5" />
          <rect
            className={styles.panel}
            x="24"
            y="63"
            width="139"
            height="99"
            rx="8"
          />
          <rect
            className={styles.panel}
            x="237"
            y="63"
            width="139"
            height="99"
            rx="8"
          />
          <text className={styles.label} x="93" y="96" textAnchor="middle">
            paid
          </text>
          <text className={styles.number} x="93" y="132" textAnchor="middle">
            false
          </text>
          <text className={styles.label} x="307" y="96" textAnchor="middle">
            배송 요청
          </text>
          <text className={styles.number} x="307" y="132" textAnchor="middle">
            0회
          </text>
          <circle className={styles.chip} cx="200" cy="113" r="15" />
          <path className={styles.line} d="m195 108 10 10m0-10-10 10" />
        </Frame>
      );
    case "json":
      return (
        <Frame label={label} compact>
          <Window x={28} y={27} width={344} height={186} title="JSON 응답">
            <text className={styles.code} x="24" y="69">
              {"{"}
            </text>
            <text className={styles.code} x="45" y="102">
              "stock_after": 8,
            </text>
            <text className={styles.code} x="45" y="135">
              "order_id": "T01"
            </text>
            <text className={styles.code} x="24" y="168">
              {"}"}
            </text>
            <Check x={311} y={98} />
          </Window>
        </Frame>
      );
    case "ignored":
      return (
        <Frame label={label} compact>
          <Window x={28} y={27} width={344} height={186} title="비교할 필드">
            <text className={styles.code} x="22" y="72">
              stock_after
            </text>
            <Check x={310} y={67} />
            <text className={styles.code} x="22" y="115">
              order_id
            </text>
            <Check x={310} y={110} />
            <text className={styles.mutedText} x="22" y="158">
              timestamp
            </text>
            <path className={styles.line} d="M22 153h115M302 153h16" />
            <path className={styles.line} d="M20 89h304M20 132h304" />
          </Window>
        </Frame>
      );
  }
}

export function ProductScreenshot({
  kind,
  label,
}: {
  kind: "comparison" | "build";
  label: string;
}) {
  return (
    <div className={styles.screenshot}>
      <img
        className={styles.lightShot}
        src={`/images/ossguard/${kind}-light.jpg`}
        alt={label}
        loading="lazy"
        width={kind === "comparison" ? 875 : 1120}
        height={kind === "comparison" ? 292 : 419}
      />
      <img
        className={styles.darkShot}
        src={`/images/ossguard/${kind}-dark.jpg`}
        alt={label}
        loading="lazy"
        width={kind === "comparison" ? 875 : 1120}
        height={kind === "comparison" ? 292 : 419}
      />
    </div>
  );
}
