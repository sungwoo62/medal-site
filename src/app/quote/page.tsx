'use client'

import { useState } from 'react'
import { Send, Paperclip, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

/* ─── 옵션 정의 ─── */
const PLATING_OPTIONS = [
  { key: '쏠트', label: '쏠트', color: '#D4AF37' },
  { key: '니켈', label: '니켈', color: '#C0C0C0' },
  { key: '동', label: '동', color: '#B87333' },
  { key: '신주니브시', label: '신주니브시', color: '#D4AF37', nibushi: '#2A2520' },
  { key: '은니브시', label: '은니브시', color: '#C0C0C0', nibushi: '#2A2A2E' },
  { key: '동니브시', label: '동니브시', color: '#B87333', nibushi: '#2A2018' },
  { key: '쏠트무광', label: '쏠트무광', color: '#C8A030', matte: true },
  { key: '니켈무광', label: '니켈무광', color: '#A8A8A8', matte: true },
  { key: '동무광', label: '동무광', color: '#A06030', matte: true },
  { key: '크리스탈', label: '크리스탈', color: '#E8EEF4', crystal: true },
] as const

const PAINT_OPTIONS = [
  { key: '칠없음', label: '칠없음' },
  { key: '일반칠', label: '일반칠' },
  { key: '칠+에폭', label: '칠+에폭' },
  { key: '인쇄', label: '인쇄' },
] as const

const RING_OPTIONS = [
  { key: '일반고리', label: '일반고리' },
  { key: '사각고리', label: '사각고리' },
] as const

const LANYARD_OPTIONS = [
  { key: '일반끈', label: '일반끈' },
  { key: '목걸이끈', label: '목걸이끈' },
  { key: '커스텀디자인요청', label: '커스텀 디자인' },
  { key: '없음', label: '없음' },
] as const

const PACKAGING_OPTIONS = [
  { key: '기본포장', label: '기본포장' },
  { key: '쇼핑백', label: '쇼핑백' },
  { key: '케이스', label: '케이스' },
  { key: '고급케이스', label: '고급 케이스' },
] as const

const MEDAL_TYPES = ['마라톤', '체육대회', '시상식', '기업행사', '기타']

const STEPS = [
  { key: 'plating', title: '도금', subtitle: '메달의 색상과 질감' },
  { key: 'paint', title: '칠', subtitle: '표면 처리 방식' },
  { key: 'ring', title: '고리', subtitle: '상단 고리 모양' },
  { key: 'lanyard', title: '메달끈', subtitle: '목에 거는 끈' },
  { key: 'packaging', title: '포장', subtitle: '완성품 포장 방식' },
] as const

type MedalOptions = {
  plating: string
  paint: string
  ring: string
  lanyard: string
  packaging: string
}

type QuoteForm = {
  event_name: string
  medal_type: string
  quantity: string
  desired_date: string
  note: string
  contact_name: string
  contact_phone: string
  contact_email: string
}

const EMPTY_FORM: QuoteForm = {
  event_name: '',
  medal_type: '마라톤',
  quantity: '',
  desired_date: '',
  note: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
}

const DEFAULT_OPTIONS: MedalOptions = {
  plating: '쏠트',
  paint: '칠없음',
  ring: '일반고리',
  lanyard: '일반끈',
  packaging: '기본포장',
}

/* ─── 방사선 각도 생성 ─── */
const RADIAL_ANGLES = Array.from({ length: 16 }, (_, i) => (i * 360) / 16)

/* ─── SVG 미리보기 ─── */
function MedalPreview({ options }: { options: MedalOptions }) {
  const plating = PLATING_OPTIONS.find((p) => p.key === options.plating) ?? PLATING_OPTIONS[0]
  const isNibushi = 'nibushi' in plating && !!plating.nibushi
  const isMatte = 'matte' in plating && !!plating.matte
  const isCrystal = 'crystal' in plating && !!plating.crystal

  const baseColor = isNibushi ? plating.nibushi! : plating.color
  const accentColor = plating.color

  // 칠 레이어 결정
  const showPlain = options.paint === '칠없음' && !isNibushi && !isCrystal
  const showPaint = options.paint === '일반칠'
  const showEpoxy = options.paint === '칠+에폭'
  const showPrint = options.paint === '인쇄'
  const showCrystalLayer = isCrystal
  const showNibrisiLayer = isNibushi

  return (
    <svg viewBox="0 0 240 340" className="w-full max-w-[240px] mx-auto drop-shadow-lg">
      <defs>
        {/* 유광 강한 방사형 */}
        <radialGradient id="glossy" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
        </radialGradient>

        {/* 무광 부드러운 확산 */}
        <radialGradient id="matte-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.06" />
        </radialGradient>

        {/* 니브시 어두운 배경 3종 */}
        <radialGradient id="nibrisi" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#3a3020" />
          <stop offset="100%" stopColor="#1a1510" />
        </radialGradient>
        <radialGradient id="nibrisi-silver" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#38383e" />
          <stop offset="100%" stopColor="#1a1a1e" />
        </radialGradient>
        <radialGradient id="nibrisi-copper" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#3a2818" />
          <stop offset="100%" stopColor="#1a1008" />
        </radialGradient>

        {/* 에폭 강한 유리 반사 */}
        <radialGradient id="epoxy-shine" cx="35%" cy="28%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.88" />
          <stop offset="35%" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.02" />
        </radialGradient>

        {/* 크리스탈 투명 유리 */}
        <radialGradient id="crystal-base" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f0f5fa" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#d8e4f0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c0d0e0" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id="crystal-shine" cx="32%" cy="28%" r="40%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* 메달 클리핑 */}
        <clipPath id="mc"><circle cx="120" cy="190" r="72" /></clipPath>

        {/* 포장 패턴 */}
        <pattern id="bag-stripe" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#8B7355" />
          <rect width="4" height="8" fill="#7a6548" />
        </pattern>
        <pattern id="paper-texture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#e8dcc8" />
          <circle cx="3" cy="3" r="0.5" fill="#d8ccb8" />
        </pattern>
        <pattern id="suede-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#2a2420" />
          <rect x="1" y="1" width="2" height="2" fill="#302a24" opacity="0.5" />
        </pattern>
      </defs>

      {/* ── 포장 배경 (메달 뒤) ── */}
      <PackagingBg packaging={options.packaging} />

      {/* ── 끈 ── */}
      <LanyardSvg lanyard={options.lanyard} />

      {/* ── 고리 ── */}
      {options.ring === '사각고리' ? (
        <rect x="107" y="112" width="26" height="16" rx="0" fill={baseColor} stroke={accentColor} strokeWidth="2" />
      ) : (
        <ellipse cx="120" cy="120" rx="14" ry="10" fill="none" stroke={baseColor} strokeWidth="5.5" />
      )}

      {/* ── 메달 본체 ── */}
      <circle cx="120" cy="190" r="72" fill={baseColor} />

      {/* ── 엠보 디테일 (clipPath) ── */}
      <g clipPath="url(#mc)" opacity="0.13">
        {/* 방사선 16개 */}
        {RADIAL_ANGLES.map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x2 = 120 + Math.cos(rad) * 80
          const y2 = 190 + Math.sin(rad) * 80
          return <line key={angle} x1="120" y1="190" x2={x2} y2={y2} stroke="#000" strokeWidth="0.7" />
        })}
        {/* 동심원 */}
        <circle cx="120" cy="190" r="70" fill="none" stroke="#000" strokeWidth="0.7" />
        <circle cx="120" cy="190" r="58" fill="none" stroke="#000" strokeWidth="0.7" />
        <circle cx="120" cy="190" r="44" fill="none" stroke="#000" strokeWidth="0.7" />
        {/* 월계수 */}
        <ellipse cx="68" cy="200" rx="8" ry="18" fill="none" stroke="#000" strokeWidth="0.7" />
        <ellipse cx="172" cy="200" rx="8" ry="18" fill="none" stroke="#000" strokeWidth="0.7" />
        {/* 중앙 "상" 텍스트 아웃라인 */}
        <text x="120" y="198" textAnchor="middle" fontSize="28" fontWeight="bold" fill="none" stroke="#000" strokeWidth="0.8">
          상
        </text>
      </g>

      {/* ── 칠없음 (금속광택만) ── */}
      {showPlain && (
        <g clipPath="url(#mc)">
          <circle cx="120" cy="190" r="72" fill="url(#glossy)" />
          <ellipse cx="105" cy="168" rx="32" ry="18" fill="#fff" opacity="0.45" />
        </g>
      )}

      {/* ── 일반칠 ── */}
      {showPaint && (
        <g clipPath="url(#mc)">
          <circle cx="120" cy="190" r="60" fill="#c0392b" />
          <circle cx="120" cy="190" r="60" fill="none" stroke={baseColor} strokeWidth="12" opacity="0.3" />
          <circle cx="120" cy="190" r="60" fill="url(#matte-grad)" />
          <ellipse cx="105" cy="170" rx="28" ry="14" fill="#fff" opacity="0.18" />
        </g>
      )}

      {/* ── 칠+에폭 ── */}
      {showEpoxy && (
        <g clipPath="url(#mc)">
          <circle cx="120" cy="190" r="60" fill="#1f618d" />
          <text x="120" y="185" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#D4AF37" opacity="0.9">
            MoF
          </text>
          <text x="120" y="205" textAnchor="middle" fontSize="6" fontWeight="600" fill="#D4AF37" opacity="0.65" letterSpacing="1.5">
            MEDAL OF FINISHER
          </text>
          <ellipse cx="108" cy="166" rx="34" ry="20" fill="url(#epoxy-shine)" opacity="0.88" />
          {/* 측면 굴절 */}
          <ellipse cx="148" cy="210" rx="8" ry="22" fill="#fff" opacity="0.08" transform="rotate(-20 148 210)" />
        </g>
      )}

      {/* ── 크리스탈 ── */}
      {showCrystalLayer && (
        <g clipPath="url(#mc)">
          <circle cx="120" cy="190" r="72" fill="url(#crystal-base)" />
          {/* MoF 투영 (반투명 황금색) */}
          <text x="120" y="194" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#c8a030" opacity="0.38">
            MoF
          </text>
          {/* 다이아몬드 패턴 */}
          {[-20, 0, 20].map((dx) =>
            [-15, 5, 25].map((dy) => (
              <polygon
                key={`${dx}-${dy}`}
                points={`${120 + dx},${183 + dy} ${126 + dx},${190 + dy} ${120 + dx},${197 + dy} ${114 + dx},${190 + dy}`}
                fill="none"
                stroke="#a0b8d0"
                strokeWidth="0.3"
                opacity="0.25"
              />
            ))
          )}
          <circle cx="120" cy="190" r="72" fill="url(#crystal-shine)" />
          {/* 테두리 굴절선 */}
          <circle cx="120" cy="190" r="70" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.35" />
          <circle cx="120" cy="190" r="68" fill="none" stroke="#c0d0e0" strokeWidth="0.4" opacity="0.25" />
        </g>
      )}

      {/* ── 인쇄 ── */}
      {showPrint && (
        <g clipPath="url(#mc)">
          <circle cx="120" cy="190" r="60" fill="#1a2a3a" />
          <text x="120" y="178" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F59E0B" opacity="0.9">
            Medal of
          </text>
          <text x="120" y="196" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#EF4444" opacity="0.95">
            FINISHER
          </text>
          <text x="120" y="212" textAnchor="middle" fontSize="6" fill="#7dd3fc" opacity="0.7" letterSpacing="2">
            ★ 2025 ★
          </text>
          {/* 코팅 광택 */}
          <ellipse cx="106" cy="170" rx="30" ry="16" fill="#fff" opacity="0.12" />
        </g>
      )}

      {/* ── 니브시 ── */}
      {showNibrisiLayer && (
        <g clipPath="url(#mc)">
          {plating.key === '신주니브시' && <circle cx="120" cy="190" r="72" fill="url(#nibrisi)" />}
          {plating.key === '은니브시' && <circle cx="120" cy="190" r="72" fill="url(#nibrisi-silver)" />}
          {plating.key === '동니브시' && <circle cx="120" cy="190" r="72" fill="url(#nibrisi-copper)" />}
          <text x="120" y="186" textAnchor="middle" fontSize="26" fontWeight="bold" fill={accentColor} opacity="0.85">
            상
          </text>
          <text x="120" y="210" textAnchor="middle" fontSize="7" fontWeight="600" fill={accentColor} opacity="0.55" letterSpacing="2">
            MEDAL OF FINISHER
          </text>
          <ellipse cx="108" cy="168" rx="30" ry="16" fill="#fff" opacity="0.06" />
        </g>
      )}

      {/* ── 무광 오버레이 ── */}
      {isMatte && (
        <g clipPath="url(#mc)">
          <circle cx="120" cy="190" r="72" fill="url(#matte-grad)" />
          <circle cx="120" cy="190" r="72" fill="#888" opacity="0.08" />
        </g>
      )}

      {/* 금속 테두리 (항상 표시) */}
      <circle cx="120" cy="190" r="72" fill="none" stroke={accentColor} strokeWidth="1.2" opacity="0.5" />
      <circle cx="120" cy="190" r="70" fill="none" stroke={accentColor} strokeWidth="0.4" opacity="0.25" />
    </svg>
  )
}

function PackagingBg({ packaging }: { packaging: string }) {
  if (packaging === '쇼핑백') return (
    <g opacity="0.25">
      <rect x="68" y="126" width="104" height="136" rx="3" fill="url(#bag-stripe)" />
      {/* 손잡이 구멍 */}
      <rect x="90" y="130" width="12" height="4" rx="2" fill="#5a4a38" />
      <rect x="138" y="130" width="12" height="4" rx="2" fill="#5a4a38" />
      {/* 금색 끈 */}
      <path d="M96,132 Q96,124 104,124 Q112,124 112,132" fill="none" stroke="#c8a030" strokeWidth="1" />
      <path d="M128,132 Q128,124 136,124 Q144,124 144,132" fill="none" stroke="#c8a030" strokeWidth="1" />
    </g>
  )

  if (packaging === '케이스') return (
    <g opacity="0.22">
      <rect x="52" y="122" width="136" height="136" rx="6" fill="url(#paper-texture)" stroke="#bba888" strokeWidth="1" />
      {/* 리본 */}
      <rect x="116" y="122" width="8" height="136" fill="#c0392b" opacity="0.4" />
      <rect x="52" y="186" width="136" height="8" fill="#c0392b" opacity="0.4" />
      {/* 윈도우 */}
      <ellipse cx="120" cy="170" rx="24" ry="20" fill="#fff" opacity="0.3" />
    </g>
  )

  if (packaging === '고급케이스') return (
    <g opacity="0.3">
      <rect x="52" y="122" width="136" height="136" rx="6" fill="url(#suede-texture)" stroke="#8B7355" strokeWidth="2" />
      {/* 금장 힌지 */}
      <rect x="54" y="152" width="4" height="10" rx="1" fill="#c8a030" />
      <rect x="54" y="218" width="4" height="10" rx="1" fill="#c8a030" />
      {/* 잠금 장치 */}
      <rect x="183" y="185" width="6" height="12" rx="1.5" fill="#c8a030" />
      <circle cx="186" cy="191" r="1.5" fill="#a08020" />
      {/* 금박 로고 */}
      <text x="120" y="250" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#c8a030" opacity="0.6" letterSpacing="2">
        MEDAL OF FINISHER
      </text>
      {/* 내부 패딩 테두리 */}
      <rect x="58" y="128" width="124" height="124" rx="4" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />
    </g>
  )

  return null
}

function LanyardSvg({ lanyard }: { lanyard: string }) {
  if (lanyard === '없음') return <g opacity="0" />

  if (lanyard === '일반끈') return (
    <g>
      <rect x="98" y="8" width="18" height="112" rx="1" fill="#c0392b" />
      <rect x="124" y="8" width="18" height="112" rx="1" fill="#2c3e50" />
      {/* 금속 연결부 */}
      <rect x="96" y="112" width="48" height="6" rx="1" fill="#aaa" opacity="0.5" />
    </g>
  )

  if (lanyard === '목걸이끈') return (
    <g>
      <rect x="101" y="8" width="38" height="112" rx="1" fill="#2c3e50" />
      {/* 금속 연결부 */}
      <rect x="99" y="112" width="42" height="6" rx="1" fill="#aaa" opacity="0.5" />
    </g>
  )

  if (lanyard === '커스텀디자인요청') return (
    <g>
      <rect x="101" y="8" width="38" height="112" rx="1" fill="#f0f0f0" stroke="#c8a030" strokeWidth="1.5" />
      {[38, 54, 70, 86, 102, 118].map((y) => (
        <text key={y} x="120" y={y} textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#c8a030" opacity="0.75">
          MoF
        </text>
      ))}
      {/* 금속 연결부 */}
      <rect x="99" y="112" width="42" height="6" rx="1" fill="#c8a030" opacity="0.5" />
    </g>
  )

  return <g opacity="0" />
}

/* ─── 스텝 선택 UI ─── */
function StepSelector({
  step, options, onChange,
}: {
  step: number
  options: MedalOptions
  onChange: (key: keyof MedalOptions, value: string) => void
}) {
  const optionSets: Record<string, readonly { key: string; label: string }[]> = {
    plating: PLATING_OPTIONS,
    paint: PAINT_OPTIONS,
    ring: RING_OPTIONS,
    lanyard: LANYARD_OPTIONS,
    packaging: PACKAGING_OPTIONS,
  }

  const currentStep = STEPS[step]
  const currentOptions = optionSets[currentStep.key]
  const currentValue = options[currentStep.key as keyof MedalOptions]

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {currentOptions.map((opt) => {
          const selected = currentValue === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(currentStep.key as keyof MedalOptions, opt.key)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                selected
                  ? 'border-rose bg-rose/5 text-rose ring-2 ring-rose/20'
                  : 'border-border bg-white text-charcoal hover:border-rose/30'
              }`}
            >
              {/* 도금 옵션에 색상 프리뷰 */}
              {currentStep.key === 'plating' && (
                <span
                  className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle border border-black/10"
                  style={{ backgroundColor: PLATING_OPTIONS.find((p) => p.key === opt.key)?.color }}
                />
              )}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── 메인 페이지 ─── */
export default function QuotePage() {
  const [step, setStep] = useState(0)
  const [options, setOptions] = useState<MedalOptions>(DEFAULT_OPTIONS)
  const [form, setForm] = useState<QuoteForm>(EMPTY_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const setOpt = (key: keyof MedalOptions, value: string) => setOptions({ ...options, [key]: value })
  const setField = (key: keyof QuoteForm, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.event_name.trim() || !form.contact_name.trim() || !form.contact_phone.trim()) {
      setError('행사명, 이름, 연락처는 필수입니다.')
      return
    }
    setSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      // 메달 옵션 추가
      Object.entries(options).forEach(([key, value]) => formData.append(`medal_${key}`, value))
      if (file) formData.append('file', file)

      const res = await fetch('/api/quote', { method: 'POST', body: formData })
      const data = await res.json().catch(() => null)

      setSubmitting(false)
      if (!res.ok) {
        setError(data?.error || '전송에 실패했습니다. 다시 시도해 주세요.')
        return
      }
      setDone(true)
    } catch {
      setSubmitting(false)
      setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16 bg-warm-white">
        <div className="text-center anim-fade-up">
          <CheckCircle2 size={52} className="text-rose mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">견적이 접수되었습니다</h2>
          <p className="text-charcoal-light text-sm mb-8">1-2 영업일 내 연락드리겠습니다.</p>
          <button
            onClick={() => { setDone(false); setForm(EMPTY_FORM); setFile(null); setOptions(DEFAULT_OPTIONS); setStep(0) }}
            className="px-6 py-2.5 border border-rose text-rose rounded-full hover:bg-rose/5 transition-colors text-sm font-semibold"
          >
            새 견적 신청
          </button>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-border text-charcoal text-sm placeholder-charcoal-light/40 focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/10 transition-all'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-5xl mx-auto">
        {/* 타이틀 */}
        <div className="text-center mb-10">
          <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Medal Customizer</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">견적 신청</h1>
          <p className="text-charcoal-light text-sm">메달 옵션을 선택하고 견적을 요청하세요.</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === step
                  ? 'bg-rose text-white'
                  : i < step
                    ? 'bg-rose/10 text-rose'
                    : 'bg-gray-100 text-charcoal-light'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        {/* 미리보기 + 스텝 선택 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* 왼쪽: SVG 미리보기 */}
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-border p-8">
            <MedalPreview options={options} />
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] text-charcoal-light">
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">{options.plating}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">{options.paint}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">{options.ring}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">{options.lanyard}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">{options.packaging}</span>
            </div>
          </div>

          {/* 오른쪽: 스텝 선택 */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-charcoal">
                Step {step + 1}. {STEPS[step].title}
              </h2>
              <p className="text-xs text-charcoal-light mt-1">{STEPS[step].subtitle}을 선택하세요.</p>
            </div>

            <StepSelector step={step} options={options} onChange={setOpt} />

            {/* 이전/다음 버튼 */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1 px-4 py-2 text-sm text-charcoal-light hover:text-charcoal disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} /> 이전
              </button>
              <button
                type="button"
                onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                disabled={step === STEPS.length - 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-rose hover:text-rose-dark disabled:opacity-30 transition-colors"
              >
                다음 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 하단: 견적 신청 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-bold text-charcoal mb-1">견적 정보</h2>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              행사명 <span className="text-rose">*</span>
            </label>
            <input type="text" placeholder="예: 2025 서울마라톤" value={form.event_name} onChange={(e) => setField('event_name', e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">메달 종류</label>
              <select value={form.medal_type} onChange={(e) => setField('medal_type', e.target.value)} className={inputClass}>
                {MEDAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">수량</label>
              <input type="number" min="1" placeholder="예: 500" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">희망 납기일</label>
              <input type="date" value={form.desired_date} onChange={(e) => setField('desired_date', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">요청사항</label>
            <textarea rows={3} placeholder="디자인 참고 사항, 소재 선호, 특이사항 등을 적어주세요." value={form.note} onChange={(e) => setField('note', e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">참고 파일</label>
            <label className={`flex items-center gap-2 ${inputClass} cursor-pointer hover:border-rose/40`}>
              <Paperclip size={15} className="text-rose/50" />
              <span className="truncate text-charcoal-light/50">{file ? file.name : '디자인 시안, 로고 파일 등'}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-4">연락처 정보</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">이름 <span className="text-rose">*</span></label>
                <input type="text" value={form.contact_name} onChange={(e) => setField('contact_name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">연락처 <span className="text-rose">*</span></label>
                <input type="tel" placeholder="010-0000-0000" value={form.contact_phone} onChange={(e) => setField('contact_phone', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-charcoal mb-1.5">이메일</label>
              <input type="email" placeholder="example@email.com" value={form.contact_email} onChange={(e) => setField('contact_email', e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* 선택한 옵션 요약 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">선택한 메달 옵션</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-rose/10 text-rose rounded-full font-medium">{options.plating}</span>
              <span className="px-2.5 py-1 bg-rose/10 text-rose rounded-full font-medium">{options.paint}</span>
              <span className="px-2.5 py-1 bg-rose/10 text-rose rounded-full font-medium">{options.ring}</span>
              <span className="px-2.5 py-1 bg-rose/10 text-rose rounded-full font-medium">{options.lanyard}</span>
              <span className="px-2.5 py-1 bg-rose/10 text-rose rounded-full font-medium">{options.packaging}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 transition-all text-sm"
          >
            <Send size={15} />
            {submitting ? '전송 중...' : '견적 신청하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
